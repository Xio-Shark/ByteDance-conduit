import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createApp } from "./app.js";
import {
  makeRunDir,
  mkdtempProjectRoot,
  writeAiCalls,
  writeMarkdownJson,
} from "./appTestHelpers.js";

test("GET /api/runs/:id restores archived run after cold start", async () => {
  const projectRoot = await mkdtempProjectRoot("super-individual-archive-");
  const runId = "run-archived";
  const runDir = await makeRunDir(runId, projectRoot);
  await writeSuccessfulArchive({ runDir, runId });
  await writeFile(path.join(runDir, "history-recall.json"), JSON.stringify({
    matches: [{ runId: "run-old", score: 0.5 }],
    skipped: [],
  }));
  await writeFile(path.join(runDir, "metadata.json"), JSON.stringify({
    retryOf: "run-original",
    confirmations: [{ target: "plan", decision: "approved" }],
    events: [{ stage: "retry", message: "retried from run-original" }],
  }));

  const app = createApp({ projectRoot });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${baseUrl}/api/runs/${runId}`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.sourceInput, "archived input");
    assert.equal(payload.retryOf, "run-original");
    assert.equal(payload.confirmations[0].target, "plan");
    assert.equal(payload.historyRecall.matches[0].runId, "run-old");
    assert.equal(payload.aiCalls[0].stage, "clarify");
    assert.equal(payload.aiUsage.tokensIn, 10);
    assert.equal(payload.events[0].stage, "retry");
    assert.match(payload.diff, /diff --git/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("GET /api/runs/:id rejects incomplete successful archive", async () => {
  const projectRoot = await mkdtempProjectRoot("super-individual-archive-");
  const runId = "run-archived-missing-diff";
  const runDir = await makeRunDir(runId, projectRoot);
  await writeSuccessfulArchive({ runDir, runId, diff: null });

  const app = createApp({ projectRoot });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${baseUrl}/api/runs/${runId}`);
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.match(payload.error.message, /diff.patch/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("GET /api/history returns similar archived runs", async () => {
  const projectRoot = await mkdtempProjectRoot("super-individual-history-api-");
  const runDir = await makeRunDir("run-history", projectRoot);
  await writeMarkdownJson(path.join(runDir, "requirement.md"), {
    source_input: "给文章列表加阅读量展示",
    goal: "文章列表卡片展示阅读量",
    acceptance: ["显示 reads"],
  });
  await writeMarkdownJson(path.join(runDir, "plan.md"), {
    summary: "在文章列表卡片增加阅读量展示。",
    skill_id: "article-list-display-field",
    target_files: ["frontend/src/components/ArticlesPreview/ArticlesPreview.jsx"],
  });

  const app = createApp({ projectRoot });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${baseUrl}/api/history?input=${encodeURIComponent("文章列表阅读量")}`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.matches[0].runId, "run-history");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("POST /api/runs/:id/confirm works for archived run after cold start", async () => {
  const projectRoot = await mkdtempProjectRoot("super-individual-archive-");
  const runId = "run-archived-confirm";
  const runDir = await makeRunDir(runId, projectRoot);
  await writeSuccessfulArchive({ runDir, runId, events: [] });

  const app = createApp({ projectRoot });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const response = await postJson(`${baseUrl}/api/runs/${runId}/confirm`, {
      target: "requirement",
      decision: "approved",
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.confirmations[0].target, "requirement");
    assert.equal(payload.events.at(-1).stage, "human_confirm");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function writeSuccessfulArchive({ diff = "diff --git a/file b/file\n", events, runDir, runId }) {
  await writeFile(path.join(runDir, "run-summary.json"), JSON.stringify({
    runId,
    stage: "ready_for_pr",
    status: "passed",
    repoPath: "/tmp/sandbox",
    evidenceDir: runDir,
    verificationStatus: "passed",
    ...(events ? { events } : {}),
  }));
  await writeMarkdownJson(path.join(runDir, "requirement.md"), {
    source_input: "archived input",
    goal: "archived goal",
  });
  await writeMarkdownJson(path.join(runDir, "plan.md"), {
    summary: "archived plan",
    target_files: ["frontend/src/App.jsx"],
  });
  await writeFile(path.join(runDir, "verification.json"), JSON.stringify({ status: "passed", checks: [] }));
  await writeFile(path.join(runDir, "history-recall.json"), JSON.stringify({ matches: [], skipped: [] }));
  await writeAiCalls(path.join(runDir, "ai-calls.jsonl"), [
    { stage: "clarify", tokens_in: 10, tokens_out: 4, latency_ms: 80, cost_estimate: 0.01 },
  ]);
  if (diff !== null) await writeFile(path.join(runDir, "diff.patch"), diff);
  await writeFile(path.join(runDir, "pr-draft.md"), "# PR\n");
}

function postJson(url, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
