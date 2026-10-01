# ner-jarvis CLI

The installer. Install instructions are in the [root README](../README.md). This page
covers what it does once it's running.

## Commands

```sh
ner-jarvis                 # setup: install the skills + connect sources (interactive)
ner-jarvis open            # clone or refresh the context repo, open Claude Code in it
ner-jarvis doctor          # read-only health check; non-zero exit if anything's off
ner-jarvis update          # re-apply this version's skills and sources
ner-jarvis undo            # reverse the most recent setup/update run (--list shows runs)
ner-jarvis uninstall       # remove only what ner-jarvis added
ner-jarvis roster <query>  # query the org roster: heads · head <team> · leads <team> · who <name>
ner-jarvis stale <verb>    # record docs that misled you: add · list · export · rm <id>
```

`setup`, `update`, and `doctor` accept names to scope the run (for example,
`ner-jarvis doctor github`). A scoped run never removes anything.

| Flag | Effect |
|---|---|
| `--dry-run` | Show every change; write nothing |
| `--yes`, `-y` | Answer yes to every prompt |
| `--force` | Overwrite items ner-jarvis installed that you've since edited |
| `--json` | Machine-readable output (`roster`, `stale`) |

## What it installs

- **Skills** into `~/.claude/skills/`. The list is in
  [`context/skills/`](../context/skills/README.md).
- **Slack and Atlassian** as Claude Code plugins.
- **GitHub** through the `gh` CLI. ner-jarvis checks for `gh` and tells you to run
  `gh auth login`. It never installs `gh` or signs in for you.
- **One line** in `~/.claude/CLAUDE.md` so your everyday Claude knows to use the skills.

ner-jarvis never handles your credentials. Slack and Atlassian prompt you to sign in
the first time you use them, or you can run `/mcp` in Claude Code.

## It only touches what it added

Everything ner-jarvis installs is recorded in `~/.claude/ner-jarvis/state.json`. It
skips skills or sources you added yourself, and anything of its own that you've since
edited is left alone unless you pass `--force`. Every run also writes an undo record,
so `ner-jarvis undo` reverses exactly that run. The details are in
[`behavior.md`](behavior.md) and [ADR 0004](docs/adr/0004-versioned-rollback-and-migrations.md).

## Troubleshooting

| Symptom | Fix |
|---|---|
| A skill or source looks missing | `ner-jarvis doctor`, then `ner-jarvis` to repair |
| macOS says `zsh: killed` | You have an old unsigned build. Re-download it with the install command (v0.1.2+) |
| Slack or Atlassian returns nothing | Run `/mcp` in Claude Code and sign in |
| GitHub calls fail | `gh auth login` |

## Platforms

Each release ships standalone binaries with the skills compiled in, so there's no
runtime and no network fetch at install: `darwin-arm64`, `darwin-x64`, `linux-x64`,
`linux-arm64`, and `windows-x64.exe`.
