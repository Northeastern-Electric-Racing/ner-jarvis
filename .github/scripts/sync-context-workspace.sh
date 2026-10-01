#!/usr/bin/env bash
# .github/scripts/sync-context-workspace.sh [refresh|propose]: keep context/ on main in sync with branch
# context-workspace, whose repo root is that folder. Same model as Delphi's ci/sync.sh. CI runs it with no
# direction (both) on every push to main or context-workspace.
#   refresh: merge main into context-workspace (-Xsubtree=context) and push if the tree changed. A missing
#            context-workspace is created as one commit: tree = context/, parent = main.
#   propose: build propose/context-workspace = main + a subtree merge of context-workspace; if that changes main and
#            isn't already on propose/context-workspace, check it, force-push it, and open or update its PR.
# A conflict is reported with its files and exits 1. Merges run in a temporary worktree.
set -euo pipefail
dir=both
case "${1:-}" in refresh | propose) dir=$1 ;; "") ;; *) echo "usage: $0 [refresh|propose]" >&2 && exit 2 ;; esac
branch=context-workspace folder=context

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

remote=refs/remotes/origin/$branch
if [ "$dir" != propose ]; then
  if [ -z "$(tree "$remote")" ]; then
    git -C "$wt" checkout --quiet --detach \
      "$(git commit-tree -p "$main" -m "sync: create $branch from $folder" "$main:$folder")"
    git -C "$wt" push --quiet origin "HEAD:refs/heads/$branch"
    echo "$branch: created from $folder"
  else
    git -C "$wt" checkout --quiet --detach "$remote"
    # --no-ff: once branch commits are in main, a fast-forward would put main's whole tree on <branch>.
    git -C "$wt" merge --quiet --no-ff -Xsubtree="$folder" -m "sync: refresh $branch from main" "$main" >/dev/null ||
      conflict "$branch: CONFLICT refreshing from main; merge main into $branch in a PR."
    if [ "$(tree HEAD)" != "$(tree "$remote")" ]; then
      git -C "$wt" push --quiet origin "HEAD:refs/heads/$branch"
      echo "$branch: refreshed"
    fi
  fi
else
  [ -n "$(tree "$remote")" ] || { echo "$branch doesn't exist yet; run refresh first" >&2 && exit 1; }
  git -C "$wt" checkout --quiet --detach "$remote"
fi
[ "$dir" != refresh ] || exit 0

head=$(git -C "$wt" rev-parse HEAD)
git -C "$wt" checkout --quiet --detach "$main"
git -C "$wt" merge --quiet --no-ff -Xsubtree="$folder" -m "sync: propose $branch to main" "$head" >/dev/null ||
  conflict "$branch: CONFLICT proposing to main; merge main into $branch in a PR."
case "$(tree HEAD)" in "$(tree "$main")" | "$(tree "refs/remotes/origin/propose/$branch")") exit 0 ;; esac
check || { echo "$branch: check failed; not proposed" >&2 && exit 1; }
git -C "$wt" push --quiet --force origin "HEAD:refs/heads/propose/$branch"
title="$branch → main"
body="Proposes \`$branch\` into \`$folder/\` (opened by .github/scripts/sync-context-workspace.sh).

Changed files:
$(git -C "$wt" diff --name-only "$main" HEAD | sed 's/^/- /')

Workspace commits:
$(git log --no-merges --invert-grep --grep='^sync: ' --format='- %s (%an)' "$main..$head")"
pr=$(gh pr list --base main --head "propose/$branch" --state open --json number --jq '.[0].number // empty')
if [ -n "$pr" ]; then
  gh pr edit "$pr" --title "$title" --body "$body" >/dev/null
else
  gh pr create --base main --head "propose/$branch" --title "$title" --body "$body" >/dev/null
fi
echo "$branch: proposed (PR from propose/$branch)"
