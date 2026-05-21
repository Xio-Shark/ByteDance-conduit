import { resumeFromStage } from "../../../services/orchestrator/src/orchestrator.js";
import { toRunResponse } from "./runWorkflow.js";

export async function executeResume({ runId, stage, revisedInput, runStore, projectRoot }) {
  const existing = await runStore.find(runId);
  if (!existing) {
    const error = new Error("Run not found");
    error.statusCode = 404;
    throw error;
  }

  if (existing.status !== "passed" && existing.stage !== "ready_for_pr") {
    const error = new Error("Only completed runs can resume-from-stage");
    error.statusCode = 400;
    throw error;
  }

  try {
    const result = await resumeFromStage({
      runId,
      stage,
      revisedInput,
      projectRoot,
      env: process.env,
    });
    const response = toRunResponse(result, result.requirementCard.source_input, existing.retryOf);
    runStore.set(response);
    await runStore.persistMetadata(response);
    return { statusCode: 200, body: response };
  } catch (error) {
    if (!error.runResult) throw error;

    const response = toRunResponse(error.runResult, revisedInput || existing.sourceInput, existing.retryOf);
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
