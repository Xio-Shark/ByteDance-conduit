export async function executeRun({ input, retryOf, runDelivery, runStore }) {
  const requirementInput = requireRequirementInput(input);
  try {
    const result = await runDelivery({ input: requirementInput });
    const response = toRunResponse(result, requirementInput, retryOf);
    runStore.set(response);
    await runStore.persistMetadata(response);
    return { statusCode: 201, body: response };
  } catch (error) {
    if (!error.runResult) throw error;

    const response = toRunResponse(error.runResult, requirementInput, retryOf);
    runStore.set(response);
    await runStore.persistMetadata(response);
    return {
      statusCode: 500,
      body: {
        error: { message: error.message },
        run: response,
      },
    };
  }
}

export function toRunResponse(result, input, retryOf) {
  const status = requireString(result.status, "status");
  const stage = requireString(result.stage, "stage");
  const events = [...requireArray(result.events, "events")];
  if (retryOf) {
    events.push({
      at: new Date().toISOString(),
      stage: "retry",
      message: `retried from ${retryOf}`,
    });
  }
  const response = {
    runId: requireString(result.runId, "runId"),
    sourceInput: result.requirementCard?.source_input ?? input,
    retryOf: retryOf || result.retryOf || null,
    stage,
    status,
    repoPath: result.repoPath ?? null,
    evidenceDir: requireString(result.evidenceDir, "evidenceDir"),
    error: result.error,
    requirementCard: result.requirementCard || null,
    historyRecall: result.historyRecall ?? null,
    plan: result.plan || null,
    edit: result.edit || null,
    verification: result.verification || null,
    aiCalls: optionalArray(result.aiCalls, "aiCalls"),
    aiUsage: result.aiUsage || null,
    diff: result.diff ?? null,
    events,
    confirmations: optionalArray(result.confirmations, "confirmations"),
    prSubmission: result.prSubmission || null,
    prDraft: result.prDraft ?? null,
    checkpoints: result.checkpoints || null,
  };
  requireReadyForPrEvidence(response);
  return response;
}

function requireReadyForPrEvidence(run) {
  if (run.status !== "passed" && run.stage !== "ready_for_pr") {
    return;
  }
  requireObject(run.requirementCard, "requirementCard");
  requireObject(run.plan, "plan");
  requireObject(run.edit, "edit");
  requireObject(run.verification, "verification");
  requireNonEmptyText(run.diff, "diff");
  requireNonEmptyText(run.prDraft, "prDraft");
  requireObject(run.aiUsage, "aiUsage");
  requireNonEmptyArray(run.aiCalls, "aiCalls");
}

function requireObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Run result ${name} is required`);
  }
  return value;
}

function requireNonEmptyText(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Run result ${name} is required`);
  }
  return value;
}

function requireNonEmptyArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Run result ${name} is required`);
  }
  return value;
}

function requireArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`Run result ${name} must be an array`);
  }
  return value;
}

function optionalArray(value, name) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new Error(`Run result ${name} must be an array`);
  }
  return value;
}

function requireString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Run result ${name} is required`);
  }
  return value;
}

function requireRequirementInput(input) {
  if (typeof input !== "string" || input.trim() === "") {
    const error = new Error("Requirement input is required");
    error.statusCode = 400;
    throw error;
  }
  return input.trim();
}
