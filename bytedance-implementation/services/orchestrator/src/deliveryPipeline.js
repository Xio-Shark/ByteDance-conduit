import path from "node:path";
import { RUN_STAGES } from "../../../libs/types/src/stages.js";
import { createDeliveryContext, loadResumeContext, loadUpstreamState } from "./deliveryContext.js";
import { PROJECT_ROOT, RESUME_STAGE_ORDER } from "./deliveryConfig.js";
import { record } from "./deliveryEvents.js";
import { normalizeResumeStage, readOptionalJson, requireString } from "./deliveryIo.js";
import { persistFailure, persistPaused, persistSuccess } from "./deliveryPersistence.js";
import {
  clarifyRequirement,
  draftPr,
  editSandbox,
  planDelivery,
  verifySandbox,
} from "./deliveryStages.js";

export { RESUME_STAGE_ORDER };

export async function runDelivery(options = {}) {
  const context = await createDeliveryContext(options);
  return executeFromStage(context, RUN_STAGES.CLARIFYING, options);
}

export async function resumeFromStage(options = {}) {
  const runId = requireString(options.runId, "runId");
  const stage = normalizeResumeStage(options.stage);
  rejectIgnoredRevisedInput(stage, options.revisedInput);
  const context = await loadResumeContext({
    runId,
    projectRoot: options.projectRoot,
    revisedInput: options.revisedInput,
    repoPath: options.repoPath,
  });
  record(context.events, "resume", `resume-from-stage:${stage}`);
  return executeFromStage(context, stage, options);
}

export async function continueDelivery(options = {}) {
  const runId = requireString(options.runId, "runId");
  const context = await loadResumeContext({
    runId,
    projectRoot: options.projectRoot,
    repoPath: options.repoPath,
  });
  const paused = await readOptionalJson(path.join(context.evidence.runDir, "paused.json"));
  if (!paused?.stage) {
    throw new Error(`Run ${runId} is not waiting for confirmation`);
  }
  const pauseStage = paused.stage;
  const metadata = await readOptionalJson(path.join(context.evidence.runDir, "metadata.json"));
  const confirmations = Array.isArray(metadata?.confirmations) ? metadata.confirmations : [];

  if (pauseStage === RUN_STAGES.REQUIREMENT_CONFIRM) {
    requireApprovedConfirmation(confirmations, "requirement");
    record(context.events, "continue", "continue-after-requirement-confirm");
    return executeFromStage(context, RUN_STAGES.PLANNING, options);
  }

  if (pauseStage === RUN_STAGES.PLAN_CONFIRM) {
    requireApprovedConfirmation(confirmations, "plan");
    record(context.events, "continue", "continue-after-plan-confirm");
    return executeFromStage(context, RUN_STAGES.EDITING, options);
  }

  throw new Error(`Run ${runId} has unsupported pause stage: ${pauseStage}`);
}

async function executeFromStage(context, startStage, options) {
  const state = {};
  const startIndex = RESUME_STAGE_ORDER.indexOf(startStage);
  if (startIndex < 0) {
    throw new Error(`Unsupported resume stage: ${startStage}`);
  }
  const runFrom = (stage) => startIndex <= RESUME_STAGE_ORDER.indexOf(stage);

  try {
    if (runFrom(RUN_STAGES.CLARIFYING)) {
      Object.assign(state, await clarifyRequirement(context, options));
      if (shouldBlockOnConfirm(options.env || process.env)) {
        return persistPaused(context, RUN_STAGES.REQUIREMENT_CONFIRM, state);
      }
    } else {
      Object.assign(state, await loadUpstreamState(context, startIndex));
    }
    if (runFrom(RUN_STAGES.PLANNING)) {
      Object.assign(state, await planDelivery(context, state.requirementCard, state.historyRecall, options));
      if (shouldBlockOnConfirm(options.env || process.env)) {
        return persistPaused(context, RUN_STAGES.PLAN_CONFIRM, state);
      }
    }
    if (runFrom(RUN_STAGES.EDITING)) {
      Object.assign(state, await editSandbox(context, state.skill));
    }
    if (runFrom(RUN_STAGES.VERIFYING)) {
      Object.assign(state, await verifySandbox(context, state));
    }
    if (runFrom(RUN_STAGES.PR_DRAFTING)) {
      Object.assign(state, await draftPr(context, state));
    }
    return await persistSuccess(context, state);
  } catch (error) {
    await persistFailure(context, error, state);
    throw error;
  }
}

function shouldBlockOnConfirm(env = process.env) {
  return env.BLOCK_ON_CONFIRM === "1" || env.BLOCK_ON_CONFIRM === "true";
}

function rejectIgnoredRevisedInput(stage, revisedInput) {
  if (typeof revisedInput !== "string" || revisedInput.trim() === "") return;
  if (stage === RUN_STAGES.CLARIFYING || stage === RUN_STAGES.PLANNING) return;
  throw new Error("revisedInput is only supported when resuming from clarifying or planning");
}

function requireApprovedConfirmation(confirmations, target) {
  const approved = confirmations.some(
    (confirmation) => confirmation.target === target && confirmation.decision === "approved",
  );
  if (!approved) {
    throw new Error(`Missing approved confirmation for ${target}`);
  }
}
