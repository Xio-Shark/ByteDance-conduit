import {
  MissingEvidencePanel,
  Panel,
} from "./RunResultCommon.jsx";

export function EventsPanel({ events }) {
  return (
    <Panel title="Events">
      <div className="events">
        {events.map((event) => (
          <div className="event" key={`${event.at}-${event.stage}-${event.message}`}>
            <span>{event.stage}</span>
            <p>{event.message}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function SubmissionPanel({ submission }) {
  return (
    <Panel title="Submission">
      <div className="submission">
        {submission.items.map((item) => (
          <div className="submission-item" key={item.id}>
            <span>{item.label}</span>
            <strong>{item.status}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function HumanReviewPanel({ confirmations }) {
  return (
    <Panel title="Human Review">
      <div className="confirmations">
        {confirmations.map((confirmation) => (
          <div className="confirmation" key={`${confirmation.target}-${confirmation.at}`}>
            <span>{confirmation.target}</span>
            <strong>{confirmation.decision}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function HistoryContext({ historyRecall }) {
  if (!historyRecall?.matches?.length) {
    if (historyRecall?.status === "degraded") {
      return (
        <MissingEvidencePanel
          detail={`Skipped ${historyRecall.skipped?.length ?? 0} incomplete archives.`}
          title="History Context"
        />
      );
    }
    return null;
  }

  return (
    <Panel title="History Context">
      {historyRecall.status === "degraded" ? (
        <p className="muted">
          Degraded recall ({historyRecall.skipped?.length ?? 0} incomplete archives skipped)
        </p>
      ) : null}
      <div className="history-list">
        {historyRecall.matches.map((match) => (
          <div className="history-item" key={match.runId}>
            <div>
              <strong>{match.goal}</strong>
              <p>{match.summary}</p>
              <span>{match.skillId || "no skill"}</span>
            </div>
            <span className="score">{Math.round(match.score * 100)}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
