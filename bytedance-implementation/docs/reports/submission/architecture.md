# Architecture

对齐文档仓 [`docs/07-architecture-overview.md`](../../../../docs/07-architecture-overview.md) 与 [`03-spec.md`](../../../../docs/03-spec.md)。

```text
PM
  -> apps/web React console
  -> apps/api Express API
  -> services/orchestrator
  -> services/agents
  -> services/skills
  -> services/sandbox
  -> sandbox-repo Conduit clone
  -> external/git-provider
  -> docs/reports evidence
```

## 模块职责

| 模块 | 职责 | §2.2 状态 |
|------|------|-----------|
| `apps/web` | 需求输入、阶段、证据、AI Usage、History、diff、PR、submission | 缺 `resume-from-stage` UI（H7） |
| `apps/api` | run、history、events、diff、pr、submission | 缺 `POST .../resume-from-stage`（H6） |
| `services/orchestrator` | clarify→plan→edit→verify→pr；证据归档 | 线性管道；待事件溯源（H5） |
| `services/agents` | 需求/计划/编码/验证/PR | rules 硬编码 + `clarifyWithLlm`（llm） |
| `services/skills` | 需求模式注册 | 仅 1 个 L1 Skill（H10–H12 待增） |
| `services/sandbox` | Conduit 读写、git、npm | 已闭环 |
| `external/git-provider` | GitHub draft PR | 已闭环；H17 待远端 URL |

## AI 双路径

| 路径 | 用途 | 状态 |
|------|------|------|
| `AI_MODE=rules` | 代码级 P0 胶水；`rules-first-p0` | ✅ 已验收 |
| `AI_MODE=llm` | 课题完成 clarify；`clarifyWithLlm` + `LLM_*` | 🟡 已接入；H4 模糊输入 run 待验 |

清晰 L1 输入的 legacy `aiMode: doubao` 探索 run **不计入** §2.2 #6。

## 历史上下文

`historyRecall.js` 扫描已落盘 `requirement.md` / `plan.md`。损坏归档使整体状态为 `invalid_history`（当前 3 条坏归档，H1）。plan 阶段 **尚未** 引用召回（H8）。

## 可观测性

`aiUsage.js` 解析 `ai-calls.jsonl`。规则模式 tokens=0 为预期；课题完成须 H4 验收 run 的非零 metrics（H13 面板汇总）。

## PR 提交

`POST /api/runs/:id/pr` 须显式 `confirm=true`、`head`、`base` 及 GitHub 配置；成功写入 metadata `prSubmission`。

## 边界

**代码级 P0**：rules + L1 Skill。**课题完成**：§2.2 六项 + §8.2；详见 [`checklist.md`](./checklist.md) 与文档仓 [`06-plan`](../../../../docs/06-plan.md#冲刺关键路径进度-ssot)。
