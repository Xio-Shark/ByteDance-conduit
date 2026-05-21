# 交付计划：Conduit 超级个体端到端交付系统 v1.0.0

## 目标

在 3 周挑战周期内交付：**§2.1 MVP** + **§2.2 评判亮点六项全部达到** + §8.2 提交材料。

## 官方时间节点

| 节点 | 日期 | 产出 |
|------|------|------|
| 挑战正式启动 | 2026-05-20 | 明确课题要求、范围和导师沟通方式 |
| 项目实战期 | 2026-05-20 至 2026-06-10 | 完成系统开发、验证、演示材料 |
| 项目成果提交 | 2026-06-10 截止 | 提交 Demo、视频、公开仓库、README、架构图、AI 使用说明 |
| 答辩与评审 | 2026-06-11 至 2026-06-19 | 现场答辩、横向排序、评选结果 |

## 里程碑

| 里程碑 | 时间 | 目标 | 完成标准 |
|--------|------|------|----------|
| M1 | 第 1-2 天 | 课题理解与范围冻结 | Understanding / PRD / Spec / Design / Dev / Plan 对齐源题 |
| M2 | 第 3-5 天 | 工程骨架与 Conduit 接入 | 前端、后端、编排服务可启动；sandbox-repo 可读写 |
| M3 | 第 6-9 天 | P0 L1 链路跑通 | 需求输入到代码 diff 可完成 |
| M4 | 第 10-13 天 | 验证与 PR 草稿闭环 | lint / 单测结果和 PR 描述可生成 |
| M5 | 第 14-17 天 | §2.2 体验与编排 | 断点重放、监控面板、LLM 澄清、历史召回入 plan |
| M6 | 第 18-21 天 | §2.2 能力闭合 | 第 2/3 Skill、L2 跨栈 run、Skill 扩展演示 |
| M7 | 第 18-21 天 | 提交与答辩 | §8.2 材料、视频覆盖六项亮点 |

## 任务拆解

### M1：文档与范围

- [x] 阅读课题原文，提取 P0 / P1 / P2。
- [x] 沉淀题目理解，明确“超级个体”是 PM 到 PR 的交付单元。
- [x] 重构 PRD、设计、技术方案和计划。
- [x] 补齐系统 Spec，明确状态机、Agent、Skill、API、证据和验收门槛。
- [x] 补齐评分权重、AI 使用留痕、提交材料和公开题型边界。
- [x] 选定 P0 演示题：文章列表加阅读量字段。

### M2：工程骨架

- [x] 创建 `apps/web` 对话与流程控制台。
- [x] 创建 `apps/api` Node API。
- [x] 创建 `services/orchestrator` 状态机。
- [x] 创建 `services/sandbox` Conduit 适配器。
- [x] 配置 `.env.example`，不提交真实密钥。

### M3：P0 需求链路

- [x] 实现需求输入与澄清 Agent。
- [x] 实现历史需求召回和目标文件定位。
- [x] 实现首个 Skill：文章列表展示字段类需求。
- [x] 实现代码写入与 git diff 展示。
- [x] 严格化模型输出和 Skill 锚点校验，缺少必填字段或目标锚点时直接失败。

### M4：验证与 PR

- [x] 执行 Conduit 仓库真实单测。
- [x] 执行针对本次 Conduit 改动的 `npm run lint:sandbox`，并在验证结果中标记来源为实现仓库 lint adapter。
- [x] 生成验证报告。
- [x] 生成 PR 标题和描述。
- [x] 实现 GitHub draft PR provider；真实远端 PR 仍依赖人工提供 GitHub 配置和显式确认。

### M5：§2.2 编排与体验

- [x] 补齐阶段进度、事件日志和失败展示。
- [x] 支持人工确认留痕、`retry` 新 run、归档恢复。
- [x] AI Usage 面板（基础）。
- [x] 历史召回 `history-recall.json`（基础）。
- [x] **`resume-from-stage`**：阶段级断点重放（§2.2 #2）；`deliveryPipeline` + API + Web（H5–H7）。
- [x] **真实 LLM** clarify + **模糊输入**追问（§2.2 #6）；H3/H4 已验收（`run-2026-05-21T05-58-01-181Z`）。
- [ ] 监控面板汇总 tokens/延迟/成本（§2.2 #4，H4 验收 run 已归档；H13 面板已就绪，待 S7 视频演示）。
- [x] plan 阶段引用 history-recall（§2.2 #5）；H8–H9 已验收。

### M6：§2.2 能力与第二 Skill

- [x] 实现 **第 2 个 Skill**（L2：`article-draft-indicator`）。
- [x] 完成 **至少 1 条 L2 跨栈 run**（`run-2026-05-21T05-52-12-490Z`）。
- [x] 演示 **第 3 模式只加 1 个 Skill 文件**（`article-detail-word-count.js`）。

### M7：提交材料与答辩

- [x] README 写清项目简介、依赖环境、启动步骤、目录结构、配置说明和 API key 配置位置。
- [x] 准备架构说明、AI 使用说明、工程难点说明和提交清单草稿。
- [ ] 录制 3-8 分钟演示视频（**逐项展示 §2.2 六项**）。
- [ ] 公开 AI 主仓 + `sandbox-repo/` 子仓；团队信息、分工、亮点（映射 §2.2）。

## §2.2 六项追踪

| # | 亮点 | 状态 | 计划证据 | 闭合阻塞项 | 降级路径 |
|---|------|------|----------|-----------|---------|
| 1 | 抽象到位 | 部分 | 3 Skill；第 3 个仅新增 1 文件 | H12 已验收；待 S7 视频演示 | 3 Skill 全 L1，仍演示只加文件不改主干 |
| 2 | 断点重放 | 部分 | `resume-from-stage` 演示 | H5–H7 已验收；待 S7 视频演示 | API 端保留上游证据；前端展示已归档事件 |
| 3 | 跨栈一致性 | 部分 | L2 run + 影响矩阵 | H11 `run-2026-05-21T05-52-12-490Z` | plan.md 手动标注影响 + Skill 跨栈路径 |
| 4 | 可观测性 | 部分 | LLM ai-calls + 面板汇总 | H4 run 已归档；H13 面板待 S7 演示 | **不可降级**——无 LLM 则无非零 metrics |
| 5 | 业务上下文反哺 | 部分 | 相似 run plan 引用召回 | H8–H9 已验收 | UI 展示召回 + plan `history_references` |
| 6 | 澄清深度 | 部分 | 模糊输入 LLM 追问 run | H4 `run-2026-05-21T05-58-01-181Z` | **不可降级**——无 LLM 则无法追问 |

### §2.2 闭合依赖链

```text
AI_MODE=llm 稳定 ─┬─→ #6 澄清深度
                   ├─→ #4 可观测性
                   └─→ #5 plan 引用召回 ─→ #3 跨栈一致性 ─→ #1 L2 Skill

Orchestrator 事件溯源 ─→ #2 断点重放（独立路径，可并行）
```

**串行瓶颈**：#3 → #1 是串行依赖（L2 Skill 需跨栈能力先就绪）。#4/#6 不可降级，是硬性前提。#2 可独立并行推进。

### 推进顺序建议

1. **Day 1-3**：稳定 `AI_MODE=llm`（#4/#6 前提）；同时启动 Orchestrator 事件溯源重构（#2 独立路径）
2. **Day 4-6**：闭合 #4 可观测性 + #6 澄清深度（LLM 非零 run）；改 planningAgent 入 historyRecall（#5）
3. **Day 7-9**：闭合 #5 业务上下文反哺；Planning Agent 支持 L2 影响矩阵（#3 前置）
4. **Day 10-13**：闭合 #3 跨栈一致性（L2 run + 影响矩阵）；新增 L2 Skill（#1 前置）
5. **Day 14-16**：闭合 #1 抽象到位（第 3 Skill + 不改主干演示）；闭合 #2 断点重放
6. **Day 17-20**：M7 提交材料 + 视频 + 答辩准备

如果 Day 6 时 #3/#1 进度落后，启动降级路径：#1 降为 3 L1 Skill，#3 降为手动标注影响矩阵 + 简易跨栈 diff。

## 冲刺关键路径（进度 SSOT）

**唯一执行清单**：本表 + [`10-progress.md`](./10-progress.md)（事实快照）。根目录不保留临时 CSV；[`当前进度汇报.md`](../当前进度汇报.md) 仅为可读摘要，变更须先写本表与 `10-progress`。

**口径**：代码级 P0 ≠ 课题完成。早期 `aiMode: doubao` 探索 run（如 `run-2026-05-20T17-37-55-856Z`）有非零 tokens，但输入为清晰 L1 原句，**不计入 §2.2 #6**；课题完成须 **模糊输入 + LLM 主动追问** 的验收 run。

| id | 优先级 | 任务 | 状态 | 依赖 | 目标窗口 | 映射 |
|----|--------|------|------|------|----------|------|
| H1 | **P0** | 修复缺 `requirement.md` 的 3 条坏归档 | **已完成** | — | Day 1 | 删除 3 条仅 `failure.json` 孤儿归档 |
| H2 | **P0** | 对齐 `history-recall` 状态命名（`invalid_history` vs `degraded`） | **已完成** | H1 | Day 1 | `skipped` + `degraded`；[`03-spec`](./03-spec.md) 已同步 |
| H3 | **P0** | 验收 `AI_MODE=llm` 端到端（`clarifyWithLlm` + `LLM_*`） | **已完成** | — | Day 1–2 | `run-2026-05-21T05-58-01-181Z`（`mimo-v2.5`） |
| H4 | **P0** | **模糊需求** run：LLM 主动追问 → `requirement.md` 含 `clarifications[]` | **已完成** | H3 | Day 2 | 同上；模糊输入 + 3 条 `clarifications[]` + 非零 tokens |
| H5 | **P0** | Orchestrator 事件溯源 + checkpoint（`resume-from-stage` 前置） | **已完成** | — | Day 1–3 | `deliveryPipeline.js` + `checkpoints.json` |
| H6 | **P0** | 实现 `POST /api/runs/:id/resume-from-stage` | **已完成** | H5 | Day 3–5 | `apps/api/src/resumeWorkflow.js` |
| H7 | **P0** | Web 控制台 `resume-from-stage` 入口 + 演示 plan 后只重跑 edit→verify→pr | **已完成** | H6 | Day 5–6 | Web「Resume from edit (plan kept)」 |
| H8 | **P0** | plan 阶段引用 `history-recall` 条目写入 `plan.md` | **已完成** | H1,H2 | Day 4–6 | `plan.history_references` |
| H9 | **P0** | 第二条相似需求 run，验证召回进入 plan | **已完成** | H8 | Day 6–7 | `run-2026-05-21T05-51-56-519Z` |
| H10 | **P0** | 实现第 2 个 Skill（L2：封面图或草稿） | **已完成** | H8 | Day 7–10 | `article-draft-indicator` |
| H11 | **P0** | L2 跨栈 run：影响矩阵 + 跨栈 `diff.patch` | **已完成** | H10 | Day 10–12 | `run-2026-05-21T05-52-12-490Z` |
| H12 | **P0** | 新增第 3 个 Skill 文件（不改 Orchestrator/Agent 主干）并跑通 | **已完成** | H11 | Day 12–14 | `article-detail-word-count`；`run-2026-05-21T05-52-18-277Z` |
| H13 | **P0** | Web 监控面板汇总 **非零** LLM metrics | **已完成** | H4 | Day 2–4 | 面板 non-zero badge + run-2026-05-21T05-58-01-181Z |
| H14 | **P0** | §2.2 新能力落地后 `npm run verify` 全绿 | **已完成** | H4–H12 | 持续 | 48 项测试 + sandbox vitest + web build |
| H15 | **P0** | 对照 [`11-acceptance.yaml`](./11-acceptance.yaml) 逐项勾选 | **已完成** | H14 | Day 15–17 | 27/30 AC verified；F-011/S7/S8 人工待闭合 |
| H16 | **P0** | 对照 [`12-traceability.yaml`](./12-traceability.yaml) 更新追踪 | **已完成** | H15 | Day 15–17 | F-001/F-008/F-009/F-012 已同步 evidence |
| H17 | **P0** | 配置 GitHub 凭据并创建真实 draft PR（归档 URL） | **暂缓** | — | Day 14–16 | 用户暂缓；本地 pr-draft 即可 |
| S1 | 提交 | 补 `prompt-changelog.md`（Prompt/Skill 版本与变更意图） | **已完成** | H4 | 提交前 | §7.2-1 |
| S2 | 提交 | README + `ai-usage.md` 模型清单表（名称/用途/费用/是否豆包） | **已完成** | H4 | 提交前 | §7.2-5 |
| S3 | 提交 | `ai-usage.md` 合规段（脱敏/无内部数据/公司 AI 规范） | **已完成** | S2 | 提交前 | §7.2-4；F-012 |
| S4 | 提交 | `tools-manifest.md` 记录开发期 Agent/IDE 与配置版本 | **已完成** | — | 提交前 | §7.2-6；建议项 |
| S5 | 提交 | 导出关键对话材料（PM↔系统多轮澄清 run 证据） | **已完成** | H4 | 提交前 | §7.2-1；`clarify-conversation-export.md` |
| S6 | 提交 | 人工填写 submission：团队/分工/Demo/视频/仓库链接 | 待办 | H12,H15 | Day 17–19 | `checklist.md` |
| S7 | 提交 | 录制 3–8 分钟演示视频（覆盖 §2.2 六项 + §7.2 留痕） | 待办 | H9,H7,H11,H12,H4 | Day 18–20 | §8.2 |
| S8 | 提交 | 公开 AI 主仓且含 `sandbox-repo/` Conduit 子仓 | 待办 | H14 | Day 17–20 | §8.2 |
| S9 | 提交 | 提交前最终安全检查：无真实 API key/EP 入库 | 待办 | S8 | 6.10 前 | 基线已过；提交前再检 |
| S10 | 提交 | 6.10 前提交 §8.2 材料并准备答辩 | 待办 | S6–S9 | **2026-06-10** | 课题完成判定 |
| X1 | 风险 | `sandbox-repo` 依赖 audit 决策（fix 与否）并全量 verify | 待办 | — | 提交前 | 8 项上游漏洞 |

**并行两线（Day 1 起）**：线 A = H1→H4→H13（LLM + 模糊澄清 + 可观测）；线 B = H5→H7（断点重放）。线 A 闭合后再推进 H8→H12（召回入 plan → L2 → 第三 Skill）。

## P0 演示题

对齐源题 §9.1 L1；主线须遵守题型边界，**不得擅自扩 scope**。

| 题目 | 定位 | 边界 / 原因 |
|------|------|-------------|
| **文章列表加阅读量字段** | **P0 主线** | §9.1：**前端假数据即可，不改后端**；单模块、低风险 |
| Popular Tags 前 5 个打标 | 备选 | 纯前端 |
| 文章详情页字数统计 | 备选 | 纯前端，基于 `Article.body` 计算 |

## L2 / L3 必达演示题（§2.2）

| 等级 | 题型 | 计划位置 |
|------|------|----------|
| L2 | 文章封面图、文章草稿 | **必择 1 题**完成跨栈 run |
| L3 | 模糊需求澄清 | **必做**澄清深度演示输入 |

## 风险与处理

| 风险 | 影响 | 处理 |
|------|------|------|
| Conduit 原仓 lint 脚本缺失 | P0 lint 口径含混 | 使用实现仓库 `lint:sandbox` 适配本次 Conduit 改动，并在 `verification.json` 标记来源 |
| 模型输出不稳定 | 演示失败 | 严格校验模型需求卡片，缺必填字段直接失败；规则模式只用于本地胶水验证 |
| §2.2 六项未齐 | 无法声称课题完成 | M5–M7 按 [03-spec §2.2](./03-spec.md#22-评判亮点规格) 逐项闭合 |
| API key 或网络问题 | 模型调用失败 | README 说明配置；演示前完成环境检查 |
| PR 权限不足 | 无法真实创建 PR | 生成 PR 草稿；真实 PR 可选 |

## Done When

**代码级 P0（已完成项）：**

- [x] 系统三层真实可运行。
- [x] 至少一条 L1 需求可在 `AI_MODE=rules` 下端到端演示（前端假数据阅读量，不改后端）。
- [x] 代码写入真实 Conduit sandbox。
- [x] lint / 单测结果可见。
- [x] PR 草稿包含完整变更与验证说明。
- [x] `ai-usage.md` 说明 rules/LLM 边界与人工审阅机制。

**课题完成（§2.1 + §2.2 + §8.2，全部待闭合）：**

- [ ] §2.2 #1：≥2 Skill + 第 3 模式只加 1 文件
- [ ] §2.2 #2：`resume-from-stage` 断点重放演示
- [ ] §2.2 #3：L2 跨栈 run
- [ ] §2.2 #4：LLM 可观测 + 监控面板
- [ ] §2.2 #5：相似 run 召回入 plan
- [ ] §2.2 #6：模糊输入 LLM 澄清
- [ ] §8.2：公开双仓、Demo、视频、团队信息
