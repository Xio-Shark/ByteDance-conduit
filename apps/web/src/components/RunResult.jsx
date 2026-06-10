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
import {
  canContinueAfterConfirm,
  canResumeClarification,
  createResumeClarificationHandler,
  createResumeFromEditHandler,
  isClarificationAwaitingAnswer,
} from "./runResultActions.js";
import {
  buildEvidenceState,
  requireRunEvents,
} from "./runEvidenceState.js";

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
  const resumeClarification = createResumeClarificationHandler(actions);

  return (
    <div className="results">
      {run.error ? <ErrorNotice message={run.error} /> : null}
      {run.retryOf ? <div className="notice retry-notice">从 {run.retryOf} 重试</div> : null}
      {run.status === "failed" ? (
        <RunActionButton
          loading={loading}
          loadingLabel="重试中"
          onClick={actions.retry}
          readyLabel="按当前输入重试"
        />
      ) : null}
      {canContinueAfterConfirm(run) ? (
        <RunActionButton
          loading={loading}
          loadingLabel="继续中"
          onClick={actions.continueRun}
          readyLabel="确认后继续"
        />
      ) : null}
      {isClarificationAwaitingAnswer(run) ? (
        <ClarificationResumeAction
          loading={loading}
          onResume={resumeClarification}
          run={run}
        />
      ) : null}
      {run.stage === "ready_for_pr" && run.status === "passed" ? (
        <div className="resume-actions">
          <RunActionButton
            loading={loading}
            loadingLabel="续跑中"
            onClick={resumeFromEdit}
            readyLabel="从代码修改续跑（保留方案）"
          />
        </div>
      ) : null}

      <RequirementPanel
        onConfirm={actions.confirm}
        onClarificationAnswered={actions.refreshClarificationHistory}
        pendingQuestions={run.pendingQuestions}
        clarificationHistory={run.clarificationHistory}
        requirementCard={run.requirementCard}
        runId={run.runId}
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

function ClarificationResumeAction({ loading, onResume, run }) {
  const pendingCount = (run.pendingQuestions || []).length;
  if (pendingCount > 0) {
    return (
      <div className="notice retry-notice">
        还有 {pendingCount} 个澄清问题未回答，回答后才能继续细化。
      </div>
    );
  }

  if (!canResumeClarification(run)) {
    return (
      <div className="notice retry-notice">
        至少提交一条 PM 澄清回答后，才能继续细化。
      </div>
    );
  }

  return (
    <div className="resume-actions">
      <RunActionButton
        loading={loading}
        loadingLabel="续跑中"
        onClick={onResume}
        readyLabel="带澄清回答续跑"
      />
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
