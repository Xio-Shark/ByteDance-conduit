# Engineering Notes

更新时间：**2026-05-21**。

## 难点 1：真实仓库写入

系统必须写入 Conduit clone，而不是 mock 仓库。`ConduitSandbox` 会检查 git origin 包含 `conduit-realworld-example-app`，并只允许在 sandbox 路径内读写。

## 难点 2：验证链路不伪造成功

Conduit 根仓目前没有 lint script。Verification Agent 由实现仓库 `npm run lint:sandbox` 对本次改动文件做 ESLint，并运行 Conduit `npm test`。失败进入 failed 状态；Vitest 需 `jsdom` devDependency。

## 难点 3：Skill 与主流程解耦

4 个 Skill 注册于 `registry.js`；Orchestrator 只推进阶段。第 3 模式（详情字数）与第 4 模式（Popular Tags 前 5 打标）均只新增 Skill 文件，不改 Agent/Orchestrator 主干（§2.2 #1）。

## 难点 4：演示状态可恢复

API 冷启动从 `docs/reports/runs/<run-id>` 恢复；`metadata.json` 持久化 confirm / retry / PR 元数据。缺失证据 fail-fast，不补造成功。

## 难点 5：业务上下文反哺

`historyRecall` 扫描落盘 evidence；不完整归档 → `degraded` + `skipped`。Planning Agent 将匹配写入 **`plan.history_references`**（H8–H9）。

## 难点 6：AI 双路径与可观测

rules：`rules-first-p0`，tokens=0，仅支持已注册演示模式，未知需求 fail-fast。LLM：模糊输入验收 run `run-2026-05-21T05-58-01-181Z`（非零 tokens）。clarify 阶段立即写 `ai-calls.jsonl`，恢复路径缺该文件直接失败；plan/edit/verify/pr 由确定性证据文件表达，不混入 `ai-calls.jsonl`。当前代码要求 AI call summaries 显式写入，`aiUsage` 持久化后再由读取路径校验；跨 run AI Usage 只聚合 passed run，不完整或不一致归档进入 `skipped`。

## 难点 7：PR 创建不伪造

GitHub PR 隔离在 `external/git-provider`；缺配置或 API 失败返回错误，不构造假 URL。

## 难点 8：阶段级断点重放

`deliveryPipeline` 事件溯源 + `checkpoints.json`；`POST /api/runs/:id/resume-from-stage` 从指定阶段只重放下游（H5–H7）。`retry` 创建新 run，**不能替代** resume。

## 难点 9：L2 跨栈与影响矩阵

`article-draft-indicator` 同时改 frontend + backend；`planningAgent` 输出 `impact_matrix.cross_stack`（H10–H11）。Planning 现在必须读取真实 sandbox repo path 与目标文件索引；缺 repo path、sandbox root 或目标文件时 fail-fast，不生成空 `sandbox_index`。`cross-stack-sync` 检查 `article.draft` / `draft-badge` / `DataTypes.BOOLEAN` / controller 默认字段，避免泛文本命中造成假阳性。集成测试见 `planningAgent.test.js`、`articleDraftIndicator.test.js`、`crossStackSync.test.js`。

## 难点 10：模糊 LLM 与 Skill 匹配

LLM clarify 可能产出英文 goal 导致 Skill 关键词未命中（`run-2026-05-21T05-57-39-036Z`）；registry fail-fast。当前 `findSkill()` 还会拒绝低置信度单关键词和并列候选，避免把混合需求静默路由到第一个 Skill。验收 run 仍匹配 `article-list-display-field` 并完成全链路。

## 难点 11：上游 Conduit 依赖 audit

`sandbox-repo` 有 8 项传递依赖告警；决策见 [`dependency-audit-decision.md`](./dependency-audit-decision.md)。实现仓根 `npm audit` 为 0。
