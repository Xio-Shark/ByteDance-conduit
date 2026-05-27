import { continueDelivery } from "../../../services/orchestrator/src/orchestrator.js";
import { toRunResponse } from "./runWorkflow.js";

export async function executeContinue({ runId, runStore, projectRoot }) {
  const existing = await runStore.find(runId);
  if (!existing) {
    const error = new Error("Run not found");
    error.statusCode = 404;
    throw error;
  }

  if (existing.status !== "paused") {
    const error = new Error("Only paused runs can continue");
    error.statusCode = 400;
    throw error;
  }

  try {
    const result = await continueDelivery({
      runId,
      projectRoot,
      env: process.env,
    });
    const response = toRunResponse(result, existing.sourceInput, existing.retryOf);
    runStore.set(response);
    await runStore.persistMetadata(response);
    return { statusCode: result.status === "paused" ? 202 : 200, body: response };
  } catch (error) {
    if (!error.runResult) throw error;

    const response = toRunResponse(error.runResult, existing.sourceInput, existing.retryOf);
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
