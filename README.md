# ner-jarvis

**One command to set up Claude Code for Northeastern Electric Racing.** It installs
the NER skills, connects Slack and Atlassian, and opens Claude in a context workspace where
you can ask anything about NER software.

## Install

You don't need a GitHub account, and if you don't have Claude Code yet, setup offers
to install it.

**macOS / Linux**

```sh
case "$(uname -s)" in Darwin) os=darwin;; Linux) os=linux;; *) echo "unsupported"; exit 1;; esac
case "$(uname -m)" in arm64|aarch64) arch=arm64;; x86_64|amd64) arch=x64;; *) echo "unsupported"; exit 1;; esac
curl -fsSL -o ner-jarvis \
  "https://github.com/Northeastern-Electric-Racing/ner-jarvis/releases/latest/download/ner-jarvis-bun-$os-$arch"
chmod +x ner-jarvis && ./ner-jarvis
```

**Windows (PowerShell)**

```powershell
Invoke-WebRequest -OutFile ner-jarvis.exe `
  "https://github.com/Northeastern-Electric-Racing/ner-jarvis/releases/latest/download/ner-jarvis-bun-windows-x64.exe"
.\ner-jarvis.exe
```

Setup asks before each step. When it finishes, sign in to Slack and Atlassian (run
`/mcp` in Claude Code) and GitHub (`gh auth login`).

## Then

- **Start onboarding:** run `ner-jarvis open`, then type `/ner-onboard`.
- **Something's off:** run `ner-jarvis doctor`.

## Go deeper

| If you want to… | Read |
|---|---|
| Find your team's onboarding pages | [`context/README.md`](context/README.md) |
| See every command, flag, and troubleshooting step | [`cli/README.md`](cli/README.md) |
| Add your team, edit a skill, or cut a release | [`CONTRIBUTING.md`](CONTRIBUTING.md) |

## What's in this repo

| Folder | For | What's in it |
|---|---|---|
| [`context/`](context/) | Members | Everything Claude needs to answer NER questions: `CLAUDE.md` and the NER [skills](context/skills/). Members clone it as the [`context-workspace`](https://github.com/Northeastern-Electric-Racing/ner-jarvis/tree/context-workspace) branch. |
| [`cli/`](cli/) | Maintainers | The `ner-jarvis` installer. Its build embeds `context/skills/`. |
