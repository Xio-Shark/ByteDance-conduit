import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { runP0Delivery } from "../../../services/orchestrator/src/orchestrator.js";
import { recallHistory } from "../../../services/orchestrator/src/historyRecall.js";
import { listSkills } from "../../../services/skills/src/registry.js";
import {
  createGitHubPrClient,
  GitHubConfigError,
  GitHubRequestError,
} from "../../../external/git-provider/src/githubPrClient.js";
import { submitDraftPr, PrSubmissionError } from "./prSubmission.js";
import { confirmRun, RunConfirmationError } from "./runConfirmation.js";
import { createRunStore } from "./runStore.js";
import { executeRun } from "./runWorkflow.js";
import { executeResume } from "./resumeWorkflow.js";
import { buildSubmissionItems } from "./submissionItems.js";

const PROJECT_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

export function createApp(options = {}) {
  const app = express();
  const context = createAppContext(options);

  configureMiddleware(app);
  registerSystemRoutes(app);
  registerHistoryRoutes(app, context);
  registerRunRoutes(app, context);
  registerErrorHandler(app);

  return app;
}

function createAppContext(options) {
  const projectRoot = options.projectRoot || PROJECT_ROOT;
  return {
    gitProvider: options.gitProvider || createGitHubPrClient,
    projectRoot,
    runDelivery: options.runDelivery || runP0Delivery,
    runStore: createRunStore(projectRoot),
  };
}

function configureMiddleware(app) {
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
}

function registerSystemRoutes(app) {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/skills", (req, res) => {
    res.json({ skills: listSkills() });
  });
}

function registerHistoryRoutes(app, { projectRoot }) {
  app.get("/api/history", async (req, res, next) => {
    try {
      res.json(await recallHistory({ input: requireQueryInput(req.query?.input), projectRoot }));
    } catch (error) {
      next(error);
    }
  });
}

function registerRunRoutes(app, context) {
  registerRunExecutionRoutes(app, context);
  registerRunEvidenceRoutes(app, context.runStore);
  registerRunReviewRoutes(app, context);
}

function registerRunExecutionRoutes(app, context) {
  const { runDelivery, runStore } = context;
  app.post("/api/runs", async (req, res, next) => {
    await sendRunExecution({
      input: req.body?.input,
      next,
      res,
      runDelivery,
      runStore,
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
}

function registerRunEvidenceRoutes(app, runStore) {
  app.get("/api/runs/:id", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);
    res.json(run);
  });

  app.get("/api/runs/:id/events", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return res.status(404).end();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    for (const event of run.events) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    res.end();
  });

  app.get("/api/runs/:id/diff", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);
    res.type("text/plain").send(run.diff);
  });

  app.get("/api/runs/:id/pr-draft", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);
    res.type("text/markdown").send(run.prDraft);
  });
}

function registerRunReviewRoutes(app, { gitProvider, projectRoot, runStore }) {
  app.post("/api/runs/:id/confirm", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);
    try {
      res.json(await confirmRun({ requestBody: req.body, run, runStore }));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/runs/:id/pr", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);

    try {
      const updatedRun = await submitDraftPr({
        env: process.env,
        gitProvider,
        requestBody: req.body,
        run,
        runStore,
      });
      res.status(201).json(updatedRun);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/runs/:id/submission", async (req, res, next) => {
    const run = await findRun(req.params.id, runStore);
    if (!run) return sendRunNotFound(res);
    res.json({
      runId: run.runId,
      evidenceDir: run.evidenceDir,
      items: buildSubmissionItems(projectRoot),
    });
  });
}

function registerErrorHandler(app) {
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(errorStatus(error)).json({
      error: {
        message: error.message,
      },
    });
  });
}

function sendRunNotFound(res) {
  return res.status(404).json({ error: { message: "Run not found" } });
}

function requireQueryInput(input) {
  if (typeof input !== "string" || input.trim() === "") {
    const error = new Error("History query input is required");
    error.statusCode = 400;
    throw error;
  }
  return input.trim();
}

function errorStatus(error) {
  if (error.statusCode) return error.statusCode;
  if (error instanceof RunConfirmationError) return 400;
  if (error instanceof PrSubmissionError) return 400;
  if (error instanceof GitHubConfigError) return 400;
  if (error instanceof GitHubRequestError) return 502;
  return 500;
}

async function sendRunExecution({ input, next, res, retryOf, runDelivery, runStore }) {
  try {
    const outcome = await executeRun({ input, retryOf, runDelivery, runStore });
    res.status(outcome.statusCode).json(outcome.body);
  } catch (error) {
    next(error);
  }
}

function findRun(runId, runStore) {
  return runStore.find(runId);
}
