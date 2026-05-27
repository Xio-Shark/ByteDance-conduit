import path from "node:path";
import { RUN_STAGES } from "../../../libs/types/src/stages.js";
import { buildPlan } from "../../agents/src/planningAgent.js";
import { applyCodingPlan } from "../../agents/src/codingAgent.js";
import { verifyRun } from "../../agents/src/verificationAgent.js";
import { buildPrDraft } from "../../agents/src/prAgent.js";
import { findSkill } from "../../skills/src/registry.js";
import { buildAiCallRecords } from "./aiCallRecords.js";
import { markdownFromObject } from "./evidence.js";
import { buildAiArtifacts } from "./aiArtifacts.js";
import { serializeAiCallLog, summarizeAiCalls } from "./aiUsage.js";
import { record, writeCheckpoint } from "./deliveryEvents.js";
import { readJson } from "./deliveryIo.js";
import { recallHistory } from "./historyRecall.js";

export async function clarifyRequirement(context, options) {
  record(context.events, RUN_STAGES.CLARIFYING, "Build requirement card");
  const origin = await context.sandbox.assertConduitOrigin();
  const aiArtifacts = await buildAiArtifacts({
    env: options.env || process.env,
    input: context.input,
    modelClient: options.modelClient,
  });
  const requirementCard = aiArtifacts.requirementCard;
  const historyRecall = await recallHistory({
    input: context.input,
    projectRoot: context.projectRoot,
    runId: context.runId,
  });
  await context.evidence.writeText("requirement.md", markdownFromObject("Requirement", requirementCard));
  await context.evidence.writeJson("history-recall.json", historyRecall);
  await context.evidence.writeText("ai-calls.jsonl", serializeAiCallLog(aiArtifacts.aiCalls));
  await writeCheckpoint(context, RUN_STAGES.CLARIFYING, [
    "requirement.md",
    "history-recall.json",
    "ai-calls.jsonl",
  ]);
  return { aiArtifacts, historyRecall, origin, requirementCard };
}

export async function planDelivery(context, requirementCard, historyRecall, options = {}) {
  record(context.events, RUN_STAGES.PLANNING, "Locate Skill and target files");
  const skill = findSkill(requirementCard);
  const plan = await buildPlan({
    requirementCard,
    env: options.env || process.env,
    historyRecall: historyRecall || (await readJson(path.join(context.evidence.runDir, "history-recall.json"))),
    repoPath: context.repoPath,
    sandbox: context.sandbox,
    skill,
  });
  await context.evidence.writeText("plan.md", markdownFromObject("Plan", plan));
  await writeCheckpoint(context, RUN_STAGES.PLANNING, ["plan.md"]);
  return { plan, skill };
}

export async function editSandbox(context, skill) {
  record(context.events, RUN_STAGES.EDITING, "Apply patch to Conduit sandbox");
  const edit = await applyCodingPlan({ sandbox: context.sandbox, skill });
  const diff = await context.sandbox.gitDiff();
  if (!diff.trim()) {
    throw new Error("No git diff was generated");
  }
  await context.evidence.writeText("diff.patch", diff);
  await writeCheckpoint(context, RUN_STAGES.EDITING, ["diff.patch"]);
  return { diff, edit };
}

export async function verifySandbox(context, state) {
  record(context.events, RUN_STAGES.VERIFYING, "Run Conduit verification");
  const verification = await verifyRun({
    sandbox: context.sandbox,
    skill: state.skill,
    changedFiles: state.edit?.changedFiles || state.plan?.target_files || [],
  });
  await context.evidence.writeJson("verification.json", verification);
  await writeCheckpoint(context, RUN_STAGES.VERIFYING, ["verification.json"]);
  if (verification.status !== "passed") {
    throw new Error("Verification failed");
  }
  return { verification };
}

export async function draftPr(context, state) {
  record(context.events, RUN_STAGES.PR_DRAFTING, "Generate PR draft");
  const prDraft = buildPrDraft(state);
  await context.evidence.writeText("pr-draft.md", prDraft);
  const aiCalls = buildAiCallRecords({
    aiArtifacts: state.aiArtifacts,
    plan: state.plan,
    runId: context.runId,
  });
  await context.evidence.writeText("ai-calls.jsonl", serializeAiCallLog(aiCalls));
  await writeCheckpoint(context, RUN_STAGES.PR_DRAFTING, ["pr-draft.md", "ai-calls.jsonl"]);
  return { aiCalls, aiUsage: summarizeAiCalls(aiCalls), prDraft };
}
