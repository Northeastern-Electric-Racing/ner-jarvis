# ner-jarvis-context

The **NER software onboarding workspace** — your home base while you get set up on
the software team. `ner-jarvis open` clones this repo and opens Claude Code here;
`ner-jarvis setup` installs the NER skills and data sources.

> **Read-only mirror.** This repo is published from the
> [`context/`](https://github.com/Northeastern-Electric-Racing/ner-jarvis/tree/main/context)
> folder of `ner-jarvis`. Open PRs there, not here.

It stays minimal on purpose: the skills resolve people, repos, and docs live, so
nothing here can go stale. Claude's instructions are in [`CLAUDE.md`](CLAUDE.md).

## Start here

Find your team's onboarding page. For a guided walkthrough, type `/ner-onboard` in
Claude Code.

<!-- start-here:begin (generated from roster.json — edit there) -->
| Team | Onboarding | FAQ |
|---|---|---|
| Application Software | [Start here](https://nerdocs.atlassian.net/wiki/spaces/NER/pages/2199420933) | [FAQ](https://nerdocs.atlassian.net/wiki/spaces/NER/pages/2198863891) |
<!-- start-here:end -->

Team not listed? Run `/ner-onboard` and it will find the current pages.

## Try it

> "Walk me through setting up my dev environment."
> "What does <repo> do, and who owns it?"

`ner-jarvis doctor` checks that your skills and data sources are healthy.

## When a doc is wrong

NER's Confluence is mid-restructure, so you'll hit pages that read as current and
aren't. Tell Claude and it records the page with the **ner-flag-stale** skill, or run
`ner-jarvis stale add` yourself. Reports stay on your machine
(`~/.claude/ner-jarvis/stale.jsonl`) — nothing is sent anywhere.

```bash
ner-jarvis stale list       # what you've recorded
ner-jarvis stale export     # paste-ready markdown for the team channel
```

A page counts as stale when someone could mistake it for current *and* acting on it
would be wrong.
