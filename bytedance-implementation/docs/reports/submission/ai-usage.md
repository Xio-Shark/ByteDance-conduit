# AI Usage

## 模型策略

对齐文档仓 [`docs/01-understanding.md`](../../../../docs/01-understanding.md)（本地 monorepo；公开 AI 主仓提交时可在 README 附设计基线链接）。

| 层级 | 状态 | 说明 |
|------|------|------|
| **代码级 P0** | 已实现 | `AI_MODE=rules`（`rules-first-p0`）跑通澄清 → Conduit 写入 → lint/单测 → PR 草稿 |
| **课题完成** | **部分完成** | §2.2 代码与验收 run 已闭合；§8.2 视频/公开 AI 系统主仓（内含 `sandbox-repo/`）/团队信息待人工提交 |

实现仓支持显式 `AI_MODE=rules` 与 `AI_MODE=llm`（`clarifyWithLlm` + `LLM_*` 环境变量）；缺 `AI_MODE` 直接失败。**§2.2 #4/#6 不可降级**；答辩前须归档符合验收口径的 LLM run（见文档仓 [`06-plan` H3–H4](../../../../docs/06-plan.md#冲刺关键路径进度-ssot)）。

| 模式 | 标识 | 用途 | 状态 |
|------|------|------|------|
| 规则澄清 | `rules-first-p0` | Requirement / clarify：结构化需求卡片；tokens/延迟/成本为 0 | ✅ 已验收（最新 P0 run） |
| 真实 LLM 澄清 | `AI_MODE=llm` + `.env` 中 `LLM_MODEL` 等 | clarify 阶段调用远端模型；须非零 tokens 留痕 | ✅ 已验收（`run-2026-05-21T05-58-01-181Z`） |
| 早期探索（legacy） | `run-2026-05-20T17-37-55-856Z` 等 `aiMode: doubao` | 清晰 L1 输入 + 非零 tokens | ⚠️ **不计入 §2.2 #6** |
| 确定性交付 | `plan.md` / `diff.patch` / `verification.json` / `pr-draft.md` | Planning / Coding / Verification / PR 事实源 | ✅ 不写入 `ai-calls.jsonl` |

源题 PDF §7.1（示例 EP/API key）整节忽略；凭据只通过本地环境变量配置，不写入仓库。

## 模型清单（§7.2-5，答辩前必填）

| 模型名称 | 用途 | 费用承担 | 是否豆包 | 状态 |
|----------|------|----------|----------|------|
| `mimo-v2.5` | clarify 模糊需求追问（§2.2 #6 / #4） | 个人 API 账户 | 否 | 已用（`run-2026-05-21T05-58-01-181Z`） |
| `rules-first-p0` | 代码级 P0 胶水链路 | 无 API 费用 | 否 | 已用 |

## 豆包决策（团队共识，2026-05-21）

| 项 | 结论 |
|----|------|
| 是否必须豆包 | **否**（[`docs/01-understanding.md`](../../../../docs/01-understanding.md)：§7.2 允许多模型，须在本文声明） |
| §2.2 #6 验收证据 | `run-2026-05-21T05-58-01-181Z`（`mimo-v2.5`，模糊输入 + `clarifications[]`） |
| P1-5「补豆包 clarify」 | **已决策跳过**；不另跑豆包 run |
| 早期 doubao 探索 run | legacy；清晰 L1 输入，**不计入 #6**（见 `prompt-changelog.md`） |
| 答辩口径 | PDF §2.1 豆包为参考表述；以 §7.2 多模型声明 + 上述验收 run 举证 |

## 合规（§7.2-4，答辩前必填）

- **脱敏**：运行报告、提交材料、PR 描述不含真实 API key、EP、Bearer token 或内部业务数据。
- **数据边界**：LLM 请求仅包含课题演示所需的需求文本与 Conduit 公开结构摘要；不上传公司内部文档或客户数据。
- **公司 AI 规范**：课题演示使用个人配置的 OpenAI 兼容网关；未上传公司内部文档或客户数据；答辩前由团队确认是否符合所在组织 AI 使用政策。

## 留痕要求

每个成功 run 必须生成：

- `ai-calls.jsonl`（clarify 调用；rules 或 LLM）
- `requirement.md`
- `history-recall.json`
- `plan.md`
- `diff.patch`
- `verification.json`
- `pr-draft.md`

`history-recall.json` 来自本地归档 evidence 检索，不调用远端模型。

## 观测展示

Web 控制台的 AI Usage 面板解析 `ai-calls.jsonl`。规则模式下 tokens / 延迟 / 成本为 0 是预期行为；**课题完成** 须有一条 **§2.2 验收口径** 的 LLM 记录（模糊输入 + 非零 tokens，见 H4/H13）。跨 run 汇总只聚合 `run-summary.json` 标记为 `passed` 且 `ai-calls.jsonl` 非空的归档；失败、暂停、legacy 或不完整归档进入 `skipped`，不计入 tokens / latency totals。

当前代码路径要求 `ai-calls.jsonl` 显式写入 `prompt_version`、`input_summary`、`output_summary` 与 tokens/latency/cost；`run-summary.json.aiUsage` / `failure.json.aiUsage` 由生产路径持久化，读取和跨 run 汇总只校验一致性，不现场补造展示值。早期 legacy run 保持原始归档，不回写改造。

## 人工审阅

- 需求卡片、方案与 PR 草稿可在控制台查看；常规模式下 Web「Record review」按钮与 `POST /api/runs/:id/confirm` 记录 `approved` / `rejected` 作为事后留痕，编排自动跑通全链路。演示真阻塞人工确认时启用 `BLOCK_ON_CONFIRM=1`，系统会进入 `waiting_requirement_confirm` / `waiting_plan_confirm`，再通过 continue API 继续下游阶段。
- `retry` 基于修订输入 **创建新 run**（`retryOf`），不是中间阶段断点重放；断点重放见 `POST /api/runs/:id/resume-from-stage`（H5–H7 已验收）。
- 核心链路（Conduit 写入、lint / 单测、PR 草稿）不得用 mock 仓库或伪验证替代。

## 安全边界

真实 API key、EP 和 Bearer token 只能存在于本地环境变量或部署密钥（如 GitHub PR、LLM API），不进入 README、源码、测试快照、运行报告或 PR 描述。
