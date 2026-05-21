# Engineering Notes

## 难点 1：真实仓库写入

系统必须写入 Conduit clone，而不是 mock 仓库。`ConduitSandbox` 会检查 git origin 包含 `conduit-realworld-example-app`，并只允许在 sandbox 路径内读写。

## 难点 2：验证链路不伪造成功

Conduit 根仓目前没有 lint script。Verification Agent 不伪造 lint 成功，而是由实现仓库运行 `npm run lint:sandbox` 对本次改动文件做真实 ESLint 检查，同时运行 Conduit 真实 `npm test`。

验证失败会让 Orchestrator 进入 failed 状态并返回非零 CLI 退出码，不再继续生成 ready-for-PR 成功结果。Conduit 既有 Vitest 配置使用 jsdom 环境，因此 sandbox 根依赖显式补充 `jsdom`，让测试环境按真实配置启动，而不是改测试命令绕过。

## 难点 3：Skill 与主流程解耦

文章列表阅读量展示封装为 `article-list-display-field` Skill。Orchestrator 只负责阶段推进，不硬编码具体 PM 文案对应的文件修改。

## 难点 4：演示状态可恢复

API 重启后内存 run 会丢失，因此查询、retry 和人工确认会从 `docs/reports/runs/<run-id>` 读取归档 evidence 恢复 run。确认记录写入 `metadata.json`，让冷启动后的人工审批历史可以继续累积。恢复只使用真实已落盘证据；缺失文件会暴露为失败，而不是补造成功状态。

## 难点 5：业务上下文反哺

历史召回不新建数据库，也不让模型凭空总结历史。`historyRecall` 只扫描已经落盘的 `requirement.md` 和 `plan.md`，按当前 PM 输入召回相似 run、Skill 和目标文件，并把结果写入 `history-recall.json`。不完整历史证据会进入 `skipped`，并让整体状态标为 `degraded`，让上下文缺口可见。

## 难点 6：AI 调用可观测与双路径策略

AI 使用面板解析 `ai-calls.jsonl` 形成 `aiCalls` 与 `aiUsage` 汇总。代码级 P0 用 `rules-first-p0`（tokens=0）。课题完成须 **模糊输入** LLM 验收 run（H4）产生 §2.2 口径的非零留痕；清晰 L1 的 legacy doubao 探索 run 不计入 #6。确定性 plan / edit / verify / PR 由对应证据文件表达，不混入 `ai-calls.jsonl`。

## 难点 7：PR 创建不伪造

GitHub PR 创建被隔离到 `external/git-provider`。API 要求用户显式提交 `confirm=true`、`head` 和 `base`，并要求 GitHub token、owner 和 repo 都存在；缺配置或请求缺字段返回 400，GitHub API 拒绝或响应格式异常返回错误。只有真实 API 返回完整成功响应时才会写入 `prSubmission`，不会在本地构造伪造 PR 链接。

## 难点 8：阶段级断点重放（待 H5–H7）

当前 Orchestrator 为线性自动管道；`retry` 创建新 run（`retryOf`），**不能替代** spec 要求的 `resume-from-stage`。闭合 §2.2 #2 须事件溯源 + checkpoint，从指定阶段只重放下游并保留上游证据。

## 难点 9：L2 跨栈与 Planning 改造（待 H10–H11）

当前 Planning Agent 为 rules 硬编码模板；L2 Skill 须扩展多路径写入与影响矩阵。闭合 §2.2 #3 依赖 Planning 接收 history-recall 并输出前后端/模型/测试影响范围。
