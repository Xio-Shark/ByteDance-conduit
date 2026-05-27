# Architecture

对齐文档仓 [`docs/07-architecture-overview.md`](../../../../docs/07-architecture-overview.md) 与 [`03-spec.md`](../../../../docs/03-spec.md)。
更新时间：**2026-05-22**（H1–H16 仅代表本地代码 / run 验收闭合；§8.2 / F-011 的视频、公开仓、团队链接仍待人工）。

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
| `apps/web` | 需求输入、阶段、证据、AI Usage、History、diff、PR、submission、**resume-from-stage** | ✅ H7 |
| `apps/api` | run、history、events、diff、pr、submission、**POST .../resume-from-stage** | ✅ H6 |
| `services/orchestrator` | clarify→plan→edit→verify→pr；**checkpoints** 事件溯源 | ✅ H5 |
| `services/agents` | 需求/计划/编码/验证/PR；rules + **`clarifyWithLlm`** | ✅ H3–H4 |
| `services/skills` | **4 个 Skill**（L1 阅读量、L2 草稿、详情字数、Popular Tags 前 5） | ✅ H10–H12 + 第 4 Skill |
| `services/sandbox` | Conduit 读写、git、npm | ✅ |
| `external/git-provider` | GitHub draft PR | ✅ 契约；H17 远端 PR 为可选项 |

## AI 双路径

| 路径 | 用途 | 状态 |
|------|------|------|
| `AI_MODE=rules` | 代码级 P0；`rules-first-p0` | ✅ |
| `AI_MODE=llm` | §2.2 模糊澄清；`mimo-v2.5` | ✅ `run-2026-05-21T05-58-01-181Z` |

清晰 L1 的 legacy doubao run **不计入** §2.2 #6。

## 历史上下文

`historyRecall.js` 扫描 `requirement.md` / `plan.md`；坏归档标 `degraded` / `skipped`（H1–H2）。plan 阶段写入 **`history_references`**（H8–H9）。

## 可观测性

`aiUsage.js` + Web `AiUsagePanel` 解析 `ai-calls.jsonl`；非零 LLM metrics 见 H4 验收 run（H13）。跨 run 汇总只统计 passed run，且要求 `run-summary.json.aiUsage` 与 `ai-calls.jsonl` 汇总一致；失败/不完整归档进入 `skipped`。

## PR 提交

`POST /api/runs/:id/pr` 须 `confirm=true`、`head`、`base` 及 GitHub 配置；无 token 时仅本地 `pr-draft.md`。

## 边界

**代码级 P0**：rules + L1 Skill。**课题答辩**：§2.2 六项代码 / run 证据已归档，但这只说明 H1–H16 本地验收闭合；§8.2 / F-011 的 S7 视频、公开 AI 主仓、Demo / 视频 URL 与团队链接仍未闭合，见 [`defense-prep.md`](./defense-prep.md)。
