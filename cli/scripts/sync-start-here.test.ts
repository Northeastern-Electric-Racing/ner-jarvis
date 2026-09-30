import { test, expect } from "bun:test";
import { BEGIN, END, renderTable, withTable } from "./sync-start-here";

const roster = {
  areas: [
    {
      area: "Software",
      subteams: [
        { name: "FinishLine" },
        { name: "Application Software", onboarding: { start: "https://x/start", faq: "https://x/faq" } },
        { name: "Firmware", onboarding: { start: "https://y/start" } },
      ],
    },
  ],
};

test("renderTable lists only subteams with onboarding pages, dashing a missing FAQ", () => {
  expect(renderTable(roster)).toBe(
    [
      "| Team | Onboarding | FAQ |",
      "|---|---|---|",
      "| Application Software | [Start here](https://x/start) | [FAQ](https://x/faq) |",
      "| Firmware | [Start here](https://y/start) | — |",
    ].join("\n"),
  );
});

test("withTable replaces only the marked block and is idempotent", () => {
  const readme = `# hi\n\n${BEGIN}\nold\n${END}\n\nafter\n`;
  const once = withTable(readme, "NEW");
  expect(once).toBe(`# hi\n\n${BEGIN}\nNEW\n${END}\n\nafter\n`);
  expect(withTable(once, "NEW")).toBe(once);
});

test("withTable throws when the markers are missing", () => {
  expect(() => withTable("# no markers\n", "NEW")).toThrow();
});

test("withTable keeps CRLF line endings (Windows checkout)", () => {
  const readme = `# hi\r\n${BEGIN}\r\nold\r\n${END}\r\n`;
  expect(withTable(readme, "a\nb")).toBe(`# hi\r\n${BEGIN}\r\na\r\nb\r\n${END}\r\n`);
});
