import { test, expect } from "bun:test";
import { loadPayload, validatePayload } from "./payload";

test("loadPayload returns the 6 invokable skills + ner-roster data dir, with validated sources", () => {
  const p = loadPayload();
  expect(p.skills.length).toBe(7);

  // The 6 real skills are invokable (each has a SKILL.md); ner-roster ships data only.
  const invokable = p.skills.filter(s => s.name !== "ner-roster");
  expect(invokable.length).toBe(6);
  expect(invokable.every(s => s.files.some(f => f.path.endsWith("SKILL.md")))).toBe(true);

  const roster = p.skills.find(s => s.name === "ner-roster");
  expect(roster?.files.some(f => f.path === "roster.json")).toBe(true);
  expect(roster?.files.some(f => f.path.endsWith("SKILL.md"))).toBe(false); // data, not an invokable skill

  for (const src of p.sources) expect(["plugin", "mcp"]).toContain(src.type);
  expect(p.version).toMatch(/\d+\.\d+\.\d+/);
});

test("validatePayload rejects a malformed source", () => {
  expect(() => validatePayload({ version: "1.0.0", skills: [], marketplaces: [],
    sources: [{ name: "x", type: "mcp" }] as any })).toThrow();
});

test("loadPayload exposes the context workspace, dirName, and branch", () => {
  const p = loadPayload();
  expect(p.contextWorkspace?.repo).toMatch(/Northeastern-Electric-Racing\/ner-jarvis\.git$/);
  expect(p.contextWorkspace?.dirName).toBe("ner-context-workspace");
  expect(p.contextWorkspace?.branch).toBe("context-workspace");
});

test("validatePayload rejects a context workspace missing repo", () => {
  expect(() => validatePayload({ version: "1.0.0", skills: [], marketplaces: [], sources: [],
    contextWorkspace: { dirName: "x" } as any })).toThrow();
});
