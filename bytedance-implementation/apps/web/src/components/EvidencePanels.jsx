import {
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  ConfirmButton,
  MissingEvidencePanel,
  Panel,
} from "./RunResultCommon.jsx";

export function VerificationPanel({ state, verification }) {
  if (state.status === "pending") return null;
  if (state.status === "missing") {
    return <MissingEvidencePanel detail={state.message} title="Verification" />;
  }

  return (
    <Panel title="Verification">
      <div className="checks">
        {verification.checks.map((check) => (
          <div className={checkClass(check)} key={check.command}>
            <span>{check.command}</span>
            <strong>{check.status || `exit ${check.exitCode}`}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function DiffPanel({ diff, state }) {
  if (state.status === "pending") return null;
  if (state.status === "missing") {
    return <MissingEvidencePanel detail={state.message} title="Diff" />;
  }

  return (
    <Panel title="Diff">
      <pre className="diff">{diff}</pre>
    </Panel>
  );
}

export function PrDraftPanel({
  loading,
  onConfirm,
  onPrRefsChange,
  onSubmitPr,
  prDraft,
  prRefs,
  prSubmission,
  state,
}) {
  if (state.status === "pending") return null;
  if (state.status === "missing") {
    return <MissingEvidencePanel detail={state.message} title="PR Draft" />;
  }

  return (
    <Panel title="PR Draft">
      <pre>{prDraft}</pre>
      {prDraft ? (
        <div className="pr-actions">
          <ConfirmButton onConfirm={onConfirm} target="pr" />
          <PrRefField
            label="head"
            onChange={(head) => onPrRefsChange({ ...prRefs, head })}
            value={prRefs.head}
          />
          <PrRefField
            label="base"
            onChange={(base) => onPrRefsChange({ ...prRefs, base })}
            value={prRefs.base}
          />
          <button className="submit-pr-button" disabled={loading} onClick={onSubmitPr}>
            {loading ? <Loader2 className="spin" /> : <CheckCircle2 />}
            <span>{loading ? "Submitting" : "Submit PR"}</span>
          </button>
        </div>
      ) : null}
      {prSubmission ? <PrSubmission submission={prSubmission} /> : null}
    </Panel>
  );
}

function PrRefField({ label, onChange, value }) {
  return (
    <label className="pr-ref-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function PrSubmission({ submission }) {
  return (
    <div className="pr-submission">
      <span>PR #{submission.number}</span>
      <strong>{submission.state}</strong>
      {submission.url ? <a href={submission.url}>{submission.url}</a> : null}
    </div>
  );
}

function checkClass(check) {
  return check.exitCode === 0 ? "check" : "check failed-check";
}
