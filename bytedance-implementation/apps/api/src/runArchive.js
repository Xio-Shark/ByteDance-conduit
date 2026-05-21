import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseAiCallLog, summarizeAiCalls } from "../../../services/orchestrator/src/aiUsage.js";

export async function loadArchivedRun(runId, projectRoot) {
  const runDir = path.join(projectRoot, "docs/reports/runs", runId);
  if (!existsSync(runDir)) return null;
  if (existsSync(path.join(runDir, "failure.json"))) {
    return normalizeFailureRun(await readJson(path.join(runDir, "failure.json")), projectRoot);
  }

  const summary = await readJson(path.join(runDir, "run-summary.json"));
  const metadata = await readMetadataJson(path.join(runDir, "metadata.json"));
  return normalizeSuccessfulRun({
    ...summary,
    ...metadataFields(metadata),
    requirementCard: requireObject(
      await readMarkdownJson(path.join(runDir, "requirement.md")),
      "requirement.md",
    ),
    plan: requireObject(await readMarkdownJson(path.join(runDir, "plan.md")), "plan.md"),
    verification: requireObject(
      await readJson(path.join(runDir, "verification.json")),
      "verification.json",
    ),
    historyRecall: await readJson(path.join(runDir, "history-recall.json")),
    aiCalls: requireNonEmptyArray(
      parseAiCallLog(await readText(path.join(runDir, "ai-calls.jsonl"))),
      "ai-calls.jsonl",
    ),
    diff: requireNonEmptyText(await readText(path.join(runDir, "diff.patch")), "diff.patch"),
    prDraft: requireNonEmptyText(await readText(path.join(runDir, "pr-draft.md")), "pr-draft.md"),
  }, projectRoot);
}

function normalizeFailureRun(run, projectRoot) {
  const aiCalls = optionalArray(run.aiCalls, "aiCalls");
  const aiUsage = run.aiUsage ?? (aiCalls ? summarizeAiCalls(aiCalls) : null);
  return {
    runId: requireNonEmptyText(run.runId, "runId"),
    sourceInput: optionalRequirementSource(run),
    retryOf: optionalText(run.retryOf, "retryOf"),
    stage: requireNonEmptyText(run.stage, "stage"),
    status: requireNonEmptyText(run.status ?? run.verificationStatus, "status"),
    repoPath: run.repoPath ?? null,
    evidenceDir: optionalText(run.evidenceDir, "evidenceDir") ?? path.join(projectRoot, "docs/reports/runs", run.runId),
    error: run.error,
    requirementCard: run.requirementCard || null,
    historyRecall: run.historyRecall || null,
    plan: run.plan || null,
    edit: run.edit || null,
    verification: run.verification || null,
    diff: run.diff ?? null,
    events: requireArray(run.events, "events"),
    confirmations: optionalMetadataArray(run.confirmations, "confirmations"),
    aiCalls,
    aiUsage,
    prSubmission: run.prSubmission || null,
    prDraft: run.prDraft ?? null,
  };
}

function normalizeSuccessfulRun(run, projectRoot) {
  if (!run.requirementCard.source_input) {
    throw new Error("Archived run evidence requirement.md missing source_input");
  }
  const normalized = normalizeFailureRun(run, projectRoot);
  requireNonEmptyArray(normalized.aiCalls, "ai-calls.jsonl");
  requireObject(normalized.aiUsage, "aiUsage");
  return normalized;
}

function optionalRequirementSource(run) {
  return run.requirementCard?.source_input ?? null;
}

function requireObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Archived run evidence ${name} must contain an object`);
  }
  return value;
}

function requireNonEmptyArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Archived run evidence ${name} is missing records`);
  }
  return value;
}

function requireNonEmptyText(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Archived run evidence ${name} is empty`);
  }
  return value;
}

function requireArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`Archived run evidence ${name} must be an array`);
  }
  return value;
}

function optionalArray(value, name) {
  if (value === undefined || value === null) return null;
  return requireArray(value, name);
}

function optionalMetadataArray(value, name) {
  if (value === undefined || value === null) return [];
  return requireArray(value, name);
}

function optionalText(value, name) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new Error(`Archived run evidence ${name} must be a string`);
  }
  return value.trim() || null;
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

async function readMetadataJson(filePath) {
  if (!existsSync(filePath)) return null;
  return requireObject(await readJson(filePath), "metadata.json");
}

function metadataFields(metadata) {
  if (metadata === null) return {};
  return metadata;
}

async function readMarkdownJson(filePath) {
  const text = await readText(filePath);
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (!match) throw new Error(`Missing JSON block in ${filePath}`);
  return JSON.parse(match[1]);
}

function readText(filePath) {
  return readFile(filePath, "utf8");
}
