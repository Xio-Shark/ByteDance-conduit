#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
GIT_PREFIX="$(git rev-parse --show-prefix 2>/dev/null || true)"

failures=()

add_failure() {
  failures+=("$1")
}

echo "== Pre-submission security check =="

if git status --porcelain 2>/dev/null | rg -q '^[^?].*\.env$|^\?\? .*\.env$'; then
  echo "FAIL: .env appears in git status"
  add_failure ".env appears in git status"
fi

key_hits="$(rg -n 'sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}' --glob '!node_modules' --glob '!.env' . docs 2>/dev/null || true)"
if [[ -n "$key_hits" ]]; then
  printf '%s\n' "$key_hits"
  echo "FAIL: possible API key pattern in tracked files"
  add_failure "possible API key pattern in tracked files"
fi

echo "== Pre-submission readiness check =="

echo "== Candidate archive dry-run =="
if ! npm run archive:dry-run; then
  echo "FAIL: archive dry-run failed"
  add_failure "archive dry-run failed"
fi

required_public_paths=()
while IFS= read -r path; do
  required_public_paths+=("$path")
done < <(node --input-type=module - <<'NODE'
import manifest from "./scripts/archive-manifest.json" with { type: "json" };

const required = [
  ...manifest.required,
  ...manifest.runIds.flatMap((runId) =>
    manifest.requiredRunFiles.map((file) => `docs/reports/runs/${runId}/${file}`),
  ),
];
for (const path of required) {
  console.log(path);
}
NODE
)

missing_public_paths=()
for path in "${required_public_paths[@]}"; do
  if ! git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
    missing_public_paths+=("$path")
  fi
done

if ((${#missing_public_paths[@]} > 0)); then
  printf 'Missing tracked public release paths:\n'
  printf '  - %s\n' "${missing_public_paths[@]}"
  echo "FAIL: public release paths are not all tracked by git"
  add_failure "public release paths are not all tracked by git"
fi

critical_untracked_paths="$(git status --porcelain 2>/dev/null \
  | sed "s#^?? ${GIT_PREFIX}#?? #" \
  | rg '^\?\? (apps/|services/|scripts/|e2e/|docs/reports/submission/|docs/reports/runs/|sandbox-repo/|playwright\.config\.js$)' \
  || true)"
if [[ -n "$critical_untracked_paths" ]]; then
  printf 'Critical release paths still untracked:\n'
  printf '%s\n' "$critical_untracked_paths"
  echo "FAIL: critical release paths are not ready for a tracked public repository"
  add_failure "critical release paths are not ready for a tracked public repository"
fi

placeholder_hits="$(rg -n '待填|待部署|待录制|待发布|待人工|TODO|TBD|placeholder' docs/reports/submission/team-info.md docs/reports/submission/checklist.md docs/reports/submission/public-repo-guide.md || true)"
if [[ -n "$placeholder_hits" ]]; then
  printf '%s\n' "$placeholder_hits"
  echo "FAIL: submission materials still contain human-pending placeholders"
  add_failure "submission materials still contain human-pending placeholders"
fi

submission_hits="$(rg -n '^- \[ \] 6\.10 前对外提交|远端公开 URL \| _' docs/reports/submission/checklist.md docs/reports/submission/public-repo-guide.md || true)"
if [[ -n "$submission_hits" ]]; then
  printf '%s\n' "$submission_hits"
  echo "FAIL: final external submission checklist is not complete"
  add_failure "final external submission checklist is not complete"
fi

if ((${#failures[@]} > 0)); then
  printf 'FAIL: pre-submission check found %d blocker(s):\n' "${#failures[@]}"
  printf '  - %s\n' "${failures[@]}"
  exit 1
fi

echo "Running npm run verify..."
npm run verify

echo "OK: local pre-submission checks, verify, and key-pattern scans passed"
echo "NOTE: public repository URL, Demo URL, video URL, and team information still require human/remote verification."
