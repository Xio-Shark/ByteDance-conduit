import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_LIMIT = 3;
const MIN_SCORE = 0.12;
const NGRAM_SIZE = 2;

export async function recallHistory({ input, projectRoot, runId, limit = DEFAULT_LIMIT }) {
  const reportsDir = path.join(projectRoot, "docs/reports/runs");
  if (!existsSync(reportsDir)) {
    return {
      status: "missing_history",
      matches: [],
      invalidRuns: [{ reason: "reports directory missing", path: reportsDir }],
    };
  }

  const runDirs = await readdir(reportsDir, { withFileTypes: true });
  const candidates = await Promise.all(
    runDirs
      .filter((entry) => entry.isDirectory() && entry.name !== runId)
      .map((entry) => loadCandidate(reportsDir, entry.name)),
  );
  const queryTokens = tokenize(input);
  const scored = candidates
    .filter((candidate) => candidate.match)
    .map(({ match }) => ({ ...match, score: scoreTokens(queryTokens, match.tokens) }))
    .filter((match) => match.score >= MIN_SCORE)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ tokens, ...match }) => match);

  const skipped = candidates
    .filter((candidate) => candidate.invalid)
    .map((candidate) => candidate.invalid);

  return {
    status: recallStatus(candidates, skipped),
    matches: scored,
    skipped,
    invalidRuns: skipped,
  };
}

function recallStatus(candidates, skipped) {
  if (!candidates.length) return "empty_history";
  if (skipped.length) return "degraded";
  return "ready";
}

async function loadCandidate(reportsDir, name) {
  const runDir = path.join(reportsDir, name);
  try {
    const requirement = await readMarkdownJson(path.join(runDir, "requirement.md"));
    const plan = await readMarkdownJson(path.join(runDir, "plan.md"));
    const acceptance = requireStringArray(requirement.acceptance, "requirement.acceptance", name);
    const targetFiles = requireStringArray(plan.target_files, "plan.target_files", name);
    const sourceInput = requireString(requirement.source_input, "requirement.source_input", name);
    const goal = requireString(requirement.goal, "requirement.goal", name);
    const summary = requireString(plan.summary, "plan.summary", name);
    const skillId = requireString(plan.skill_id, "plan.skill_id", name);
    const tokens = tokenize([
      sourceInput,
      goal,
      ...acceptance,
      summary,
      skillId,
    ].join(" "));
    return {
      match: {
        runId: name,
        goal,
        sourceInput,
        skillId,
        summary,
        targetFiles,
        tokens,
      },
    };
  } catch (error) {
    return { invalid: { runId: name, reason: error.message } };
  }
}

function requireString(value, field, runId) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Archived run ${runId} missing ${field}`);
  }
  return value.trim();
}

function requireStringArray(value, field, runId) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`Archived run ${runId} missing ${field}`);
  }
  return value.map((item) => item.trim());
}

async function readMarkdownJson(filePath) {
  const text = await readFile(filePath, "utf8");
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (!match) throw new Error(`Missing JSON block in ${filePath}`);
  return JSON.parse(match[1]);
}

function tokenize(text) {
  const normalized = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  if (normalized.length <= NGRAM_SIZE) return new Set(normalized ? [normalized] : []);
  const tokens = [];
  for (let index = 0; index <= normalized.length - NGRAM_SIZE; index += 1) {
    tokens.push(normalized.slice(index, index + NGRAM_SIZE));
  }
  return new Set(tokens);
}

function scoreTokens(queryTokens, candidateTokens) {
  if (!queryTokens.size || !candidateTokens.size) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (candidateTokens.has(token)) overlap += 1;
  }
  return Number((overlap / queryTokens.size).toFixed(3));
}
