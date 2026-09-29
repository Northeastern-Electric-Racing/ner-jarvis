# NER onboarding workspace

Home base for a new Northeastern Electric Racing (NER) software member. This repo is
intentionally near-empty — the real knowledge lives in the installed **NER skills**,
which resolve people, repos, and docs live, so nothing checked in here can go stale.

## Rules

- For anything NER — onboarding, dev-environment setup, understanding a repo or its
  code, conventions/docs, who owns what, how to escalate — reach for the NER skills
  rather than answering from memory, and resolve people/ownership **live**.
- New members: point them to their team's start-here and FAQ pages before answering
  from scratch. Those pages are listed in the "Start here" table in `README.md` and in
  the `onboarding` field of each subteam in the roster. For a guided walkthrough, tell
  them to run `/ner-onboard` (it's user-invoked only).
- Use the `gh` CLI for GitHub.
- NER's Confluence is mid-restructure. When a page reads as current but acting on it
  would be wrong, record it with **ner-flag-stale**. A doc describing how something
  was built before is history, not a problem — leave it be.

## Resolving ownership

Sources answer different questions. Do not mix them up:

- `roster.json` is **structure** — who nominally holds a role. It is a dated
  snapshot (`asOf`), authoritative for org taxonomy, not for who is active today.
- GitHub is **activity** — who actually commits and reviews. Activity is not a
  title, and a title is not activity.

Never state a commit, review, or recency claim you have not counted. Run the query
and cite the number; "X is the main contributor" without a count is a guess. If
structure and activity disagree, report **both with their dates** rather than
picking one — the disagreement is usually the real answer.
