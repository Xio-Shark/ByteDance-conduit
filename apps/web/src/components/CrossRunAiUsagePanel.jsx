import { useEffect, useState } from "react";
import { loadAiUsageSummary } from "../api.js";
import {
  Panel,
  UsageMetric,
} from "./RunResultCommon.jsx";

function formatCost(value) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value < 0.01 ? value.toFixed(4) : value.toFixed(3);
}

export function CrossRunAiUsagePanel() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadAiUsageSummary()
      .then((payload) => {
        if (active) setSummary(payload);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <Panel title="跨运行 AI 用量">
        <p className="muted">{error}</p>
      </Panel>
    );
  }

  if (!summary) {
    return (
      <Panel title="跨运行 AI 用量">
        <p className="muted">正在加载归档运行指标...</p>
      </Panel>
    );
  }

  const hasLlmMetrics = summary.totals.tokensIn + summary.totals.tokensOut > 0;
  const isMissing = summary.status === "missing";

  return (
    <Panel title="跨运行 AI 用量">
      <p className="muted">
        {isMissing
          ? "没有可用的、包含有效 ai-calls.jsonl 的已通过归档运行。"
          : `已汇总 ${summary.runCount} 个包含 ai-calls.jsonl 的已通过归档运行${hasLlmMetrics ? "，包含非零 LLM 用量" : ""}。`}
        {summary.skipped?.length ? ` 已跳过 ${summary.skipped.length} 个不完整或失败运行。` : ""}
      </p>
      <div className="usage-grid">
        <UsageMetric label="运行数" value={summary.runCount} />
        <UsageMetric label="已跳过" value={summary.skipped?.length ?? 0} />
        <UsageMetric label="输入 tokens" value={summary.totals.tokensIn} />
        <UsageMetric label="输出 tokens" value={summary.totals.tokensOut} />
        <UsageMetric label="延迟" value={`${summary.totals.latencyMs}ms`} />
        <UsageMetric label="成本" value={formatCost(summary.totals.costEstimate)} />
      </div>
      <CrossRunList summary={summary} />
    </Panel>
  );
}

function CrossRunList({ summary }) {
  const runs = summary.byRun?.length ? summary.byRun : summary.runs;
  if (!runs?.length) return null;

  return (
    <ol className="cross-run-list">
      {runs.slice(0, 8).map((run) => (
        <li key={run.runId}>
          <strong>{run.runId}</strong>
          <span className="muted">{runSummary(run)}</span>
        </li>
      ))}
    </ol>
  );
}

function runSummary(run) {
  if (run.summary) {
    return `${run.primaryModel} · 输入 ${run.summary.tokensIn} · 输出 ${run.summary.tokensOut}`;
  }
  return `输入 ${run.tokensIn} · 输出 ${run.tokensOut} · ${run.latencyMs}ms`;
}
