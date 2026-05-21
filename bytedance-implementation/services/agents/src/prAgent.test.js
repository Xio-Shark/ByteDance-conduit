import assert from "node:assert/strict";
import test from "node:test";
import { buildPrDraft } from "./prAgent.js";

test("buildPrDraft lists files from the actual diff", () => {
  const draft = buildPrDraft({
    diff: [
      "diff --git a/frontend/src/App.jsx b/frontend/src/App.jsx",
      "diff --git a/package.json b/package.json",
    ].join("\n"),
    plan: { target_files: ["frontend/src/App.jsx"] },
    requirementCard: {
      goal: "展示阅读量",
      source_input: "给文章列表加阅读量展示",
    },
    verification: {
      checks: [{ command: "npm test", exitCode: 0 }],
    },
  });

  assert.match(draft, /- frontend\/src\/App\.jsx/);
  assert.match(draft, /- package\.json/);
  assert.match(draft, /deterministic front-end read counts/);
  assert.doesNotMatch(draft, /placeholder reads/);
});
