# Contributing

Pick the task you came here for. Each section stands on its own.

## Add your team's onboarding pages

Every team gets a row in the "Start here" table in `context/README.md`, and
`/ner-onboard` sends new members of that team to these pages first.

1. Add an `onboarding` entry to your subteam in
   [`context/skills/ner-roster/roster.json`](context/skills/ner-roster/roster.json):
   ```json
   "onboarding": { "start": "https://nerdocs.atlassian.net/wiki/…", "faq": "https://…" }
   ```
   `faq` is optional.
2. Regenerate the table: `cd cli && bun run sync:context`.
3. Open a PR. CI fails if the table and the roster disagree.

## Edit a skill or the member context

Skills live in [`context/skills/`](context/skills/README.md), one folder per skill
with a `SKILL.md`. The context workspace's instructions are in
[`context/CLAUDE.md`](context/CLAUDE.md).

- Point at sources. Don't copy facts: the skills look up people, repos, and docs live,
  so nothing checked in goes stale.
- `disable-model-invocation: true` in a skill's frontmatter makes it run only when
  someone types `/<name>` (`ner-onboard` does this).
- Members get your change after the next release and `ner-jarvis update`. The
  context workspace (`ner-jarvis open`) updates as soon as your PR merges.

### How `context/` reaches members

Branch **`context-workspace`** has `context/` as its root. Members clone only that branch, so
their clone holds just the context files and none of the maintainer files at this
repo's root. `sync-context-workspace.yml` keeps the two in sync on every push to `main` or
`context-workspace`, using the same two subtree merges as Delphi:

- **refresh:** main → `context-workspace`.
- **propose:** `context-workspace` → a `propose/context-workspace` PR into `main`, checked first.

You can edit on either side. If a sync reports a conflict, merge `main` into
`context-workspace` in a PR. `.github/workflows/sync-context-workspace.yml` has an identical copy at
`context/.github/workflows/` (CI checks they match), because GitHub runs a push's
workflow from the pushed branch.

## Work on the CLI

```sh
cd cli
bun install
bun run embed    # bundle ../context/skills + sources.json into the build
bun test
```

- [`cli/behavior.md`](cli/behavior.md) is the spec for commands, the setup wizard,
  state, and exit codes. Change it in the same PR as the behavior.
- Data sources are declared in [`cli/sources.json`](cli/sources.json).
- Why things are the way they are: [`cli/docs/adr/`](cli/docs/adr/). Vocabulary:
  [`cli/CONTEXT.md`](cli/CONTEXT.md).
- Any change to a persisted shape (state, undo records) needs a migration. A schema
  guard test fails CI if one is missing.

## Cut a release

1. Bump `version` in `cli/package.json` and merge.
2. Tag the merge commit and push the tag: `git tag v0.1.3 && git push origin v0.1.3`.
3. `release.yml` builds five binaries and attaches them to the GitHub release.
   The npm publish is skipped until an `NPM_TOKEN` repo secret is set.

## Track stale docs

Open findings about NER docs that drifted are in
[`cli/docs/staleness-backlog.md`](cli/docs/staleness-backlog.md), scored with the
[staleness rubric](cli/docs/staleness-rubric.md).
