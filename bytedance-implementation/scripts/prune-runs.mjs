#!/usr/bin/env node
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listRunArchives, writeRunIndex } from "../services/orchestrator/src/runIndex.js";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const apply = process.argv.includes("--apply");

async function main() {
  const index = await listRunArchives(PROJECT_ROOT);
  const written = await writeRunIndex(PROJECT_ROOT);

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      prunedCandidates: index.prunedCandidates,
      indexPath: path.join(PROJECT_ROOT, "docs/reports/runs/index.json"),
      runCount: written.runCount,
    }, null, 2));
    return;
  }

  for (const candidate of index.prunedCandidates) {
    const target = path.join(PROJECT_ROOT, "docs/reports/runs", candidate.runId);
    await rm(target, { recursive: true, force: true });
    console.log(`removed ${candidate.runId}: ${candidate.reason}`);
  }

  const refreshed = await writeRunIndex(PROJECT_ROOT);
  console.log(JSON.stringify({ mode: "apply", removed: index.prunedCandidates.length, runCount: refreshed.runCount }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
