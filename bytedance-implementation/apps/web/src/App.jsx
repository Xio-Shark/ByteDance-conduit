import React, { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Play,
  ScrollText,
} from "lucide-react";
import {
  createRun,
  resumeFromStage as resumeDeliveryRun,
  retryRun as retryDeliveryRun,
  confirmRun as confirmDeliveryRun,
  submitPr as submitDraftPr,
  loadSubmission,
} from "./api.js";
import { ErrorNotice, RunResult } from "./components/RunResult.jsx";

const DEFAULT_INPUT = "给文章列表加阅读量展示，前端假数据即可，不改后端。";

export function App() {
  const consoleState = useConsoleState();
  const actions = useRunActions(consoleState);

  return <ConsoleLayout actions={actions} consoleState={consoleState} />;
}

function useConsoleState() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prRefs, setPrRefs] = useState({ base: "", head: "" });
  const [submission, setSubmission] = useState(null);
  return {
    error,
    input,
    loading,
    prRefs,
    run,
    setError,
    setInput,
    setLoading,
    setPrRefs,
    setRun,
    setSubmission,
    submission,
  };
}

function useRunActions(consoleState) {
  const { input, prRefs, run } = consoleState;
  async function startRun() {
    await executeRunRequest(consoleState, () => createRun(input));
  }

  async function retryRun() {
    const activeRun = requireActiveRun(run, "retry");
    await executeRunRequest(consoleState, () => retryDeliveryRun(activeRun.runId, input));
  }

  async function resumeRun(stage) {
    const activeRun = requireActiveRun(run, "resume");
    await executeRunRequest(consoleState, () =>
      resumeDeliveryRun(activeRun.runId, { stage, revisedInput: input }),
    );
  }

  async function confirmRun(target) {
    await executeRunAction(consoleState, "confirm", async (activeRun) => {
      consoleState.setRun(await confirmDeliveryRun(activeRun.runId, target));
    });
  }

  async function submitPr() {
    consoleState.setLoading(true);
    await executeRunAction(consoleState, "submit PR", async (activeRun) => {
      consoleState.setRun(await submitDraftPr(activeRun.runId, prRefs));
    });
    consoleState.setLoading(false);
  }

  return { confirm: confirmRun, resume: resumeRun, retry: retryRun, start: startRun, submitPr };
}

async function executeRunRequest(consoleState, requestRun) {
  consoleState.setLoading(true);
  consoleState.setError("");
  consoleState.setSubmission(null);
  try {
    await setRunWithSubmission(consoleState, await requestRun());
  } catch (runError) {
    if (runError.run) await setRunWithSubmission(consoleState, runError.run);
    consoleState.setError(runError.message);
  } finally {
    consoleState.setLoading(false);
  }
}

async function setRunWithSubmission(consoleState, nextRun) {
  consoleState.setRun(nextRun);
  consoleState.setSubmission(await loadSubmission(nextRun.runId));
}

async function executeRunAction(consoleState, actionName, action) {
  consoleState.setError("");
  try {
    await action(requireActiveRun(consoleState.run, actionName));
  } catch (actionError) {
    consoleState.setError(actionError.message);
  }
}

function ConsoleLayout({ actions, consoleState }) {
  const { loading, run } = consoleState;

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Conduit Delivery Console</p>
          <h1>PM 到 PR 的端到端交付控制台</h1>
        </div>
        <StatusBadge run={run} loading={loading} />
      </section>

      <section className="workspace">
        <aside className="rail">
          <StageList run={run} loading={loading} />
        </aside>

        <MainPanel actions={actions} consoleState={consoleState} />
      </section>
    </main>
  );
}

function MainPanel({ actions, consoleState }) {
  const { error, input, loading, prRefs, run, setInput, setPrRefs, submission } = consoleState;
  return (
    <section className="main-panel">
      <div className="input-row">
        <textarea
          aria-label="PM requirement"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button disabled={loading} onClick={actions.start} title="Start run">
          {loading ? <Loader2 className="spin" /> : <Play />}
          <span>{loading ? "Running" : "Run P0"}</span>
        </button>
      </div>

      {error ? <ErrorNotice message={error} /> : null}
      {run ? (
        <RunResult
          actions={{ confirm: actions.confirm, retry: actions.retry, submitPr: actions.submitPr }}
          loading={loading}
          onPrRefsChange={setPrRefs}
          prRefs={prRefs}
          run={run}
          submission={submission}
        />
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

function requireActiveRun(run, actionName) {
  if (!run) {
    throw new Error(`Cannot ${actionName} without an active run`);
  }
  return run;
}

function StatusBadge({ loading, run }) {
  if (loading) return <span className="badge running">Running</span>;
  if (!run) return <span className="badge idle">Idle</span>;
  if (run.status === "failed") return <span className="badge failed">Failed</span>;
  return <span className="badge ready">{run.stage}</span>;
}

function StageList({ loading, run }) {
  const stages = [
    { id: "clarify", eventStage: "clarifying" },
    { id: "plan", eventStage: "planning" },
    { id: "edit", eventStage: "editing" },
    { id: "verify", eventStage: "verifying" },
    { id: "pr", eventStage: "pr_drafting" },
  ];
  const events = run ? requireRunEvents(run) : [];
  const seenStages = new Set(events.map((event) => event.stage));
  const failedStage = findFailedStage(run);

  return (
    <ol className="stages">
      {stages.map((stage) => (
        <li className={stageClass(stage, seenStages, failedStage)} key={stage.id}>
          <CheckCircle2 />
          <span>{stage.id}</span>
        </li>
      ))}
      {loading ? (
        <li className="active">
          <Loader2 className="spin" />
          <span>executing</span>
        </li>
      ) : null}
    </ol>
  );
}

function stageClass(stage, seenStages, failedStage) {
  if (!seenStages.has(stage.eventStage)) {
    return "";
  }
  if (failedStage === stage.eventStage) {
    return "failed-step";
  }
  return "done";
}

function findFailedStage(run) {
  if (run?.status !== "failed") return null;
  const events = requireRunEvents(run);
  const failedIndex = events.findLastIndex((event) => event.stage === "failed");
  if (failedIndex <= 0) return "failed";
  return events[failedIndex - 1].stage;
}

function requireRunEvents(run) {
  if (!Array.isArray(run.events)) {
    throw new Error(`Run ${run.runId} events evidence is required`);
  }
  return run.events;
}

function EmptyState() {
  return (
    <div className="empty">
      <ScrollText />
      <p>运行后这里会展示需求卡片、方案、diff、验证结果和 PR 草稿。</p>
    </div>
  );
}
