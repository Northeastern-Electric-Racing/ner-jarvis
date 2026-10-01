import { dirname } from "node:path";
import type { EmbeddedPayload } from "../types";
import { autoPrompter, type Prompter } from "../core/prompt";
import { type RunResult } from "../core/claude";
import {
  cloneContextRepo as realClone,
  openClaude as realOpen,
  pullContextRepo as realPull,
  readContextRepoPath as realReadPath,
  recordContextRepoPath as realRecord,
  repoSlug,
  resolveContextRepoDest,
  contextRepoOrigin as realOrigin,
  contextRepoStatus as realWsStatus,
  type CloneResult,
  type ContextRepoStatus,
} from "../core/context-repo";

export interface OpenOpts {
  dryRun: boolean;
}

/** Side-effecting collaborators, injectable for tests. Real defaults used in prod. */
export interface OpenDeps {
  prompter?: Prompter;
  cloneContextRepo?: (repo: string, dest: string, branch?: string) => CloneResult;
  contextRepoStatus?: (dest: string) => ContextRepoStatus;
  pullContextRepo?: (dest: string) => { ok: boolean; error?: string };
  openClaude?: (dir: string) => RunResult;
  readContextRepoPath?: () => string | undefined;
  contextRepoOrigin?: (dest: string) => string | undefined;
  recordContextRepoPath?: (dest: string) => void;
  cwd?: string;
}

export interface OpenResult {
  ok: boolean;
  dest?: string;
  messages: string[];
}

/**
 * `ner-jarvis open`: get the member into the context repo in one step. Finds
 * the context repo setup recorded (or asks where to put it), clones it if missing,
 * fast-forwards it when that's safe (behind origin AND clean — `--ff-only`, so local
 * work is never touched), then launches Claude Code there. Any other git state is
 * reported and the context repo is opened as-is.
 */
export function open(payload: EmbeddedPayload, opts: OpenOpts, deps: OpenDeps = {}): OpenResult {
  const ws = payload.contextRepo;
  if (!ws) return { ok: false, messages: ["this build declares no context repo to open"] };

  const prompter = deps.prompter ?? autoPrompter();
  const messages: string[] = [];
  let recorded = (deps.readContextRepoPath ?? realReadPath)();
  // A recorded clone of a different repo (the retired ner-jarvis-context mirror) has unrelated
  // history, so it can't be pulled forward: leave it alone and clone the current context repo beside it.
  const origin = recorded ? (deps.contextRepoOrigin ?? realOrigin)(recorded) : undefined;
  if (recorded && origin && repoSlug(origin) !== repoSlug(ws.repo)) {
    messages.push(`${recorded} is an old context repo (${repoSlug(origin)}); you can delete it`);
    recorded = resolveContextRepoDest(dirname(recorded), ws.dirName);
  }
  const dest = recorded ?? resolveContextRepoDest(
    prompter.askPath(`Where should the ${ws.dirName} context repo live?`, deps.cwd ?? process.cwd()),
    ws.dirName,
  );

  if (opts.dryRun) {
    return { ok: true, dest, messages: [...messages, `[dry-run] would clone or fast-forward ${ws.repo}${ws.branch ? ` (${ws.branch})` : ""} at ${dest}, then open Claude Code there`] };
  }

  const status = (deps.contextRepoStatus ?? realWsStatus)(dest);
  if (status.state === "absent") {
    const clone = (deps.cloneContextRepo ?? realClone)(ws.repo, dest, ws.branch);
    if (!clone.ok && !clone.skipped) return { ok: false, dest, messages: [...messages, clone.error ?? "clone failed"] };
    messages.push(`cloned ${ws.repo} → ${dest}`);
  } else if (status.state === "behind-clean") {
    const r = (deps.pullContextRepo ?? realPull)(dest);
    messages.push(r.ok ? `pulled ${status.behind} new commit${status.behind === 1 ? "" : "s"}` : `⚠ ${r.error ?? "pull failed"} — opening as-is`);
  } else if (status.state !== "up-to-date") {
    messages.push(`⚠ context repo is ${status.state} — opening as-is (run \`git pull\` yourself when ready)`);
  }

  (deps.recordContextRepoPath ?? realRecord)(dest);
  for (const m of messages) console.log(m);
  (deps.openClaude ?? realOpen)(dest);
  return { ok: true, dest, messages };
}
