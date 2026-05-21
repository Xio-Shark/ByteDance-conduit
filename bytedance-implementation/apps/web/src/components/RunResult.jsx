import {
  Loader2,
  Play,
} from "lucide-react";
import { AiUsagePanel } from "./AiUsagePanel.jsx";
import {
  EventsPanel,
  HistoryContext,
  HumanReviewPanel,
  SubmissionPanel,
} from "./ContextPanels.jsx";
import {
  DiffPanel,
  PrDraftPanel,
  VerificationPanel,
} from "./EvidencePanels.jsx";
import {
  ConfirmButton,
  ErrorNotice,
  List,
  Panel,
} from "./RunResultCommon.jsx";

export { ErrorNotice } from "./RunResultCommon.jsx";

export function RunResult({
  actions,
  loading,
  onPrRefsChange,
  prRefs,
  run,
  submission,
}) {
  const events = requireRunEvents(run);
  const evidenceState = buildEvidenceState(run, events);

  return (
    <div className="results">
      {run.error ? <ErrorNotice message={run.error} /> : null}
      {run.retryOf ? <div className="notice retry-notice">Retried from {run.retryOf}</div> : null}
      {run.status === "failed" ? (
        <button className="retry-button" disabled={loading} onClick={actions.retry}>
          {loading ? <Loader2 className="spin" /> : <Play />}
          <span>{loading ? "Retrying" : "Retry from input"}</span>
        </button>
      ) : null}
      {run.stage === "ready_for_pr" && run.status === "passed" ? (
        <div className="resume-actions">
          <button
            className="retry-button"
            disabled={loading}
            onClick={() => actions.resume("editing")}
            type="button"
          >
            {loading ? <Loader2 className="spin" /> : <Play />}
            <span>{loading ? "Resuming" : "Resume from edit (plan kept)"}</span>
          </button>
        </div>
      ) : null}

      <RequirementPanel
        onConfirm={actions.confirm}
        requirementCard={run.requirementCard}
      />
      <PlanPanel onConfirm={actions.confirm} plan={run.plan} />
      <HistoryContext historyRecall={run.historyRecall} />
      <VerificationPanel state={evidenceState.verification} verification={run.verification} />
      <AiUsagePanel aiCalls={run.aiCalls} aiUsage={run.aiUsage} state={evidenceState.aiUsage} />
      <DiffPanel diff={run.diff} state={evidenceState.diff} />
      <PrDraftPanel
        loading={loading}
        onConfirm={actions.confirm}
        onPrRefsChange={onPrRefsChange}
        onSubmitPr={actions.submitPr}
        prDraft={run.prDraft}
        prSubmission={run.prSubmission}
        prRefs={prRefs}
        state={evidenceState.prDraft}
      />
      <EventsPanel events={events} />
      {submission ? <SubmissionPanel submission={submission} /> : null}
      {run.confirmations?.length ? (
        <HumanReviewPanel confirmations={run.confirmations} />
      ) : null}
    </div>
  );
}

function RequirementPanel({ onConfirm, requirementCard }) {
  if (!requirementCard) return null;

  return (
    <Panel title="Requirement">
      <h2>{requirementCard.goal}</h2>
      <p>{requirementCard.source_input}</p>
      <List items={requirementCard.acceptance} />
      <ConfirmButton onConfirm={onConfirm} target="requirement" />
    </Panel>
  );
}

function PlanPanel({ onConfirm, plan }) {
  if (!plan) return null;

  return (
    <Panel title="Plan">
      <p>{plan.summary}</p>
      <p className="muted">Skill: {plan.skill_id}</p>
      {plan.history_references?.length ? (
        <div className="history-refs">
          <p className="muted">History references</p>
          <List
            items={plan.history_references.map(
              (ref) => `${ref.run_id} (${ref.score}): ${ref.goal}`,
            )}
          />
        </div>
      ) : null}
      {plan.impact_matrix?.cross_stack ? (
        <p className="muted">Cross-stack: frontend + backend</p>
      ) : null}
      <List items={plan.target_files} />
      <ConfirmButton onConfirm={onConfirm} target="plan" />
    </Panel>
  );
}

function buildEvidenceState(run, events) {
  const reachedVerification = hasReached(run, events, ["verifying", "pr_drafting", "ready_for_pr", "failed"]);
  const reachedDiff = hasReached(run, events, ["editing", "verifying", "pr_drafting", "ready_for_pr", "failed"]);
  const reachedPrDraft = hasReached(run, events, ["pr_drafting", "ready_for_pr"]);
  const finished = ["passed", "failed"].includes(run.status);

  return {
    verification: evidenceState({
      available: Boolean(run.verification),
      expected: reachedVerification,
      message: `Verification evidence missing for ${run.runId} at ${run.stage}`,
    }),
    diff: evidenceState({
      available: hasText(run.diff),
      expected: reachedDiff,
      message: `Diff evidence missing for ${run.runId} at ${run.stage}`,
    }),
    prDraft: evidenceState({
      available: hasText(run.prDraft),
      expected: reachedPrDraft,
      message: `PR draft evidence missing for ${run.runId} at ${run.stage}`,
    }),
    aiUsage: evidenceState({
      available: Boolean(run.aiUsage) && Array.isArray(run.aiCalls) && run.aiCalls.length > 0,
      expected: finished,
      message: `AI usage evidence missing for ${run.runId} at ${run.stage}`,
    }),
  };
}

function evidenceState({ available, expected, message }) {
  if (available) return { status: "available" };
  if (expected) return { status: "missing", message };
  return { status: "pending" };
}

function hasReached(run, events, stages) {
  if (stages.includes(run.stage)) return true;
  return events.some((event) => stages.includes(event.stage));
}

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function requireRunEvents(run) {
  if (!Array.isArray(run.events)) {
    throw new Error(`Run ${run.runId} events evidence is required`);
  }
  return run.events;
}
