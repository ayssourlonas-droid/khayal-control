#!/usr/bin/env bash
# Point git at the versioned hooks in .githooks/. Run once per clone.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
chmod +x .githooks/pre-commit .githooks/commit-msg .githooks/pre-push
git config core.hooksPath .githooks
echo "Hooks installed: pre-commit (tests), commit-msg (Conventional Commits), pre-push (owner lock, protected branches)."
