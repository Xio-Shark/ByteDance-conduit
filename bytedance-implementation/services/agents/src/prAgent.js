export function buildPrDraft({ diff, plan, requirementCard, verification }) {
  const files = parseChangedFiles(diff).map((file) => `- ${file}`).join("\n");
  const tests = verification.checks.map(formatCheck).join("\n");

  return `# PR Draft: ${requirementCard.goal}

## Requirement
${requirementCard.source_input}

## Plan
${plan.summary}

## Files Changed
${files}

## Verification
${tests}

## Risks
- P0 adds deterministic front-end read counts for demo delivery; it does not add production analytics instrumentation.
- If the Conduit repo has no lint script, the implementation repo runs ESLint on the changed Conduit files.

## Rollback
Revert the generated patch or discard the branch before submitting PR.

## Diff Summary
${summarizeDiff(diff)}
`;
}

function formatCheck(check) {
  return `- ${check.command}: exit ${check.exitCode}`;
}

function summarizeDiff(diff) {
  return diff
    .split("\n")
    .filter((line) => line.startsWith("diff --git"))
    .join("\n");
}

function parseChangedFiles(diff) {
  return diff
    .split("\n")
    .filter((line) => line.startsWith("diff --git"))
    .map((line) => line.split(" b/")[1])
    .filter(Boolean);
}
