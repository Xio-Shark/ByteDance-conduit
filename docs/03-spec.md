# Spec：Conduit 超级个体端到端交付系统 v1.0.0

## 规格目标

本 Spec 定义实现仓库必须满足的系统能力、边界、接口、证据和验收规则。它把源题 PDF 的要求转换为可实现、可验证、可答辩的工程规格。

## 范围

### In Scope

- 前端流程控制台。
- Node API 服务。
- AI 编排层：Orchestrator、Agent、Skill Registry。
- Conduit sandbox-repo 读取、写入、diff、命令执行。
- lint / 单测验证结果采集。
- PR 草稿生成，具备权限时可创建真实 PR。
- AI 调用留痕、Skill 选择记录、Prompt 版本记录。
- 提交材料汇总：Demo、视频、公开仓库、README、架构图、AI 使用说明、工程难点。

### Out of Scope

- 无人值守生产发布。
- 不经人工确认直接推送远程分支。
- 用 mock 仓库、mock 模型输出或伪测试替代核心链路。
- 在本文档仓库提交业务源码、Conduit fork、真实密钥或运行报告。

## 系统上下文

```text
PM
  -> Frontend Console
  -> Backend API
  -> Orchestrator
  -> Agents
  -> Skill Registry
  -> Conduit Sandbox Adapter
  -> Git Diff / Lint / Test / PR Draft
  -> Evidence Store
```

## 状态机规格

| 状态 | 进入条件 | 产物 | 允许人工动作 |
|------|----------|------|--------------|
| created | PM 创建需求 | DeliveryRun | 取消 |
| clarifying | 已收到原始需求 | 澄清问题、默认假设 | 补充需求 |
| waiting_requirement_confirm | 目标态：澄清完成 | 需求卡片 | 确认 / 修改 |
| planning | 需求已确认 | 方案、目标文件、验证命令 | 暂停 |
| waiting_plan_confirm | 目标态：方案生成完成 | 影响范围、风险、Skill | 确认 / 修改 |
| editing | 方案已确认 | 文件变更、diff 摘要 | 暂停 |
| verifying | diff 已生成 | lint / test 结果 | 查看日志 / 重跑 |
| pr_drafting | 验证完成 | PR 标题、描述、风险 | 修改 PR 文案 |
| ready_for_pr | PR 草稿完成 | 可提交 PR 材料 | 提交 / 停止 |
| failed | 任一阶段失败 | 失败证据、已生成工件 | 修改输入 / 重新发起 run |

当前 v1.0.0 实现会**自动跑完整链路**；`confirm` 为事后留痕。**§2.2 断点重放** 要求：任一阶段可暂停、改输入、`resume-from-stage` 只重放下游（事件持久化）。`retry` 创建新 run（`retryOf`）仅作辅助，**不能替代**阶段级重放。

## §2.2 评判亮点规格

六项 **全部必达**；课题完成前每项须有 run 或演示证据。

| # | 亮点 | 规格要点 | 必须证据 |
|---|------|----------|----------|
| 1 | 抽象到位 | ≥2 个 Skill；新模式 **只加 1 个 Skill 文件**，不改 `orchestrator.js` / Agent 主干 | Skill 注册表；第 3 模式接入 diff（仅 `services/skills/` 新增） |
| 2 | 断点重放 | 阶段事件持久化；`POST /api/runs/:id/resume-from-stage`（或等价）从指定阶段重放下游 | `metadata.json` 或 event log；演示 plan 后改输入只重跑 edit→verify→pr |
| 3 | 跨栈一致性 | L2 run：Planning 输出 **影响矩阵**（前端/后端/模型/测试）；Coding 跨多层路径 | L2 `plan.md` + 跨栈 `diff.patch`（含 backend + frontend 路径） |
| 4 | 可观测性 | 每次 LLM 调用 tokens/延迟/成本；Web **监控面板** 汇总 | `ai-calls.jsonl`；UI AI Usage 面板截图或 E2E |
| 5 | 业务上下文反哺 | 相似需求召回历史 requirement/plan/Skill/风险并 **进入 plan** | `history-recall.json` + plan 引用；第二条相似 run |
| 6 | 澄清深度 | 真实 LLM；模糊输入须 **clarifications[]** 追问，禁止 silent 硬编 | 模糊输入 run 的 `requirement.md` + 非 rules 的 `ai-calls.jsonl` |

## 需求卡片规格

```yaml
requirement_card:
  id: string
  source_input: string
  goal: string
  scope:
    include: string[]
    exclude: string[]
  assumptions: string[]
  clarifications: string[]
  acceptance:
    - string
  level: L1 | L2 | L3
```

## Skill 规格

```yaml
skill:
  id: string
  version: string
  intent: string
  applies_when:
    - string
  required_context:
    - requirement_card
    - repository_index
  target_paths:
    - string
  outputs:
    - file_patch
    - validation_plan
  validation:
    commands:
      - string
    missing_test_policy: explicit_gap
```

规则：

- Skill 只能描述需求模式、上下文、目标路径和验证边界。
- Skill 不硬编码某一句 PM 文案。
- 新需求模式优先新增 Skill 文件；不得通过改主流程支持具体题型。
- P0 至少 **2 个** Skill（L1 展示字段 + 至少 1 个扩展/L2 模式）；第 3 模式接入不得改主干。

## Agent 规格

| Agent | 输入 | 输出 | 禁止行为 |
|-------|------|------|----------|
| Requirement Agent | PM 输入、历史需求摘要 | 澄清问题、需求卡片 | 在信息不足时直接写代码 |
| Planning Agent | 需求卡片、仓库索引、Skill | 方案、目标文件、风险、验证命令 | 编造不存在路径或命令 |
| Coding Agent | 已确认方案、目标文件、Skill | patch、diff 摘要 | 写入非授权路径 |
| Verification Agent | diff、验证计划 | 命令结果、退出码、日志路径 | 吞掉失败或伪造成功 |
| PR Agent | diff、验证结果、风险 | 分支名、PR 标题、PR 描述 | 隐瞒失败验证 |

## API 规格

| 方法 | 路径 | 请求 / 响应要点 |
|------|------|-----------------|
| `POST` | `/api/runs` | 创建 DeliveryRun，返回 run id |
| `GET` | `/api/runs/:id` | 返回当前状态、阶段产物、可执行动作 |
| `POST` | `/api/runs/:id/confirm` | 提交需求卡片或方案确认 |
| `POST` | `/api/runs/:id/retry` | 创建新 run（`retryOf`）；**不替代** `resume-from-stage` |
| `POST` | `/api/runs/:id/resume-from-stage` | body: `{ stage, revisedInput? }`；从该阶段起重放下游，保留上游产物与事件 |
| `GET` | `/api/runs/:id/events` | SSE 返回阶段事件 |
| `GET` | `/api/runs/:id/diff` | 返回 git diff 或 diff 文件路径 |
| `GET` | `/api/runs/:id/pr-draft` | 返回 PR 草稿 |
| `POST` | `/api/runs/:id/pr` | 显式 `confirm=true`、`head`、`base` 后通过 GitHub provider 创建 draft PR |
| `GET` | `/api/runs/:id/submission` | 返回提交材料状态摘要 |
| `GET` | `/api/history` | 基于归档 evidence 召回相似历史需求和方案 |

## 证据规格

每次运行必须生成 run 级证据：

```text
docs/reports/runs/<run-id>/
├── requirement.md
├── history-recall.json
├── plan.md
├── diff.patch
├── verification.json
├── ai-calls.jsonl
├── pr-draft.md
└── run-summary.json
```

`metadata.json` 为条件产物：只有 retry、confirm 或 PR submission 写入 `retryOf`、`confirmations`、事件补充记录或 `prSubmission` 后才生成。

提交材料必须生成 submission 级证据：

```text
docs/reports/submission/
├── checklist.md
├── demo-script.md
├── architecture.md
├── ai-usage.md
└── engineering-notes.md
```

**§8.2 公开仓库结构**（最终提交，非代码级 P0 阻塞项）：

- 对外链接指向 **AI 系统主仓**（即 `bytedance-implementation/` 的公开 GitHub/GitLab）。
- 同一公开仓内须包含 **Conduit fork 子仓**，推荐路径 `sandbox-repo/`（clone/submodule/worktree 均可），评审可独立查看 Conduit diff 来源。
- 本文档仓 `bytedance/` 仅为设计基线，**不能**替代上述 AI 主仓提交。

## 验证规格

P0 最低验证链路：

1. `sandbox-repo` 来源可证明为 Conduit fork / clone 或裁剪子集。
2. 目标文件存在且在 Conduit 路径内。
3. 代码变更通过真实 git diff 呈现。
4. lint 命令来自仓库真实 script；若 Conduit 缺少 lint script，必须使用针对本次 Conduit 改动的显式 adapter 并在 `verification.json` 记录来源。
5. 相关单测命令来自仓库真实 script；缺失测试必须记录缺口，不允许伪成功。
6. `verification.json` 记录命令、退出码、摘要、日志路径、来源和状态。
7. **集成测试**：源题 §6 工程完整度观测口径含「集成测试绿」；P0 最低线为 lint + 单测，集成测试列为 **P1 加分/答辩补强**，有则写入 `verification.json`，无则显式标记缺口。

## 当前实现约束

截至 2026-05-21：代码级 §2.1 闭环已在 `AI_MODE=rules` 下跑通。**§2.2 六项缺口**（`AI_MODE=llm` 代码路径已存在，待 H3–H4 验收 run；见 [`06-plan#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot)）：

| # | 亮点 | 状态 | 闭合阻塞项 |
|---|------|------|-----------|
| 1 | 抽象到位 | 仅 1 个 Skill；须增第 2/3 个并演示只加文件 | Skill 扩展机制需支持 L2 跨栈路径；当前 Skill 是前端锚点替换模式 |
| 2 | 断点重放 | 仅 `retry` 新 run；须 `resume-from-stage` | Orchestrator 从线性管道改为事件溯源 + 阶段 checkpoint |
| 3 | 跨栈一致性 | 仅 L1 前端 run；须 L2 跨栈 run | Planning Agent 须从硬编码模板改为可推理；需理解 Conduit backend 结构 |
| 4 | 可观测性 | 面板有；须 §2.2 验收口径 LLM run 的非零 metrics | 早期 doubao 探索 run 非零 tokens 但非模糊输入验收 |
| 5 | 业务上下文反哺 | 召回已有；须 plan 引用 + 相似 run 演示 | Planning Agent 须接收 history-recall；须先清理坏归档 |
| 6 | 澄清深度 | `clarifyWithLlm` 已实现；须模糊输入 + LLM 追问 run | 清晰 L1 输入的 LLM run **不计入** #6 |

### Agent 当前实现真实状态

上表「Agent 规格」定义的是目标态。截至 2026-05-21，`AI_MODE=rules` 下各 Agent 的实际行为如下——**与目标态有显著差距**：

| Agent | 目标态 | rules 模式实际行为 | 闭合 §2.2 所需改动 |
|-------|--------|-------------------|-------------------|
| Requirement Agent | 根据输入推理澄清问题、输出需求卡片 | `buildRequirement()` 返回硬编码 requirement card（goal/scope/exclude 固定），不读输入语义 | `AI_MODE=llm` 走 `clarifyWithLlm()`（已实现 + 单测）；须 **模糊输入** 端到端验收 run（H4） |
| Planning Agent | 读仓库索引、选 Skill、输出方案与影响范围 | `buildPlan()` 返回硬编码中文 plan（summary/impacted_modules/risks 固定），不读仓库结构 | 须接收 history-recall 数据入 plan；L2 须输出跨栈影响矩阵 |
| Coding Agent | 基于方案与 Skill 生成 patch | `applyCodingPlan()` 仅 `skill.apply(sandbox)` 一行 passthrough；全部逻辑在 Skill 内 | Skill 扩展机制需支持 L2 多路径写入；Coding Agent 本身无需改动 |
| Verification Agent | 执行 lint/单测并收集结果 | 真实执行 Conduit 命令，已闭环 | 无需改动 |
| PR Agent | 生成 PR 标题/描述/风险 | 模板拼接 PR 文案，已闭环 | 无需改动 |

**关键差距**：Requirement Agent 和 Planning Agent 在 rules 模式下是硬编码空壳，不具备推理能力。§2.2 的闭合路径是 LLM 模式替代 rules 模式做 clarify（#6），以及 Planning Agent 接收外部数据入 plan（#5）和输出跨栈影响矩阵（#3），而非让 rules 模式具备这些能力。

### §2.2 闭合依赖链

```text
AI_MODE=llm 稳定运行 ─┬─→ #6 澄清深度（模糊输入 + LLM 追问）
                      ├─→ #4 可观测性（非零 tokens/延迟/成本）
                      └─→ #5 业务上下文反哺（plan 引用召回）— 需改 planningAgent 入 historyRecall
                              │
                              └─→ #3 跨栈一致性（L2 影响矩阵）— 需 Planning Agent 可推理
                                      │
                                      └─→ #1 抽象到位（新增 Skill）— 需 Skill 架构支持 L2

Orchestrator 事件溯源重构 ─→ #2 断点重放（resume-from-stage）
```

**串行瓶颈**：#3/#5 依赖 Planning Agent 改造；#1 的 L2 Skill 依赖 #3 的跨栈能力。#2 独立于 LLM 路径，可并行推进。

### 降级策略（如果 20 天内无法全部闭合）

| 项 | 闭合路径 | 降级路径 | 降级后可声称 |
|----|---------|---------|------------|
| #1 抽象到位 | 3 Skill 含 1 个 L2 | 3 Skill 全 L1（如 Popular Tags 打标 + 文章字数统计），仍演示只加文件不改主干 | "Skill 扩展机制已验证，L2 Skill 需更长周期" |
| #2 断点重放 | 完整事件溯源 + resume-from-stage API + 前端入口 | API 端 resume-from-stage 只重跑整条链路但保留上游证据文件；前端仅展示已归档事件流 | "阶段证据可追溯，精确断点重放为 P1 演进" |
| #3 跨栈一致性 | Planning Agent 输出影响矩阵 + L2 跨栈 diff | plan.md 手动标注前后端影响 + Skill 同时写 frontend/backend 两处路径 | "跨栈 diff 已验证，影响矩阵自动推理为 P1" |
| #4 可观测性 | LLM 非零 metrics + 面板汇总 | 已闭合（依赖 LLM 稳定，无独立降级路径） | — |
| #5 业务上下文反哺 | plan 自动引用召回条目 | UI 展示召回结果 + plan.md 模板含"历史参考"段落由 Agent 填入 | "召回可演示，自动入 plan 为 P1" |
| #6 澄清深度 | LLM 模糊输入追问 + requirement.md 证据 | 已闭合（依赖 LLM 稳定，无独立降级路径） | — |

**不可降级**：#4 和 #6 直接依赖真实 LLM 调用，没有降级替代。如果 LLM 接入在截止前无法稳定，这两项也无法闭合。

实现层收口（保持不变）：

- 模型输出的 `requirement_card` 必须包含 `id`、`goal`、`scope.include`、`scope.exclude`、`assumptions`、`clarifications`、`acceptance` 和 `level`；缺字段直接失败，不用默认值补齐。
- **代码级 P0** 默认 `AI_MODE=rules`。**§2.2** 要求真实 LLM（澄清深度、可观测非零 tokens）；须扩展 `AI_MODE=llm` 或等价。
- `article-list-display-field` Skill 必须找到预期 JSX / CSS 锚点才写入；目标结构漂移时直接失败，不生成半成功 patch。
- API 路由只保留 HTTP 编排，run 存取、run response 映射、人工确认、PR 提交和 submission 状态拆到独立小模块。
- Web 入口、状态编排、HTTP client 与结果面板拆分，关键证据或事件日志缺失会显示错误态，不用普通空态掩盖。
- 人工确认必须显式提交 `approved` 或 `rejected`，确认 metadata 写入失败会返回错误，不再由 API 静默默认成通过或成功。
- API 创建 run 必须提供非空需求输入；返回 `passed` / `ready_for_pr` 必须带完整 requirement、plan、edit、verification、diff、PR draft、AI usage 和 AI calls；归档成功 run 必须具备 `requirement.md`、`plan.md`、`verification.json`、`diff.patch`、`pr-draft.md` 和 `ai-calls.jsonl`，缺失即失败。
- `ai-calls.jsonl` 只记录真实模型或规则化澄清调用；tokens、延迟和成本必须是显式数字，确定性 plan / edit / verify / PR draft 阶段以各自证据文件表达。
- 历史召回只读取已落盘 evidence；不完整归档进入 `skipped`，整体状态标为 `degraded`（仍有可用 `matches` 时继续召回），不会把部分可用结果伪装成全量 ready。
- GitHub draft PR 请求必须显式携带 `confirm=true`、`head` 和 `base`，GitHub 非 JSON 或不完整成功响应会暴露为错误。
- 提交材料状态至少检查文件存在且非空；空文件标记为 `invalid`，不展示成已生成。

## 配置与安全规格

实现仓库 `.env.example` 至少包含：

```bash
AI_MODE=rules
SANDBOX_REPO_PATH=
GITHUB_TOKEN=
```

要求：

- 真实密钥只存在于本地环境变量或部署密钥。
- README、派生文档、测试快照、运行报告中不得包含真实 API key。
- 默认不推送远程分支；创建真实 PR 必须由用户显式确认并提供 `head` / `base`。
- 如接入额外模型，提交材料必须声明模型清单、用途、费用承担和合规边界。

## P0 验收门槛（§2.1 MVP）

| 门槛 | 必须证据 |
|------|----------|
| 三端齐备 | 前端、Node API、AI 编排服务可启动 |
| 真实仓库 | sandbox-repo 指向 Conduit fork / clone 或裁剪子集 |
| 真实写入 | `diff.patch` 包含 Conduit 真实路径 |
| 真实验证 | `verification.json` 包含 lint / 单测结果或显式缺口 |
| PR 准备 | `pr-draft.md` 包含需求、方案、文件、验证、风险 |

## §2.2 验收门槛（全部必达）

| 门槛 | 必须证据 |
|------|----------|
| 抽象到位 #1 | ≥2 Skill；第 3 模式仅新增 Skill 文件 |
| 断点重放 #2 | `resume-from-stage` + 阶段事件；演示只重放下游 |
| 跨栈一致性 #3 | L2 run + 影响矩阵 + 跨栈 diff |
| 可观测性 #4 | LLM `ai-calls.jsonl` + Web 监控面板 |
| 业务上下文反哺 #5 | 相似 run 召回进入 plan |
| 澄清深度 #6 | 模糊输入 + LLM 追问 `requirement.md` |

## 提交材料门槛（§8.2）

| 门槛 | 必须证据 |
|------|----------|
| AI 留痕 | 真实 LLM 调用记录；`ai-usage.md` 声明 |
| 公开双仓 | AI 主仓 + `sandbox-repo/` 子仓 |
| 演示 | Demo、3–8 分钟视频（覆盖 §2.1 + §2.2 六项） |

## P2 演进规格

| 等级 | 能力 | 规格边界 |
|------|------|----------|
| P2 | 更多需求模式 | L3 题型、集成测试、完整 Conduit 仓 |
| P2 | 平台化 | 多人协作、完整 CI/CD（非 §2.2 阻塞） |

## 完成定义

| 层级 | 条件 |
|------|------|
| **代码级 P0** | §2.1 验收门槛 + 真实 run 证据（允许 `AI_MODE=rules`） |
| **课题完成** | §2.1 + **§2.2 六项全部闭合** + §8.2 提交材料 |

冲刺任务见 [06-plan 冲刺关键路径](./06-plan.md#冲刺关键路径进度-ssot)。本文档仓为设计基线；**代码级 P0 ≠ 课题完成**。
