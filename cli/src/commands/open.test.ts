import { test, expect } from "bun:test";
import { join } from "node:path";
import { open, type OpenDeps } from "./open";
import type { EmbeddedPayload } from "../types";
import type { ContextRepoStatus } from "../core/context-repo";

const payload: EmbeddedPayload = {
  version: "0.0.0-test",
  skills: [],
  marketplaces: [],
  sources: [],
  contextRepo: { repo: "https://github.com/NER/ner-jarvis.git", dirName: "ner-context-repo", branch: "context-repo" },
};
const throwingPrompter = { confirm: () => { throw new Error("must not prompt"); }, askPath: () => { throw new Error("must not prompt"); } };

/** Fakes for every side effect, recording what ran. */
function fakes(status: ContextRepoStatus, over: Partial<OpenDeps> = {}) {
  const calls = { branch: [] as (string | undefined)[], clone: [] as string[], pull: [] as string[], open: [] as string[], record: [] as string[] };
  const deps: OpenDeps = {
    prompter: throwingPrompter,
    readContextRepoPath: () => "/ws/ner-context",
    contextRepoOrigin: () => "git@github.com:NER/ner-jarvis.git",
    contextRepoStatus: () => status,
    cloneContextRepo: (_r, d, b) => { calls.clone.push(d); calls.branch.push(b); return { ok: true, dest: d }; },
    pullContextRepo: (d) => { calls.pull.push(d); return { ok: true }; },
    openClaude: (d) => { calls.open.push(d); return { code: 0, stdout: "", stderr: "" }; },
    recordContextRepoPath: (d) => { calls.record.push(d); },
    ...over,
  };
  return { deps, calls };
}

test("no recorded path: asks where, clones, records, opens", () => {
  const { deps, calls } = fakes({ state: "absent" }, {
    readContextRepoPath: () => undefined,
    prompter: { confirm: () => true, askPath: () => "/home/me" },
  });
  const r = open(payload, { dryRun: false }, deps);
  expect(r.ok).toBe(true);
  const dest = join("/home/me", "ner-context-repo"); // platform separator
  expect(calls.clone).toEqual([dest]);
  expect(calls.record).toEqual([dest]);
  expect(calls.open).toEqual([dest]);
});

test("recorded + behind-clean: fast-forwards without prompting, then opens", () => {
  const { deps, calls } = fakes({ state: "behind-clean", behind: 2 });
  open(payload, { dryRun: false }, deps);
  expect(calls.clone).toEqual([]);
  expect(calls.pull).toEqual(["/ws/ner-context"]);
  expect(calls.open).toEqual(["/ws/ner-context"]);
});

test("dirty or diverged: never pulls, still opens", () => {
  for (const state of ["behind-dirty", "diverged"] as const) {
    const { deps, calls } = fakes({ state, behind: 1, ahead: 1, dirty: true });
    const r = open(payload, { dryRun: false }, deps);
    expect(calls.pull).toEqual([]);
    expect(calls.open).toEqual(["/ws/ner-context"]);
    expect(r.messages[0]).toContain(state);
  }
});

test("a failed clone opens nothing", () => {
  const { deps, calls } = fakes({ state: "absent" }, {
    cloneContextRepo: (_r, d) => ({ ok: false, dest: d, error: "git clone failed (exit 128)" }),
  });
  const r = open(payload, { dryRun: false }, deps);
  expect(r.ok).toBe(false);
  expect(calls.open).toEqual([]);
  expect(calls.record).toEqual([]);
});

test("--dry-run touches nothing", () => {
  const { deps, calls } = fakes({ state: "absent" });
  const r = open(payload, { dryRun: true }, deps);
  expect(r.ok).toBe(true);
  expect(calls).toEqual({ branch: [], clone: [], pull: [], open: [], record: [] });
});

test("clones only the context-repo branch", () => {
  const { deps, calls } = fakes({ state: "absent" });
  open(payload, { dryRun: false }, deps);
  expect(calls.branch).toEqual(["context-repo"]);
});

test("a recorded clone of another repo (the old mirror) is left alone; clones beside it", () => {
  const { deps, calls } = fakes({ state: "absent" }, {
    readContextRepoPath: () => join("/home/me", "ner-jarvis-context"),
    contextRepoOrigin: () => "https://github.com/NER/ner-jarvis-context.git",
  });
  const r = open(payload, { dryRun: false }, deps);
  const dest = join("/home/me", "ner-context-repo");
  expect(calls.clone).toEqual([dest]);
  expect(calls.record).toEqual([dest]);
  expect(r.messages[0]).toContain("old context repo");
});
