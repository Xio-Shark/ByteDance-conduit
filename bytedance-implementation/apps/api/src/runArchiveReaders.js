import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseAiCallLog } from "../../../services/orchestrator/src/aiUsage.js";

export async function readFailureArchive(runDir) {
  return readJson(path.join(runDir, "failure.json"));
}

export async function readPausedArchive(runDir) {
  const metadata = await readMetadataJson(path.join(runDir, "metadata.json"));
  return {
    ...(await readJson(path.join(runDir, "paused.json"))),
    ...(metadata ?? {}),
    evidenceDir: runDir,
    historyRecall: await readJson(path.join(runDir, "history-recall.json")),
    requirementCard: await readMarkdownJson(path.join(runDir, "requirement.md")),
    aiCalls: await readOptionalAiCalls(path.join(runDir, "ai-calls.jsonl")),
    plan: await readOptionalMarkdownJson(path.join(runDir, "plan.md")),
  };
}

export async function readSuccessfulArchive(runDir) {
  const summary = await readJson(path.join(runDir, "run-summary.json"));
  const metadata = await readMetadataJson(path.join(runDir, "metadata.json"));
  return {
    ...summary,
    ...(metadata ?? {}),
    requirementCard: await readMarkdownJson(path.join(runDir, "requirement.md")),
    plan: await readMarkdownJson(path.join(runDir, "plan.md")),
    verification: await readJson(path.join(runDir, "verification.json")),
    historyRecall: await readJson(path.join(runDir, "history-recall.json")),
    aiCalls: parseAiCallLog(await readText(path.join(runDir, "ai-calls.jsonl"))),
    diff: await readText(path.join(runDir, "diff.patch")),
    prDraft: await readText(path.join(runDir, "pr-draft.md")),
  };
}

function readText(filePath) {
  return readFile(filePath, "utf8");
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

async function readMetadataJson(filePath) {
  if (!existsSync(filePath)) return null;
  const metadata = await readJson(filePath);
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Archived run evidence metadata.json must contain an object");
  }
  return metadata;
}

async function readMarkdownJson(filePath) {
  const text = await readText(filePath);
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (!match) throw new Error(`Missing JSON block in ${filePath}`);
  return JSON.parse(match[1]);
}

async function readOptionalMarkdownJson(filePath) {
  if (!existsSync(filePath)) return null;
  return readMarkdownJson(filePath);
}

async function readOptionalAiCalls(filePath) {
  if (!existsSync(filePath)) return null;
  return parseAiCallLog(await readText(filePath));
}
