import path from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { RUN_STAGES } from "../../../libs/types/src/stages.js";
import { buildPlan } from "../../agents/src/planningAgent.js";
import { applyCodingPlan } from "../../agents/src/codingAgent.js";
import { verifyRun } from "../../agents/src/verificationAgent.js";
import { buildPrDraft } from "../../agents/src/prAgent.js";
import { findSkill } from "../../skills/src/registry.js";
import { ConduitSandbox } from "../../sandbox/src/conduitSandbox.js";
import { createEvidenceWriter, markdownFromObject } from "./evidence.js";
import { buildAiArtifacts } from "./aiArtifacts.js";
import { parseAiCallLog, requireFiniteNumber, serializeAiCallLog, summarizeAiCalls } from "./aiUsage.js";
import { recallHistory } from "./historyRecall.js";

const PROJECT_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

export const RESUME_STAGE_ORDER = Object.freeze([
  RUN_STAGES.CLARIFYING,
  RUN_STAGES.PLANNING,
  RUN_STAGES.EDITING,
  RUN_STAGES.VERIFYING,
  RUN_STAGES.PR_DRAFTING,
]);

export async function runDelivery(options = {}) {
  const context = await createDeliveryContext(options);
  return executeFromStage(context, RUN_STAGES.CLARIFYING, options);
}

export async function resumeFromStage(options = {}) {
  const runId = requireString(options.runId, "runId");
  const stage = normalizeResumeStage(options.stage);
  const context = await loadResumeContext({
    runId,
    projectRoot: options.projectRoot || PROJECT_ROOT,
    revisedInput: options.revisedInput,
    repoPath: options.repoPath,
  });
  record(context.events, "resume", `resume-from-stage:${stage}`);
  return executeFromStage(context, stage, options);
}

async function executeFromStage(context, startStage, options) {
  const state = {};
  const startIndex = RESUME_STAGE_ORDER.indexOf(startStage);
  if (startIndex < 0) {
    throw new Error(`Unsupported resume stage: ${startStage}`);
  }

  try {
    if (startIndex <= 0) {
      Object.assign(state, await clarifyRequirement(context, options));
    } else {
      Object.assign(state, await loadUpstreamState(context, startIndex));
    }
    if (startIndex <= 1) {
      Object.assign(state, await planDelivery(context, state.requirementCard, state.historyRecall));
    }
    if (startIndex <= 2) {
      Object.assign(state, await editSandbox(context, state.skill));
    }
    if (startIndex <= 3) {
      Object.assign(state, await verifySandbox(context));
    }
    if (startIndex <= 4) {
      Object.assign(state, await draftPr(context, state));
    }
    return await persistSuccess(context, state);
  } catch (error) {
    await persistFailure(context, error, state);
    throw error;
  }
}

async function createDeliveryContext(options) {
  const input = requireRequirementInput(options.input);
  const runId = options.runId || `run-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const repoPath = options.repoPath || process.env.SANDBOX_REPO_PATH || path.join(PROJECT_ROOT, "sandbox-repo");
  const evidence = options.evidence || (await createEvidenceWriter(runId));
  return {
    checkpoints: {},
    evidence,
    events: [],
    input,
    repoPath,
    runId,
    sandbox: new ConduitSandbox(repoPath),
  };
}

async function loadResumeContext({ runId, projectRoot, revisedInput, repoPath }) {
  const runDir = path.join(projectRoot, "docs/reports/runs", runId);
  if (!existsSync(runDir)) {
    throw new Error(`Run evidence not found: ${runId}`);
  }

  const metadata = await readOptionalJson(path.join(runDir, "metadata.json"));
  const events = Array.isArray(metadata?.events) ? [...metadata.events] : [];
  const checkpoints = metadata?.checkpoints && typeof metadata.checkpoints === "object"
    ? { ...metadata.checkpoints }
    : await readOptionalJson(path.join(runDir, "checkpoints.json")) || {};

  const requirementCard = await readMarkdownJson(path.join(runDir, "requirement.md"));
  const input = typeof revisedInput === "string" && revisedInput.trim()
    ? revisedInput.trim()
    : requirementCard.source_input;

  return {
    checkpoints,
    evidence: await createEvidenceWriter(runId),
    events,
    input,
    repoPath: repoPath || process.env.SANDBOX_REPO_PATH || path.join(PROJECT_ROOT, "sandbox-repo"),
    runId,
    sandbox: new ConduitSandbox(repoPath || process.env.SANDBOX_REPO_PATH || path.join(PROJECT_ROOT, "sandbox-repo")),
  };
}

async function loadUpstreamState(context, startIndex) {
  const runDir = context.evidence.runDir;
  const requirementCard = await readMarkdownJson(path.join(runDir, "requirement.md"));
  const historyRecall = await readJson(path.join(runDir, "history-recall.json"));
  const origin = await context.sandbox.assertConduitOrigin();
  const state = { historyRecall, origin, requirementCard };

  if (startIndex <= 1) {
    return state;
  }

  const plan = await readMarkdownJson(path.join(runDir, "plan.md"));
  const skill = findSkill(requirementCard);
  Object.assign(state, { plan, skill });

  if (startIndex <= 2) {
    return state;
  }

  const diff = await readText(path.join(runDir, "diff.patch"));
  const verification = startIndex <= 3
    ? await readJson(path.join(runDir, "verification.json"))
    : undefined;
  Object.assign(state, {
    diff,
    edit: { changedFiles: plan.target_files, summary: plan.summary },
    verification,
  });

  state.aiArtifacts = await loadAiArtifacts(context, requirementCard);
  return state;
}

async function loadAiArtifacts(context, requirementCard) {
  const aiCallsPath = path.join(context.evidence.runDir, "ai-calls.jsonl");
  if (existsSync(aiCallsPath)) {
    const aiCalls = parseAiCallLog(await readText(aiCallsPath));
    const hasLlmUsage = aiCalls.some((call) => call.tokens_in + call.tokens_out > 0);
    return {
      mode: hasLlmUsage ? "llm" : "rules",
      aiCalls,
    };
  }

  return {
    mode: "rules",
    aiCalls: [
      {
        stage: "clarify",
        model: "rules-first-p0",
        tokens_in: 0,
        tokens_out: 0,
        latency_ms: 0,
        cost_estimate: 0,
        status: "reviewed",
        input_summary: requirementCard.source_input,
        output_summary: requirementCard.goal,
      },
    ],
  };
}

async function clarifyRequirement(context, options) {
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
    projectRoot: PROJECT_ROOT,
    runId: context.runId,
  });
  await context.evidence.writeText("requirement.md", markdownFromObject("Requirement", requirementCard));
  await context.evidence.writeJson("history-recall.json", historyRecall);
  await writeCheckpoint(context, RUN_STAGES.CLARIFYING, ["requirement.md", "history-recall.json"]);
  return { aiArtifacts, historyRecall, origin, requirementCard };
}

async function planDelivery(context, requirementCard, historyRecall) {
  record(context.events, RUN_STAGES.PLANNING, "Locate Skill and target files");
  const skill = findSkill(requirementCard);
  const plan = await buildPlan({
    requirementCard,
    historyRecall: historyRecall || (await readJson(path.join(context.evidence.runDir, "history-recall.json"))),
    sandbox: context.sandbox,
    skill,
  });
  await context.evidence.writeText("plan.md", markdownFromObject("Plan", plan));
  await writeCheckpoint(context, RUN_STAGES.PLANNING, ["plan.md"]);
  return { plan, skill };
}

async function editSandbox(context, skill) {
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

async function verifySandbox(context) {
  record(context.events, RUN_STAGES.VERIFYING, "Run Conduit verification");
  const verification = await verifyRun({ sandbox: context.sandbox });
  await context.evidence.writeJson("verification.json", verification);
  await writeCheckpoint(context, RUN_STAGES.VERIFYING, ["verification.json"]);
  if (verification.status !== "passed") {
    throw new Error("Verification failed");
  }
  return { verification };
}

async function draftPr(context, state) {
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

async function persistSuccess(context, state) {
  const result = buildRunResult(context, state);
  await context.evidence.writeJson("run-summary.json", summarizeRun(result));
  await context.evidence.writeJson("checkpoints.json", context.checkpoints);
  result.checkpoints = context.checkpoints;
  return result;
}

async function persistFailure(context, error, state) {
  record(context.events, RUN_STAGES.FAILED, error.message);
  const failure = {
    runId: context.runId,
    stage: RUN_STAGES.FAILED,
    status: "failed",
    error: error.message,
    repoPath: path.resolve(context.repoPath),
    evidenceDir: context.evidence.runDir,
    events: context.events,
    checkpoints: context.checkpoints,
    ...failureEvidence(state),
  };
  await context.evidence.writeJson("failure.json", failure);
  if (Object.keys(context.checkpoints).length) {
    await context.evidence.writeJson("checkpoints.json", context.checkpoints);
  }
  error.runResult = failure;
}

function buildRunResult(context, state) {
  return {
    runId: context.runId,
    stage: RUN_STAGES.READY_FOR_PR,
    status: state.verification.status,
    origin: state.origin,
    repoPath: path.resolve(context.repoPath),
    evidenceDir: context.evidence.runDir,
    requirementCard: state.requirementCard,
    historyRecall: state.historyRecall,
    plan: state.plan,
    edit: state.edit,
    verification: state.verification,
    diff: state.diff,
    prDraft: state.prDraft,
    events: context.events,
    aiMode: state.aiArtifacts.mode,
    aiCalls: state.aiCalls,
    aiUsage: state.aiUsage,
    checkpoints: context.checkpoints,
  };
}

function failureEvidence(state) {
  return {
    requirementCard: state.requirementCard,
    historyRecall: state.historyRecall,
    plan: state.plan,
    edit: state.edit,
    diff: state.diff,
    verification: state.verification,
  };
}

async function writeCheckpoint(context, stage, artifacts) {
  context.checkpoints[stage] = {
    at: new Date().toISOString(),
    artifacts,
  };
}

function normalizeResumeStage(stage) {
  const normalized = requireString(stage, "stage").toLowerCase();
  const aliases = {
    clarify: RUN_STAGES.CLARIFYING,
    clarifying: RUN_STAGES.CLARIFYING,
    plan: RUN_STAGES.PLANNING,
    planning: RUN_STAGES.PLANNING,
    edit: RUN_STAGES.EDITING,
    editing: RUN_STAGES.EDITING,
    verify: RUN_STAGES.VERIFYING,
    verifying: RUN_STAGES.VERIFYING,
    pr: RUN_STAGES.PR_DRAFTING,
    pr_drafting: RUN_STAGES.PR_DRAFTING,
  };
  const resolved = aliases[normalized] || normalized;
  if (!RESUME_STAGE_ORDER.includes(resolved)) {
    throw new Error(`resume-from-stage must be one of: ${RESUME_STAGE_ORDER.join(", ")}`);
  }
  return resolved;
}

function requireRequirementInput(input) {
  if (typeof input !== "string" || input.trim() === "") {
    throw new Error("Requirement input is required");
  }
  return input.trim();
}

function requireString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function record(events, stage, message) {
  events.push({
    at: new Date().toISOString(),
    stage,
    message,
  });
}

export function buildAiCallRecords({ aiArtifacts, plan, runId }) {
  const aiCalls = normalizeAiCalls(aiArtifacts.aiCalls);
  return aiCalls.map((call) => ({
    run_id: runId,
    stage: call.stage,
    model: call.model,
    prompt_version: call.prompt_version || plan.skill_version,
    skill_id: plan.skill_id,
    input_summary: call.input_summary || "Clarify requirement for delivery run",
    output_summary: call.output_summary || "Generated requirement card for the stage",
    tokens_in: call.tokens_in,
    tokens_out: call.tokens_out,
    latency_ms: call.latency_ms,
    cost_estimate: call.cost_estimate,
    status: call.status,
  }));
}

function normalizeAiCalls(calls) {
  return calls.map((call) => ({
    stage: call.stage,
    model: call.model,
    tokens_in: requireFiniteNumber(call.tokens_in, "tokens_in"),
    tokens_out: requireFiniteNumber(call.tokens_out, "tokens_out"),
    latency_ms: requireFiniteNumber(call.latency_ms, "latency_ms"),
    cost_estimate: requireFiniteNumber(call.cost_estimate, "cost_estimate"),
    status: call.status,
  }));
}

function summarizeRun(result) {
  return {
    runId: result.runId,
    stage: result.stage,
    status: result.status,
    repoPath: result.repoPath,
    evidenceDir: result.evidenceDir,
    aiMode: result.aiMode,
    aiUsage: result.aiUsage,
    historyRecall: result.historyRecall,
    targetFiles: result.plan.target_files,
    verificationStatus: result.verification.status,
    events: result.events,
    checkpoints: result.checkpoints,
  };
}

async function readMarkdownJson(filePath) {
  const text = await readText(filePath);
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (!match) throw new Error(`Missing JSON block in ${filePath}`);
  return JSON.parse(match[1]);
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

async function readOptionalJson(filePath) {
  if (!existsSync(filePath)) return null;
  return readJson(filePath);
}

function readText(filePath) {
  return readFile(filePath, "utf8");
}
