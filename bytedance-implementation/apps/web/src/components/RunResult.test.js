import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRunResultActions,
  createResumeFromEditHandler,
} from "./runResultActions.js";
import { buildEvidenceState } from "./runEvidenceState.js";

test("buildEvidenceState marks paused-after-clarify AI usage as missing", () => {
  const state = buildEvidenceState(
    {
      runId: "run-paused",
      stage: "waiting_requirement_confirm",
      status: "paused",
      aiCalls: null,
      aiUsage: null,
    },
    [{ stage: "clarifying", message: "Build requirement card" }],
  );

  assert.deepEqual(state.aiUsage, {
    status: "missing",
    message: "AI usage evidence missing for run-paused at waiting_requirement_confirm",
  });
});

test("buildEvidenceState keeps AI usage pending before clarify", () => {
  const state = buildEvidenceState(
    {
      runId: "run-created",
      stage: "created",
      status: "running",
      aiCalls: null,
      aiUsage: null,
    },
    [],
  );

  assert.equal(state.aiUsage.status, "pending");
});

test("buildRunResultActions passes resume action to RunResult", () => {
  const resume = () => {};
  const actions = buildRunResultActions({
    confirm: () => {},
    continueRun: () => {},
    resume,
    retry: () => {},
    start: () => {},
    submitPr: () => {},
  });

  assert.equal(actions.resume, resume);
});

test("createResumeFromEditHandler calls resume from editing", () => {
  let resumedStage = "";
  const resumeFromEdit = createResumeFromEditHandler({
      confirm: () => {},
      continueRun: () => {},
      resume: (stage) => {
        resumedStage = stage;
      },
      retry: () => {},
      submitPr: () => {},
  });

  resumeFromEdit();

  assert.equal(resumedStage, "editing");
});
