# NER skills

`ner-jarvis setup` installs these into `~/.claude/skills/`.

| Skill | What it does |
|-------|--------------|
| `ner-onboard` | Orients a new member: finds their team's onboarding pages and a first ticket. Runs only when someone types `/ner-onboard`. |
| `ner-ask` | Answers questions about NER software, grounded and cited. |
| `ner-repo-explainer` | Explains one repo: purpose, entry points, owners, related repos. |
| `ner-escalation-router` | Says who to ask, or which channel to post in. |
| `ner-setup` | Connects Atlassian, Slack, and GitHub, and checks they work. |
| `ner-flag-stale` | Records a doc that misled you, for `ner-jarvis stale export`. |
| `ner-roster` | The org roster (`roster.json`) the other skills read for structure. |

The skills point at sources rather than copying facts: they look up people, repos,
and docs live in Confluence, GitHub, and Slack. The only checked-in facts are
`ner-roster/roster.json` and `ner-ask/reference.md`. Both are dated, and both get
reconciled against live sources.

To change a skill, see [Contributing](https://github.com/Northeastern-Electric-Racing/ner-jarvis/blob/main/CONTRIBUTING.md#edit-a-skill-or-the-member-context).
