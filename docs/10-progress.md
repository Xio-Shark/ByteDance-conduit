# 实现进度：Conduit 超级个体端到端交付系统 v1.0.0

更新时间：2026-05-22（fail-fast 复核；Web controller / RunResult 面板、API run routes、runArchive、runEvidenceGuards、deliveryPipeline 控制流与 aiCallRecords 拆分；archive dry-run 已接入；根目录 CSV 已清理；4 Skill；P1-5 豆包已决策跳过；verify **108** 项）

与根目录 [`当前进度汇报.md`](../当前进度汇报.md) 同步；**执行清单**以 [`06-plan.md#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot) 为准；运行证据以实现仓 `bytedance-implementation/docs/reports/**` 为准。PDF 缺口分层（P0/P1/P2）详见 [`当前进度汇报.md`](../当前进度汇报.md#距离比赛目标仍缺什么按优先级)。

## 结论

当前处于 **「§2.1 MVP 与 §2.2 六项代码/run 证据已齐；§8.2 对外交付与答辩录屏仍待人工」**。核心任务已从「开发功能」转向 **S7 录屏 + S6/S8 对外链接闭合**。

- 已完成 **代码级 §2.1** 闭环（`AI_MODE=rules`）。
- **§2.2**：#1/#2/#3/#5 rules 验收 run 已有；**#4/#6** 验收 run `run-2026-05-21T05-58-01-181Z`（模糊输入 + `clarifications[]` + 非零 tokens）。
- **`resume-from-stage`**、`checkpoints.json`、**4 个 Skill**、`plan.history_references`、L2 跨栈 run（`run-2026-05-21T05-52-12-490Z`）已落地。
- 本次复核：`npm run verify` 通过（**108** 项 Node/API/Web/scripts 测试；107 pass / 1 skip 集成、sandbox lint、Conduit Vitest、Web 生产构建）。
- **候选发布包**：`npm run archive:dry-run` 通过（347 files，7 条关键 run；`manifestHash=db973390d2344d49809a9b24d28a2437d9cf37341a6b28340d70e184b7b82751`，`contentHash=11a9f990204efe981035a12890232ca12045aaf9c32f82a0c672280525dff1e1`），可证明本地候选包包含关键源码、submission、`sandbox-repo/`、脚本测试与 §2.2 run 证据，并排除 `.env`、`node_modules`、Web build 产物和测试结果目录；它不替代公开仓 URL、Demo URL、视频 URL、团队信息或最终提交。
- **新增收紧**：运行路径必须显式提供 `AI_MODE`；Planning Agent 缺真实 sandbox repo path / 目标文件时 fail-fast；Skill Registry 低置信度或并列匹配 fail-fast；LLM response 必须显式返回 usage token 计数；API 不再用请求输入补齐缺失的 `requirementCard.source_input`；AI 调用证据必须显式写入 `prompt_version`/`input_summary`/`output_summary`，且 token / latency / cost 必须是 JSON number；submission API 与 `pre-submission-check.sh` 不再把含占位外链、待填团队信息或未勾选最终提交项的材料展示成 ready。
- **执行清单**：根目录不保留 CSV；以 [`06-plan.md#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot) 与本文件为准。
- **新增**：`popular-tags-top-five` Skill（`run-2026-05-21T06-21-56-710Z`）、`GET /api/ai-usage/summary`、Web 澄清多轮与跨 run AI Usage 面板（仅聚合 passed run；缺失或不匹配 `run-summary.json.aiUsage` 的归档进入 `skipped`）。
- **H15/H16**：`11-acceptance.yaml` 当前 24/28 AC verified；AC-F006-02 与 AC-F011-01 为 partial，AC-F011-02/03 为 manual_pending；`12-traceability.yaml` F-001/F-008/F-009/F-012 已同步 evidence。

## 仓库边界

| 仓库 | 当前职责 | 状态 |
|------|----------|------|
| `/Users/xioshark/Desktop/bytedance` | `v1.0.0` 设计基线和本进度文档 | 仅维护文档 |
| `/Users/xioshark/Desktop/bytedance/bytedance-implementation` | 前端、后端、编排、sandbox、证据和提交材料 | P0 + §2.2 代码已落地；`npm run verify` 通过 |
| `…/bytedance-implementation/sandbox-repo` | Conduit 真实代码改动目标 | 多 Skill 改动 + `jsdom` 测试依赖 |

## 里程碑进度（对照 [`06-plan.md`](./06-plan.md)）

| 里程碑 | 计划目标 | 当前状态 | 证据 |
|--------|----------|----------|------|
| M1 | 课题理解与范围冻结 | ✅ 已完成 | `docs/01`–`12` |
| M2 | 工程骨架与 Conduit 接入 | ✅ 已完成 | `apps/web`、`apps/api`、`services/orchestrator`、`services/sandbox`、`.env.example` |
| M3 | P0 L1 链路跑通 | ✅ 已完成 | `run-2026-05-21T02-16-15-215Z` 等；`diff.patch` 含 Conduit 真实路径 |
| M4 | 验证与 PR 草稿闭环 | ✅ 已完成 | `verification.json` 通过；`pr-draft.md` 已生成；GitHub draft PR provider 已实现（无远端 token 时仅契约测试） |
| M5 | §2.2 编排与体验 | 🟡 代码已闭合 | resume-from-stage、ClarificationsPanel、Cross-run AI Usage；常规模式自动跑通，`BLOCK_ON_CONFIRM=1` 可演示真阻塞 confirm；**待 S7 录屏演示** |
| M6 | §2.2 能力与 Skill 扩展 | ✅ 已完成 | **4 Skill**；L2 `05-52-12`；第 3 `05-52-18`；第 4 `06-24-47`（Popular Tags） |
| M7 | 提交与答辩 | 🟡 草稿已生成 | `docs/reports/submission/*` 非空；人工链接、视频、公开 AI 主仓待补；真实 draft PR 为 H17 可选项 |

**官方时间节点**：实战期 2026-05-20 至 2026-06-10；成果提交截止 2026-06-10；答辩 2026-06-11 至 2026-06-19。距提交截止约 **20 天**。

## §2.2 评判亮点六项

| # | 亮点 | 代码 / run 证据 | S7 视频 | 说明 |
|---|------|----------------|---------|------|
| 1 | 抽象到位 | ✅ | 🟡 待录屏 | **4 Skill**；第 3/4 个仅新增 Skill 文件 |
| 2 | 断点重放 | ✅ | 🟡 待录屏 | `POST .../resume-from-stage` + Web resume from edit |
| 3 | 跨栈一致性 | ✅ | 🟡 待录屏 | L2 `run-2026-05-21T05-52-12-490Z`；固定 exemplar + checker，非通用自动同步 |
| 4 | 可观测性 | ✅ | 🟡 待录屏 | `run-2026-05-21T05-58-01-181Z` 非零 metrics；面板 non-zero badge 已就绪 |
| 5 | 业务上下文反哺 | ✅ | 🟡 待录屏 | `history_references` 写入 plan；`run-2026-05-21T05-51-56-519Z` |
| 6 | 澄清深度 | ✅ | 🟡 待录屏 | 模糊输入 `05-58-01` 含 `clarifications[]`；`mimo-v2.5` 非零 tokens |

依赖链与推进顺序见 [`06-plan.md#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot)。

## 最新 Run

### 代码级 P0（rules）

| 项 | 内容 |
|----|------|
| Run ID | `run-2026-05-21T02-16-15-215Z` |
| 状态 / 阶段 | `passed` / `ready_for_pr` |
| AI 模式 | `rules` |
| Skill | `article-list-display-field` |
| 证据目录 | `bytedance-implementation/docs/reports/runs/run-2026-05-21T02-16-15-215Z` |

公开 L1 需求：「给文章列表加阅读量展示，前端假数据即可，不改后端。」

### §2.2 验收口径 LLM

| 项 | 内容 |
|----|------|
| Run ID | `run-2026-05-21T05-58-01-181Z` |
| 状态 / 阶段 | `passed` / `ready_for_pr` |
| AI 模式 | `llm`（`mimo-v2.5`） |
| 模糊输入 | 「文章列表想好看一点，加点数据，别动太多代码。」 |
| 追问 | `requirement.md` 含 `clarifications[]` |
| 可观测 | tokens_in 248 / tokens_out 1818 / latency 21854ms |

### 其它 §2.2 关键 run

| Run ID | 用途 |
|--------|------|
| `run-2026-05-21T05-51-56-519Z` | 第二条相似需求；召回入 plan |
| `run-2026-05-21T05-52-12-490Z` | L2 跨栈 |
| `run-2026-05-21T05-52-18-277Z` | 第 3 Skill |
| `run-2026-05-21T06-24-47-248Z` | 第 4 Skill（Popular Tags 前 5） |

**累计 run 归档**：`docs/reports/runs/` 下已超过 **90** 个 run 目录（含成功、失败与本轮验证 run；具体数量会随验证 run 增长）。

PR 提交：`POST /api/runs/:id/pr` 已接入 GitHub 适配器，须 `confirm=true`、`head`、`base` 及 `GITHUB_TOKEN` / `GITHUB_OWNER` / `GITHUB_REPO`。当前仅要求本地 `pr-draft.md` 作为 P0 证据；真实 draft PR / 上游 Conduit PR 是 H17 可选项，需另行配置 fork/分支权限。

## 真实代码改动（sandbox-repo）

| 范围 | 说明 |
|------|------|
| L1 阅读量 | `ArticlesPreview.jsx`、`styles.css` |
| L2 草稿 | `Article.js`、`articles.js`、列表卡片 |
| 详情字数 | `Article.jsx` |
| Popular Tags | `ArticlesPreview.jsx` 等 |
| 测试 | `jsdom` devDependency |

具体 diff 以各 run 的 `diff.patch` 为准。

## 验证结果

### 实现仓库完整验证（本次复核 `npm run verify`）

| 环节 | 结果 |
|------|------|
| `archive:dry-run` | 通过（347 files；7 key runs；`manifestHash=db973390d2344d49809a9b24d28a2437d9cf37341a6b28340d70e184b7b82751`；`contentHash=11a9f990204efe981035a12890232ca12045aaf9c32f82a0c672280525dff1e1`；排除 `.env` / `node_modules` / `apps/web/dist` / `test-results`） |
| Node/API/Web/scripts 测试 | 通过（**108** 项；107 pass / 1 skip 集成） |
| `lint:sandbox` | 通过 |
| Conduit Vitest | 通过（3 文件 / 12 测试） |
| `apps/web` 生产构建 | 通过 |

测试覆盖要点（以 `npm run verify` 为准）：

- 模型输出缺少 `requirement_card.id` 时失败，不用默认 ID 补齐。
- LLM 响应缺 `usage`、token 计数非正数或 AI usage / ai-call 数值为字符串时失败，不补 0；返回 run 时缺 `requirementCard.source_input` 也失败，不用请求输入回填。
- Skill 缺 JSX 或 CSS 锚点时失败，不生成半成功 patch。
- resume-from-stage、checkpoints、**4 Skill**、L2 跨栈、history_references、LLM clarify、L2 planning 集成测试等有单测覆盖。
- 损坏历史归档会标 `degraded` / `skipped`，不伪装成全量 ready。
- 跨 run AI Usage 只统计 passed run，且要求 `run-summary.json.aiUsage` 与 `ai-calls.jsonl` 汇总一致；失败/不完整归档列入 `skipped`，不污染 tokens/latency totals。
- Planning 不再生成空 `sandbox_index`；Skill Registry 不再对低置信度或并列候选静默选第一个。

**安全**：实现仓根目录 `npm audit --audit-level=high` 为 **0** 漏洞；`sandbox-repo` 仍有 **8** 项（5 high、3 moderate），未执行 `npm audit fix`。

## AI 使用留痕

**模型共识**：不强制豆包；P1-5 已决策跳过。§2.2 #6 验收 run 为 `run-2026-05-21T05-58-01-181Z`（`mimo-v2.5`）。早期 doubao 清晰 L1 run 不计入 #6。

| 阶段 | 模型 | 状态 | 说明 |
|------|------|------|------|
| clarify（P0 rules） | `rules-first-p0` | reviewed | tokens / 延迟 / 成本为 0 |
| clarify（§2.2 验收） | `mimo-v2.5` | reviewed | `run-2026-05-21T05-58-01-181Z`；模糊输入 + `clarifications[]` |
| clarify（早期探索） | `run-2026-05-20T17-37-55-856Z` 等 | 非 §2.2 验收 | `aiMode: doubao`，清晰 L1 输入，**不计入 #6** |
| 确定性交付 | `plan.md` / `diff.patch` 等 | ✅ | 不写入 `ai-calls.jsonl` |

`aiUsage` 由生产路径持久化并与 `ai-calls.jsonl` 校验一致，用于 API、归档恢复和 Web AI Usage 面板；读取路径不现场补造展示值。

真实 API key、EP 和 Bearer token 未写入源码、运行报告或提交材料。

## 提交材料状态（§8.2）

与 [`checklist.md`](../bytedance-implementation/docs/reports/submission/checklist.md) 及 [`06-plan` S1–S10](./06-plan.md#冲刺关键路径进度-ssot) 对齐。

| 材料 | 路径 | 状态 |
|------|------|------|
| 提交清单 | `docs/reports/submission/checklist.md` | ✅ |
| 团队 / 答辩 | `team-info.md`、`defense-prep.md` | 草稿存在；姓名与 URL `pending_human` |
| 视频脚本 | `video-recording-guide.md` | 草稿存在；视频 `pending_human` |
| 公开仓指南 | `public-repo-guide.md` | 草稿存在；远端公开仓 `pending_human` |
| 安全检查 | `security-check-report.md` | 🟡 S9 部分完成；本地扫描与 archive dry-run 已通过，发布当天重跑脚本、Git 历史检查与远端 secret scanning 未闭合 |
| Audit 决策 | `dependency-audit-decision.md` | ✅ X1 |
| 演示脚本 | `demo-script.md` | ✅ 已生成 |
| 架构说明 | `architecture.md` | ✅ 已生成 |
| AI 使用说明 | `ai-usage.md` | ✅ 已生成；模型清单表 / 合规段已填 |
| 工程难点 | `engineering-notes.md` | ✅ 已生成 |

API submission 状态已按内容识别：Demo / 视频 / 公开仓链接有真实 URL 时仅返回 `provided_unverified`；团队信息和提交清单仍含 `_（待填）_`、`待部署`、`待录制`、`待发布` 或未勾选最终提交项时返回 `pending_human`。当前 `pre-submission-check.sh` 会先运行 `npm run archive:dry-run`，再聚合报告 4 类外部门禁阻塞：§8.2 人工项未闭合、发布清单路径未全部进入 Git 跟踪、关键源码 / run / submission / sandbox 发布路径仍未准备成 tracked public repository、最终外部提交未完成；readiness 失败后不会继续跑 `npm run verify`。不能把本地 `verify` 或 archive dry-run 通过误读成最终可提交。

## 完成判定（对照 [`README.md`](../README.md)）

### 代码级 P0

| 检查项 | 状态 |
|--------|------|
| 三端可启动 | ✅ |
| sandbox 基于 Conduit 真实路径 | ✅ |
| 至少一条 L1 需求 → PR 草稿 | ✅（规则模式） |
| `diff.patch` / `verification.json` / `pr-draft.md` / `ai-calls.jsonl` | ✅ |
| 无真实 API key 泄露 | ✅ |

### 课题完成（§2.1 + §2.2 + §8.2）

| 检查项 | 状态 |
|--------|------|
| §2.2 六项答辩级演示全部闭合 | ❌ |
| §2.2 验收口径 LLM clarify | ✅ run `05-58-01` 已归档；ai-usage 已同步 |
| H15/H16 验收追踪 | ✅ 24/28 AC verified；AC-F006-02、AC-F011-01 partial；AC-F011-02/03 manual_pending；traceability 已更新 |
| 公开 AI 系统主仓（内含 `sandbox-repo/`） | ❌ |
| 在线 Demo / 演示视频 / 团队信息 | ❌ |
| 真实 draft PR URL（H17，可选） | ❌ |

不能声称「课题完成」或「最终提交已完成」，直到 §2.2 六项答辩演示、Demo、视频、公开 AI 主仓与团队信息补齐。

## 当前缺口与建议下一步

**P0（§8.2 / F-011）**：演示视频（S7）、公开 AI 系统主仓且内含 `sandbox-repo/`（S8）、`team-info.md` 姓名与 URL（S6）、§2.2 六项统一录屏。

**P1（加分/叙事）**：跨栈非 PDF 理想态全自动；Plan/Coding 以确定性模板和 Skill 驱动为主；defense-prep 与视频对齐。

**P2（可选）**：H17 draft PR 暂缓；P1-5 豆包跳过；sandbox audit waiver。

最小闭合路径（约 1–2 天人工）见 [`当前进度汇报.md`](../当前进度汇报.md#建议下一步最小闭合路径约-12-天人工) 与 [`06-plan.md#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot)。
