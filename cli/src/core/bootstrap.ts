import { spawnSync } from "node:child_process";
import { delimiter, join } from "node:path";
import { homedir } from "node:os";
import { isClaudeAvailable } from "./claude";

/**
 * Install Claude Code itself when `claude` is missing, via **Anthropic's official
 * native installer** — the same one-liner the Claude Code docs give:
 *
 *   macOS / Linux:  curl -fsSL https://claude.ai/install.sh | bash
 *   Windows:        irm https://claude.ai/install.ps1 | iex
 *
 * We never vendor or pin the binary; the installer picks the right build, verifies
 * its checksum, and keeps it auto-updating. It lands in `~/.local/bin/claude`
 * (`%USERPROFILE%\.local\bin\claude.exe` on Windows).
 *
 * The installer only edits the user's shell profile for *future* shells, so this
 * process's PATH doesn't see the new binary. We prepend `~/.local/bin` to
 * `process.env.PATH` (every spawn passes `env: process.env`) so the rest of setup —
 * plugin installs, `claude mcp …`, opening the workspace — finds it without a restart.
 *
 * Claude Code is the host, not something ner-jarvis owns: this is never journaled for
 * undo and `uninstall` never removes it.
 */

export const INSTALL_SH = "https://claude.ai/install.sh";
export const INSTALL_PS1 = "https://claude.ai/install.ps1";

export interface InstallClaudeResult { ok: boolean; error?: string; }

function home(): string { return process.env.HOME || process.env.USERPROFILE || homedir(); }

/** Where the native installer puts `claude`. */
export const claudeBinDir = (): string => join(home(), ".local", "bin");

/** The command we run, shown to the user before they confirm. */
export function installerCommand(platform = process.platform): { bin: string; args: string[]; display: string } {
  if (platform === "win32") {
    const script = `irm ${INSTALL_PS1} | iex`;
    return { bin: "powershell", args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], display: script };
  }
  const script = `curl -fsSL ${INSTALL_SH} | bash`;
  return { bin: "bash", args: ["-c", script], display: script };
}

/** Prepend `dir` to PATH (idempotent). Windows env keys are case-insensitive but Node exposes `Path`. */
export function prependPath(dir: string, env: NodeJS.ProcessEnv = process.env): void {
  const key = Object.keys(env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
  const parts = (env[key] ?? "").split(delimiter).filter(Boolean);
  if (!parts.includes(dir)) env[key] = [dir, ...parts].join(delimiter);
}

/**
 * Run the official installer with inherited stdio (its progress + any errors go
 * straight to the user), then make `claude` resolvable in this process and confirm
 * it runs. Never throws.
 */
export function installClaudeCode(): InstallClaudeResult {
  const cmd = installerCommand();
  const r = spawnSync(cmd.bin, cmd.args, { stdio: "inherit", env: process.env });
  if (r.error) return { ok: false, error: `couldn't run the installer (${cmd.bin}): ${r.error.message}` };
  if (r.status !== 0) return { ok: false, error: `the Claude Code installer exited with status ${r.status ?? "unknown"}` };
  prependPath(claudeBinDir());
  if (!isClaudeAvailable()) {
    return { ok: false, error: `installed, but \`claude\` still isn't runnable — open a new terminal and re-run ner-jarvis` };
  }
  return { ok: true };
}
