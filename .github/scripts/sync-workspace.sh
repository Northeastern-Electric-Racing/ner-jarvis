#!/usr/bin/env bash
# .github/scripts/sync-workspace.sh [refresh|propose]: keep context/ on main in sync with branch
# ws/context, whose repo root is that folder. Same model as Delphi's ci/sync.sh. CI runs it with no
# direction (both) on every push to main or ws/context.
#   refresh: merge main into ws/context (-Xsubtree=context) and push if the tree changed. A missing
#            ws/context is created as one commit: tree = context/, parent = main.
#   propose: build propose/context = main + a subtree merge of ws/context; if that changes main and
#            isn't already on propose/context, check it, force-push it, and open or update its PR.
# A conflict is reported with its files and exits 1. Merges run in a temporary worktree.
set -euo pipefail
dir=both
case "${1:-}" in refresh | propose) dir=$1 ;; "") ;; *) echo "usage: $0 [refresh|propose]" >&2 && exit 2 ;; esac
name=context folder=context

git fetch --quiet --prune origin
main=$(git rev-parse origin/main)
wt=$(mktemp -d)
git worktree add --quiet --detach "$wt" "$main"
trap 'git worktree remove --force "$wt"' EXIT
tree() { git -C "$wt" rev-parse --quiet --verify "$1^{tree}" || true; } # empty if <rev> is missing

conflict() { # <message>: report the conflicted files, abort the merge, fail
  echo "$1 Files:" >&2
  git -C "$wt" diff --name-only --diff-filter=U | sed 's/^/  /' >&2
  git -C "$wt" merge --abort 2>/dev/null || true
  exit 1
}

check() { # the same gates CI runs on a PR (PRs opened with GITHUB_TOKEN trigger no workflows)
  local log
  log=$(mktemp)
  (cd "$wt/cli" && bun install && bun run sync:context --check && bun run embed && bun test --timeout 30000) >"$log" 2>&1 ||
    { tail -40 "$log" >&2 && return 1; }
}

ws=refs/remotes/origin/ws/$name
if [ "$dir" != propose ]; then
  if [ -z "$(tree "$ws")" ]; then
    git -C "$wt" checkout --quiet --detach \
      "$(git commit-tree -p "$main" -m "sync: create ws/$name from $folder" "$main:$folder")"
    git -C "$wt" push --quiet origin "HEAD:refs/heads/ws/$name"
    echo "ws/$name: created from $folder"
  else
    git -C "$wt" checkout --quiet --detach "$ws"
    # --no-ff: once ws commits are in main, a fast-forward would put main's whole tree on ws/<name>.
    git -C "$wt" merge --quiet --no-ff -Xsubtree="$folder" -m "sync: refresh ws/$name from main" "$main" >/dev/null ||
      conflict "ws/$name: CONFLICT refreshing from main; merge main into ws/$name in a PR."
    if [ "$(tree HEAD)" != "$(tree "$ws")" ]; then
      git -C "$wt" push --quiet origin "HEAD:refs/heads/ws/$name"
      echo "ws/$name: refreshed"
    fi
  fi
else
  [ -n "$(tree "$ws")" ] || { echo "ws/$name doesn't exist yet; run refresh first" >&2 && exit 1; }
  git -C "$wt" checkout --quiet --detach "$ws"
fi
[ "$dir" != refresh ] || exit 0

head=$(git -C "$wt" rev-parse HEAD)
git -C "$wt" checkout --quiet --detach "$main"
git -C "$wt" merge --quiet --no-ff -Xsubtree="$folder" -m "sync: propose ws/$name to main" "$head" >/dev/null ||
  conflict "ws/$name: CONFLICT proposing to main; merge main into ws/$name in a PR."
case "$(tree HEAD)" in "$(tree "$main")" | "$(tree "refs/remotes/origin/propose/$name")") exit 0 ;; esac
check || { echo "ws/$name: check failed; not proposed" >&2 && exit 1; }
git -C "$wt" push --quiet --force origin "HEAD:refs/heads/propose/$name"
title="ws/$name → main"
body="Proposes \`ws/$name\` into \`$folder/\` (opened by .github/scripts/sync-workspace.sh).

Changed files:
$(git -C "$wt" diff --name-only "$main" HEAD | sed 's/^/- /')

Workspace commits:
$(git log --no-merges --invert-grep --grep='^sync: ' --format='- %s (%an)' "$main..$head")"
pr=$(gh pr list --base main --head "propose/$name" --state open --json number --jq '.[0].number // empty')
if [ -n "$pr" ]; then
  gh pr edit "$pr" --title "$title" --body "$body" >/dev/null
else
  gh pr create --base main --head "propose/$name" --title "$title" --body "$body" >/dev/null
fi
echo "ws/$name: proposed (PR from propose/$name)"
