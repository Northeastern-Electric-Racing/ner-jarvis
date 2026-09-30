/**
 * Regenerates the "Start here" table in context/README.md from
 * context/skills/ner-roster/roster.json: every subteam with an `onboarding` entry gets a
 * row. Teams add their pages to the roster, never to the README by hand.
 *
 *   bun run sync:context           # rewrite context/README.md in place
 *   bun run sync:context --check   # exit 1 if it's out of date (CI)
 *
 * `node:` builtins only — Bun is just the runner.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RosterDoc } from "../src/core/roster";

export const BEGIN = "<!-- start-here:begin (generated from roster.json — edit there) -->";
export const END = "<!-- start-here:end -->";

// cli/scripts/ -> cli/ -> repo root
const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const ROSTER = join(repoRoot, "context", "skills", "ner-roster", "roster.json");
const README = join(repoRoot, "context", "README.md");

/** Pure: the markdown table for every subteam that declares onboarding pages. */
export function renderTable(roster: RosterDoc): string {
  const rows = (roster.areas ?? [])
    .flatMap((a) => a.subteams ?? [])
    .flatMap((s) => {
      const o = s.onboarding;
      if (!o?.start) return [];
      return [`| ${s.name} | [Start here](${o.start}) | ${o.faq ? `[FAQ](${o.faq})` : "—"} |`];
    });
  return ["| Team | Onboarding | FAQ |", "|---|---|---|", ...rows].join("\n");
}

/**
 * Pure: `readme` with the marked block replaced, keeping the file's own line endings
 * (a Windows checkout has CRLF). Throws if the markers are missing.
 */
export function withTable(readme: string, table: string): string {
  const begin = readme.indexOf(BEGIN);
  const end = readme.indexOf(END);
  if (begin === -1 || end < begin) throw new Error("context/README.md is missing the start-here markers");
  const eol = readme.includes("\r\n") ? "\r\n" : "\n";
  const block = table.split("\n").join(eol);
  return `${readme.slice(0, begin + BEGIN.length)}${eol}${block}${eol}${readme.slice(end)}`;
}

if (import.meta.main) {
  const current = readFileSync(README, "utf8");
  const next = withTable(current, renderTable(JSON.parse(readFileSync(ROSTER, "utf8"))));
  if (process.argv.includes("--check")) {
    if (next !== current) {
      console.error("context/README.md is out of date with roster.json — run `bun run sync:context`");
      process.exit(1);
    }
  } else if (next !== current) {
    writeFileSync(README, next);
    console.log("context/README.md updated");
  }
}
