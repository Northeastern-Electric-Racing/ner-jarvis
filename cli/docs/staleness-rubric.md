# Staleness rubric

What `ner-flag-stale` and `ner-jarvis stale add --dimension=<1-8>` mean by "stale".

A page is stale when **both** hold: a reader could mistake it for current, **and**
acting on it would be wrong. Age alone doesn't count, and a page that describes how
something used to be built is history, not staleness.

## The 8 dimensions

1. **Leadership currency** — heads/leads/CSE in docs vs live roster + GitHub committers.
2. **Org-structure currency** — doc team/track boundaries vs roster subteams; merges/renames/new/dissolved; cross-page contradictions.
3. **Doc recency & completeness** — lastModified age, year-stamped titles, empty/"ask your lead" pages, a track with no landing branch.
4. **Glossary ⇄ GitHub drift (both ways)** — active repos missing from the glossary; glossary repos gone/archived/renamed; description/language/"empty-new" drift.
5. **Dead links & version drift** — docs pointing at gone repos/channels/tools; stale version pins; baked-in bug workarounds.
6. **Slack channel currency** — doc-named channels archived/renamed; live channels no doc mentions.
7. **Onboarding-path viability** — a coherent, current, stack-appropriate getting-started path, or a dead-end / borrowed one.
8. **Shipped grounding-truth drift** — `CLAUDE.md`, `roster.json`, skill glossary vs live.

Open findings against this rubric: [`staleness-backlog.md`](staleness-backlog.md).
