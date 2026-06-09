import {
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  ConfirmButton,
  EvidencePanelFrame,
} from "./RunResultCommon.jsx";

export function VerificationPanel({ state, verification }) {
  return (
    <EvidencePanelFrame state={state} title="验证">
      <VerificationContent verification={verification} />
    </EvidencePanelFrame>
  );
}

export function DiffPanel({ diff, state }) {
  return (
    <EvidencePanelFrame state={state} title="代码差异">
      <pre className="diff">{diff}</pre>
    </EvidencePanelFrame>
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
  return (
    <EvidencePanelFrame state={state} title="PR 草稿">
      <PrDraftContent
        loading={loading}
        onConfirm={onConfirm}
        onPrRefsChange={onPrRefsChange}
        onSubmitPr={onSubmitPr}
        prDraft={prDraft}
        prRefs={prRefs}
        prSubmission={prSubmission}
      />
    </EvidencePanelFrame>
  );
}

function VerificationContent({ verification }) {
  return (
    <div className="checks">
      {verification.checks.map((check) => (
        <div className={checkClass(check)} key={check.command}>
          <span>{check.command}</span>
          <strong>{checkStatusLabel(check)}</strong>
        </div>
      ))}
    </div>
  );
}

function PrDraftContent({
  loading,
  onConfirm,
  onPrRefsChange,
  onSubmitPr,
  prDraft,
  prRefs,
  prSubmission,
}) {
  return (
    <>
      <pre>{prDraft}</pre>
      {prDraft ? (
        <div className="pr-actions">
          <ConfirmButton onConfirm={onConfirm} target="pr" />
          <PrRefField
            label="head 分支"
            onChange={(head) => onPrRefsChange({ ...prRefs, head })}
            value={prRefs.head}
          />
          <PrRefField
            label="base 分支"
            onChange={(base) => onPrRefsChange({ ...prRefs, base })}
            value={prRefs.base}
          />
          <button className="submit-pr-button" disabled={loading} onClick={onSubmitPr}>
            {loading ? <Loader2 className="spin" /> : <CheckCircle2 />}
            <span>{loading ? "提交中" : "提交 PR"}</span>
          </button>
        </div>
      ) : null}
      {prSubmission ? <PrSubmission submission={prSubmission} /> : null}
    </>
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

function checkStatusLabel(check) {
  const labels = {
    failed: "失败",
    passed: "通过",
    skipped: "已跳过",
  };
  if (check.status) return labels[check.status] || check.status;
  return `退出码 ${check.exitCode}`;
}
