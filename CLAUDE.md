# ner-jarvis — working in this repo

Two folders. Keep them separate:

- **`context/`** is member-facing: `CLAUDE.md`, `README.md`, and the NER skills
  (`skills/`, including `ner-roster/roster.json`). Branch `context-workspace` has it as its
  root. Members clone that branch with `ner-jarvis open`, so nothing at this repo's
  root (this file included) reaches them.
- **`cli/`** is the installer (Bun, `node:` builtins only). Its build embeds
  `context/skills/`.

To answer questions *about NER* rather than about this code, follow
[`context/CLAUDE.md`](context/CLAUDE.md) and the skills. Don't add NER facts here.

## Rules

- Use the `gh` CLI for GitHub.
- `context/` ⇄ `context-workspace` sync is `.github/scripts/sync-context-workspace.sh` (refresh and
  propose subtree merges, as in Delphi). Keep `.github/workflows/sync-context-workspace.yml`
  identical to `context/.github/workflows/sync-context-workspace.yml`.
- `ner-jarvis-context` is the retired mirror that v0.1.0–v0.1.2 still clone.
  `publish-context.yml` keeps it updated until it's archived. Never commit there.
- `context/README.md`'s "Start here" table is generated from `roster.json`. Edit the
  roster, then run `bun run sync:context` in `cli/`.
- `cli/behavior.md` is the authoritative spec. Update it together with any change in
  behavior.
- Persisted shapes (state, undo records) are versioned. Any change needs a migration
  (see `cli/docs/adr/0004-versioned-rollback-and-migrations.md`).
- Dev loop: `cd cli && bun install && bun run embed && bun test`.

Task guides (adding a team, editing skills, releasing) are in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## History

- This repo was `ner-jarvis-cli`. GitHub redirects the old URLs.
- `bracyw/ner-onboarding-agent` was the original home. v0.1.0's release assets and
  the retired Claude-Desktop ZIP pipeline still live there.
- `bracyw/ner-jarvis` was the context workspace's predecessor. Leave it: v0.1.0 binaries have
  that URL embedded.
- The root `.claude/skills/` holds dev tooling for this repo and is not shipped.

## Agent skills

- **Issue tracker:** GitHub issues on `Northeastern-Electric-Racing/ner-jarvis`. See
  `cli/docs/agents/issue-tracker.md`.
- **Triage labels:** `needs-triage`, `needs-info`, `ready-for-agent`,
  `ready-for-human`, `wontfix`. See `cli/docs/agents/triage-labels.md`.
- **Domain docs:** `cli/CONTEXT.md` + `cli/docs/adr/`. See `cli/docs/agents/domain.md`.
