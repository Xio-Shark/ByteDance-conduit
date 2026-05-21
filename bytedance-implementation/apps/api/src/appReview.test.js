import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import { createApp } from "./app.js";
import { makeRunDir, successfulRun } from "./appTestHelpers.js";

test("GET /api/runs/:id/submission reports generated and human-pending items", async () => {
  const evidenceDir = await makeRunDir("run-submission");
  const app = createApp({
    runDelivery: async ({ input }) => successfulRun({
      runId: "run-submission",
      evidenceDir,
      input,
    }),
  });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    await postJson(`${baseUrl}/api/runs`, { input: "submission requirement" });
    const response = await fetch(`${baseUrl}/api/runs/run-submission/submission`);
    const payload = await response.json();
    const statuses = new Map(payload.items.map((item) => [item.id, item.status]));

    assert.equal(response.status, 200);
    assert.equal(statuses.get("readme"), "generated");
    assert.equal(statuses.get("demo"), "pending_human");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("POST /api/runs/:id/confirm records human confirmation", async () => {
  const evidenceDir = await makeRunDir("run-confirm");
  const app = createApp({
    runDelivery: async ({ input }) => successfulRun({
      runId: "run-confirm",
      evidenceDir,
      input,
    }),
  });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    await postJson(`${baseUrl}/api/runs`, { input: "confirm requirement" });
    const response = await postJson(`${baseUrl}/api/runs/run-confirm/confirm`, {
      target: "plan",
      decision: "approved",
      note: "looks good",
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.confirmations[0].target, "plan");
    assert.equal(payload.confirmations[0].note, "looks good");
    assert.equal(payload.events.at(-1).stage, "human_confirm");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("POST /api/runs/:id/confirm exposes metadata persistence failure", async () => {
  const evidenceDir = await makeRunDir("run-confirm-persist-fails");
  const app = createApp({
    runDelivery: async ({ input }) => successfulRun({
      runId: "run-confirm-persist-fails",
      evidenceDir,
      input,
    }),
  });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    await postJson(`${baseUrl}/api/runs`, { input: "confirm requirement" });
    await rm(evidenceDir, { recursive: true, force: true });
    const response = await postJson(`${baseUrl}/api/runs/run-confirm-persist-fails/confirm`, {
      target: "plan",
      decision: "approved",
    });
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.match(payload.error.message, /metadata.json|ENOENT/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("POST /api/runs/:id/confirm rejects invalid target", async () => {
  const evidenceDir = await makeRunDir("run-confirm-invalid");
  const app = createApp({
    runDelivery: async ({ input }) => successfulRun({
      runId: "run-confirm-invalid",
      evidenceDir,
      input,
    }),
  });
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    await postJson(`${baseUrl}/api/runs`, { input: "confirm requirement" });
    const response = await postJson(`${baseUrl}/api/runs/run-confirm-invalid/confirm`, {
      target: "deploy",
    });

    assert.equal(response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

function postJson(url, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
