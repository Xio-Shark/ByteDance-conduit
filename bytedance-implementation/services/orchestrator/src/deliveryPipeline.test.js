import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { resumeFromStage } from "./deliveryPipeline.js";

const PROJECT_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

test("resumeFromStage rejects unknown stage", async () => {
  await assert.rejects(
    () => resumeFromStage({ runId: "run-missing", stage: "unknown", projectRoot: PROJECT_ROOT }),
    /resume-from-stage must be one of/,
  );
});

test("resumeFromStage rejects revised input for downstream-only stages", async () => {
  await assert.rejects(
    () => resumeFromStage({
      projectRoot: PROJECT_ROOT,
      revisedInput: "改成展示收藏数",
      runId: "run-missing",
      stage: "editing",
    }),
    /revisedInput is only supported/,
  );
});
