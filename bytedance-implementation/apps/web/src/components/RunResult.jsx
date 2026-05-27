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
  ErrorNotice,
} from "./RunResultCommon.jsx";
import {
  PlanPanel,
  RequirementPanel,
} from "./RunResultPanels.jsx";
import { createResumeFromEditHandler } from "./runResultActions.js";
import { buildEvidenceState } from "./runEvidenceState.js";

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
  const resumeFromEdit = createResumeFromEditHandler(actions);

  return (
    <div className="results">
      {run.error ? <ErrorNotice message={run.error} /> : null}
      {run.retryOf ? <div className="notice retry-notice">Retried from {run.retryOf}</div> : null}
      {run.status === "failed" ? (
        <RunActionButton
          loading={loading}
          loadingLabel="Retrying"
          onClick={actions.retry}
          readyLabel="Retry from input"
        />
      ) : null}
      {run.status === "paused" ? (
        <RunActionButton
          loading={loading}
          loadingLabel="Continuing"
          onClick={actions.continueRun}
          readyLabel="Continue after confirm"
        />
      ) : null}
      {run.stage === "ready_for_pr" && run.status === "passed" ? (
        <div className="resume-actions">
          <RunActionButton
            loading={loading}
            loadingLabel="Resuming"
            onClick={resumeFromEdit}
            readyLabel="Resume from edit (plan kept)"
          />
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

function RunActionButton({ loading, loadingLabel, onClick, readyLabel }) {
  return (
    <button className="retry-button" disabled={loading} onClick={onClick} type="button">
      {loading ? <Loader2 className="spin" /> : <Play />}
      <span>{loading ? loadingLabel : readyLabel}</span>
    </button>
  );
}

function requireRunEvents(run) {
  if (!Array.isArray(run.events)) {
    throw new Error(`Run ${run.runId} events evidence is required`);
  }
  return run.events;
}
