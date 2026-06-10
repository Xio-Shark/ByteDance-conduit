import {
  EvidencePanelFrame,
  UsageMetric,
} from "./RunResultCommon.jsx";

export function AiUsagePanel({ aiCalls, aiUsage, state }) {
  return (
    <EvidencePanelFrame state={state} title="AI 用量">
      <AiUsageContent aiCalls={aiCalls} aiUsage={aiUsage} />
    </EvidencePanelFrame>
  );
}

function AiUsageContent({ aiCalls, aiUsage }) {
  const hasLlmMetrics = aiUsage.tokensIn + aiUsage.tokensOut > 0;

  return (
    <>
      {hasLlmMetrics ? (
        <p className="usage-llm-badge">已记录 LLM 指标（token 非零）</p>
      ) : (
        <p className="muted">规则模式或零 token 运行</p>
      )}
      <div className="usage-grid">
        <UsageMetric label="输入 tokens" value={aiUsage.tokensIn} />
        <UsageMetric label="输出 tokens" value={aiUsage.tokensOut} />
        <UsageMetric label="延迟" value={`${aiUsage.latencyMs}ms`} />
        <UsageMetric label="成本" value={formatCost(aiUsage.costEstimate)} />
      </div>
      <div className="usage-calls">
        {aiCalls.map((call) => (
          <div className="usage-call" key={`${call.stage}-${call.model}`}>
            <span>{aiStageLabel(call.stage)}</span>
            <strong>{call.model}</strong>
            <small>{aiCallStatusLabel(call.status)}</small>
          </div>
        ))}
      </div>
    </>
  );
}

function formatCost(value) {
  if (value === null || value === undefined) return "缺失";
  return Number(value).toFixed(4);
}

function aiStageLabel(stage) {
  const labels = {
    clarify: "澄清",
    edit: "修改",
    plan: "方案",
    pr: "PR",
    verify: "验证",
  };
  return labels[stage] || stage;
}

function aiCallStatusLabel(status) {
  const labels = {
    failed: "失败",
    passed: "通过",
    skipped: "已跳过",
  };
  return labels[status] || status;
}
