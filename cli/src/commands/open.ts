import type { EmbeddedPayload } from "../types";
import { autoPrompter, type Prompter } from "../core/prompt";
import { type RunResult } from "../core/claude";
import {
  cloneWorkspace as realClone,
  openClaude as realOpen,
  pullWorkspace as realPull,
  readWorkspacePath as realReadPath,
  recordWorkspacePath as realRecord,
  resolveWorkspaceDest,
  workspaceStatus as realWsStatus,
  type CloneResult,
  type WorkspaceStatus,
} from "../core/workspace";

export interface OpenOpts {
  dryRun: boolean;
}

/** Side-effecting collaborators, injectable for tests. Real defaults used in prod. */
export interface OpenDeps {
  prompter?: Prompter;
  cloneWorkspace?: (repo: string, dest: string) => CloneResult;
  workspaceStatus?: (dest: string) => WorkspaceStatus;
  pullWorkspace?: (dest: string) => { ok: boolean; error?: string };
  openClaude?: (dir: string) => RunResult;
  readWorkspacePath?: () => string | undefined;
  recordWorkspacePath?: (dest: string) => void;
  cwd?: string;
}

export interface OpenResult {
  ok: boolean;
  dest?: string;
  messages: string[];
}

/**
 * `ner-jarvis open`: get the member into the context workspace in one step. Finds
 * the workspace setup recorded (or asks where to put it), clones it if missing,
 * fast-forwards it when that's safe (behind origin AND clean — `--ff-only`, so local
 * work is never touched), then launches Claude Code there. Any other git state is
 * reported and the workspace is opened as-is.
 */
export function open(payload: EmbeddedPayload, opts: OpenOpts, deps: OpenDeps = {}): OpenResult {
  const ws = payload.workspace;
  if (!ws) return { ok: false, messages: ["this build declares no workspace to open"] };

  const prompter = deps.prompter ?? autoPrompter();
  const recorded = (deps.readWorkspacePath ?? realReadPath)();
  const dest = recorded ?? resolveWorkspaceDest(
    prompter.askPath(`Where should the ${ws.dirName} workspace live?`, deps.cwd ?? process.cwd()),
    ws.dirName,
  );

  if (opts.dryRun) {
    return { ok: true, dest, messages: [`[dry-run] would clone or fast-forward ${ws.repo} at ${dest}, then open Claude Code there`] };
  }

  const messages: string[] = [];
  const status = (deps.workspaceStatus ?? realWsStatus)(dest);
  if (status.state === "absent") {
    const clone = (deps.cloneWorkspace ?? realClone)(ws.repo, dest);
    if (!clone.ok && !clone.skipped) return { ok: false, dest, messages: [clone.error ?? "clone failed"] };
    messages.push(`cloned ${ws.repo} → ${dest}`);
  } else if (status.state === "behind-clean") {
    const r = (deps.pullWorkspace ?? realPull)(dest);
    messages.push(r.ok ? `pulled ${status.behind} new commit${status.behind === 1 ? "" : "s"}` : `⚠ ${r.error ?? "pull failed"} — opening as-is`);
  } else if (status.state !== "up-to-date") {
    messages.push(`⚠ workspace is ${status.state} — opening as-is (run \`git pull\` yourself when ready)`);
  }

  (deps.recordWorkspacePath ?? realRecord)(dest);
  for (const m of messages) console.log(m);
  (deps.openClaude ?? realOpen)(dest);
  return { ok: true, dest, messages };
}
