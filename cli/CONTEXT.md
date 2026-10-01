# Vocabulary

Shared terms for this project. Decisions and their reasons are in [`docs/adr/`](docs/adr/).

**Skills**:
The Claude Code skills in `context/skills/` that answer NER questions by pointing at
live Confluence, GitHub, and Slack. ner-jarvis installs them into `~/.claude/skills/`.
_Avoid_: bundle, plugin, pack (the old Claude-Desktop ZIP "Bundle" was retired)

**Payload**:
Everything a ner-jarvis build ships: `context/skills/` plus `cli/sources.json`,
embedded at build time. A release is one payload version.

**Source**:
A data connection the skills depend on, declared in `cli/sources.json`. Slack and
Atlassian are Claude Code plugins. GitHub is reached through the `gh` CLI, so it isn't
installed as a source.

**Workspace**:
The `ws/context` branch of `ner-jarvis`, whose root is the `context/` folder. `ner-jarvis
open` clones only that branch (into `ner-context/`) and opens Claude Code there.
_Avoid_: context repo (the old `ner-jarvis-context` mirror is retired)

**Onboardee**:
A new NER software-team member working through their first contributions. The persona
for `ner-onboard`. The other skills serve any member.
_Avoid_: new member (ambiguous with non-software NER members), newcomer

**Track**:
A software subteam as `ner-onboard` presents it: FinishLine, Application Software,
Firmware, or Software Product today, with Simulation coming later. The skills read the
list from the roster instead of enumerating it. Launchpad is a learning program, not a
Track.
_Avoid_: side, discipline

**Car**:
The NER race car as a complete system spanning firmware, electrical, mechanical, and
telemetry. Onboarding skills surface these cross-discipline relationships; general
Q&A skills don't need a car-wide view.
_Avoid_: vehicle, system
