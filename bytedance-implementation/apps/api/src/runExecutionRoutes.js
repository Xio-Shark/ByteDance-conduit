import { executeContinue } from "./continueWorkflow.js";
import { executeResume } from "./resumeWorkflow.js";
import { executeRun } from "./runWorkflow.js";
import { findRun, sendRunNotFound } from "./runRouteHelpers.js";

export function registerRunExecutionRoutes(app, context) {
  const { projectRoot, runDelivery, runStore } = context;

  app.post("/api/runs", async (req, res, next) => {
    await sendRunExecution({
      input: req.body?.input,
      next,
      res,
      runDelivery,
      runStore,
      projectRoot,
    });
  });

  app.post("/api/runs/:id/retry", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);
    const input = Object.hasOwn(req.body ?? {}, "input") ? req.body.input : run.sourceInput;
    await sendRunExecution({
      input,
      next,
      res,
      retryOf: run.runId,
      runDelivery,
      runStore,
      projectRoot,
    });
  });

  app.post("/api/runs/:id/resume-from-stage", async (req, res, next) => {
    try {
      const outcome = await executeResume({
        runId: req.params.id,
        stage: req.body?.stage,
        revisedInput: req.body?.revisedInput,
        projectRoot: context.projectRoot,
        runStore,
      });
      res.status(outcome.statusCode).json(outcome.body);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/runs/:id/continue", async (req, res, next) => {
    try {
      const outcome = await executeContinue({
        runId: req.params.id,
        projectRoot: context.projectRoot,
        runStore,
      });
      res.status(outcome.statusCode).json(outcome.body);
    } catch (error) {
      next(error);
    }
  });
}

async function sendRunExecution({ input, next, projectRoot, res, retryOf, runDelivery, runStore }) {
  try {
    const outcome = await executeRun({ input, projectRoot, retryOf, runDelivery, runStore });
    res.status(outcome.statusCode).json(outcome.body);
  } catch (error) {
    next(error);
  }
}
