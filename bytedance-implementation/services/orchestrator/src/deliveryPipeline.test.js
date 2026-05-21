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
