import {
  MissingEvidencePanel,
  Panel,
} from "./RunResultCommon.jsx";

export function EventsPanel({ events }) {
  return (
    <PanelList
      className="events"
      items={events}
      renderItem={(event) => (
        <div className="event" key={`${event.at}-${event.stage}-${event.message}`}>
          <span>{eventStageLabel(event.stage)}</span>
          <p>{event.message}</p>
        </div>
      )}
      title="事件"
    />
  );
}

export function SubmissionPanel({ submission }) {
  return (
    <PanelList
      className="submission"
      items={submission.items}
      renderItem={(item) => (
        <div className="submission-item" key={item.id}>
          <span>{item.label}</span>
          <strong>{submissionStatusLabel(item.status)}</strong>
        </div>
      )}
      title="提交检查"
    />
  );
}

export function HumanReviewPanel({ confirmations }) {
  return (
    <PanelList
      className="confirmations"
      items={confirmations}
      renderItem={(confirmation) => (
        <div className="confirmation" key={`${confirmation.target}-${confirmation.at}`}>
          <span>{reviewTargetLabel(confirmation.target)}</span>
          <strong>{reviewDecisionLabel(confirmation.decision)}</strong>
        </div>
      )}
      title="人工审阅"
    />
  );
}

function PanelList({ className, items, renderItem, title }) {
  return (
    <Panel title={title}>
      <div className={className}>
        {items.map(renderItem)}
      </div>
    </Panel>
  );
}

export function HistoryContext({ historyRecall }) {
  if (!historyRecall?.matches?.length) {
    if (historyRecall?.status === "degraded") {
      return (
        <MissingEvidencePanel
          detail={`已跳过 ${historyRecall.skipped?.length ?? 0} 个不完整归档。`}
          title="历史上下文"
        />
      );
    }
    return null;
  }

  return (
    <Panel title="历史上下文">
      {historyRecall.status === "degraded" ? (
        <p className="muted">
          召回降级（已跳过 {historyRecall.skipped?.length ?? 0} 个不完整归档）
        </p>
      ) : null}
      <div className="history-list">
        {historyRecall.matches.map((match) => (
          <div className="history-item" key={match.runId}>
            <div>
              <strong>{match.goal}</strong>
              <p>{match.summary}</p>
              <span>{match.skillId || "无技能"}</span>
            </div>
            <span className="score">{Math.round(match.score * 100)}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function eventStageLabel(stage) {
  const labels = {
    clarifying: "需求澄清",
    editing: "代码修改",
    failed: "失败",
    human_confirm: "人工确认",
    planning: "方案拆解",
    pr_drafting: "PR 草稿",
    pr_submitted: "PR 已提交",
    retry: "重试",
    verifying: "验证",
  };
  return labels[stage] || stage;
}

function reviewTargetLabel(target) {
  const labels = {
    plan: "方案",
    pr: "PR",
    requirement: "需求",
  };
  return labels[target] || target;
}

function reviewDecisionLabel(decision) {
  const labels = {
    approved: "已确认",
    rejected: "已拒绝",
  };
  return labels[decision] || decision;
}

function submissionStatusLabel(status) {
  const labels = {
    manual: "需人工处理",
    missing: "缺失",
    pending: "待处理",
    ready: "就绪",
  };
  return labels[status] || status;
}
