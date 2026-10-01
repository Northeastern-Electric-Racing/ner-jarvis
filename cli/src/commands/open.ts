import { dirname } from "node:path";
import type { EmbeddedPayload } from "../types";
import { autoPrompter, type Prompter } from "../core/prompt";
import { type RunResult } from "../core/claude";
import {
  cloneContextWorkspace as realClone,
  openClaude as realOpen,
  pullContextWorkspace as realPull,
  readContextWorkspacePath as realReadPath,
  recordContextWorkspacePath as realRecord,
  repoSlug,
  resolveContextWorkspaceDest,
  contextWorkspaceOrigin as realOrigin,
  contextWorkspaceStatus as realWsStatus,
  type CloneResult,
  type ContextWorkspaceStatus,
} from "../core/context-workspace";

export interface OpenOpts {
  dryRun: boolean;
}

/** Side-effecting collaborators, injectable for tests. Real defaults used in prod. */
export interface OpenDeps {
  prompter?: Prompter;
  cloneContextWorkspace?: (repo: string, dest: string, branch?: string) => CloneResult;
  contextWorkspaceStatus?: (dest: string) => ContextWorkspaceStatus;
  pullContextWorkspace?: (dest: string) => { ok: boolean; error?: string };
  openClaude?: (dir: string) => RunResult;
  readContextWorkspacePath?: () => string | undefined;
  contextWorkspaceOrigin?: (dest: string) => string | undefined;
  recordContextWorkspacePath?: (dest: string) => void;
  cwd?: string;
}

export interface OpenResult {
  ok: boolean;
  dest?: string;
  messages: string[];
}

/**
 * `ner-jarvis open`: get the member into the context workspace in one step. Finds
 * the context workspace setup recorded (or asks where to put it), clones it if missing,
 * fast-forwards it when that's safe (behind origin AND clean — `--ff-only`, so local
 * work is never touched), then launches Claude Code there. Any other git state is
 * reported and the context workspace is opened as-is.
 */
export function open(payload: EmbeddedPayload, opts: OpenOpts, deps: OpenDeps = {}): OpenResult {
  const ws = payload.contextWorkspace;
  if (!ws) return { ok: false, messages: ["this build declares no context workspace to open"] };

  const prompter = deps.prompter ?? autoPrompter();
  const messages: string[] = [];
  let recorded = (deps.readContextWorkspacePath ?? realReadPath)();
  // A recorded clone of a different repo (the retired ner-jarvis-context mirror) has unrelated
  // history, so it can't be pulled forward: leave it alone and clone the current context workspace beside it.
  const origin = recorded ? (deps.contextWorkspaceOrigin ?? realOrigin)(recorded) : undefined;
  if (recorded && origin && repoSlug(origin) !== repoSlug(ws.repo)) {
    messages.push(`${recorded} is an old context workspace (${repoSlug(origin)}); you can delete it`);
    recorded = resolveContextWorkspaceDest(dirname(recorded), ws.dirName);
  }
  const dest = recorded ?? resolveContextWorkspaceDest(
    prompter.askPath(`Where should the ${ws.dirName} context workspace live?`, deps.cwd ?? process.cwd()),
    ws.dirName,
  );

  if (opts.dryRun) {
    return { ok: true, dest, messages: [...messages, `[dry-run] would clone or fast-forward ${ws.repo}${ws.branch ? ` (${ws.branch})` : ""} at ${dest}, then open Claude Code there`] };
  }

  const status = (deps.contextWorkspaceStatus ?? realWsStatus)(dest);
  if (status.state === "absent") {
    const clone = (deps.cloneContextWorkspace ?? realClone)(ws.repo, dest, ws.branch);
    if (!clone.ok && !clone.skipped) return { ok: false, dest, messages: [...messages, clone.error ?? "clone failed"] };
    messages.push(`cloned ${ws.repo} → ${dest}`);
  } else if (status.state === "behind-clean") {
    const r = (deps.pullContextWorkspace ?? realPull)(dest);
    messages.push(r.ok ? `pulled ${status.behind} new commit${status.behind === 1 ? "" : "s"}` : `⚠ ${r.error ?? "pull failed"} — opening as-is`);
  } else if (status.state !== "up-to-date") {
    messages.push(`⚠ context workspace is ${status.state} — opening as-is (run \`git pull\` yourself when ready)`);
  }

  (deps.recordContextWorkspacePath ?? realRecord)(dest);
  for (const m of messages) console.log(m);
  (deps.openClaude ?? realOpen)(dest);
  return { ok: true, dest, messages };
}
