#!/usr/bin/env bash
set -euo pipefail
BASE="176e1063f96e71167f8dc76b73a12d581575ad3b"
TARGET="${1:-.}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! git -C "$TARGET" rev-parse --git-dir >/dev/null 2>&1; then
  echo "Target is not a git repository: $TARGET" >&2
  exit 1
fi
HEAD="$(git -C "$TARGET" rev-parse HEAD)"
if [[ "$HEAD" != "$BASE" ]]; then
  echo "Refusing to overwrite files: target HEAD is $HEAD, expected $BASE." >&2
  echo "Rebase/cherry-pick manually if main has moved." >&2
  exit 2
fi
if [[ -n "$(git -C "$TARGET" status --porcelain)" ]]; then
  echo "Refusing to apply onto a dirty working tree." >&2
  exit 3
fi

if [[ "$(git -C "$TARGET" branch --show-current)" == "main" ]]; then
  git -C "$TARGET" switch -c feature/ethereum-tracker
fi

files=(
  .env.example
  README.md
  src/App.tsx
  src/chains/adapters.ts
  src/chains/ethereum.ts
  src/chains/ethereum.test.ts
  src/chains/validators.ts
  src/chains/validators.test.ts
  src/services/priceService.ts
  src/styles.css
  src/types/wallet.ts
  src/vite-env.d.ts
)
for file in "${files[@]}"; do
  mkdir -p "$TARGET/$(dirname "$file")"
  cp "$HERE/$file" "$TARGET/$file"
done

git -C "$TARGET" diff --check
echo
echo "Ethereum tracker applied on branch: $(git -C "$TARGET" branch --show-current)"
git -C "$TARGET" status --short
