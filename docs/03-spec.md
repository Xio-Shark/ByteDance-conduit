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
- 同一公开仓内须包含 **Conduit 代码目录**，推荐路径 `sandbox-repo/`（普通子目录、submodule 或 subtree 均可；当前实现采用普通子目录），评审可独立查看 Conduit diff 来源。
- 本文档仓 `bytedance/` 仅为设计基线，**不能**替代上述 AI 主仓提交。
- §8.2 不要求直接向 `TonyMckes/conduit-realworld-example-app` 上游仓库提交 PR；真实 draft PR / 上游 PR 属于 H17 可选远端能力。

## 验证规格

P0 最低验证链路：

1. `sandbox-repo` 来源可证明为 Conduit fork / clone 或裁剪子集。
2. 目标文件存在且在 Conduit 路径内。
3. 代码变更通过真实 git diff 呈现。
4. lint 命令来自仓库真实 script；若 Conduit 缺少 lint script，只有 Skill `validation` 显式声明 `npm run lint:sandbox` 时才可使用针对本次 Conduit 改动的 adapter，并在 `verification.json` 记录来源；未声明则记为 `gap` / failed。
5. 相关单测命令来自仓库真实 script；缺失测试必须记录缺口，不允许伪成功。
6. `verification.json` 记录命令、退出码、摘要、日志路径、来源和状态。
7. **集成测试**：源题 §6 工程完整度观测口径含「集成测试绿」；P0 最低线为 lint + 单测，集成测试列为 **P1 加分/答辩补强**，有则写入 `verification.json`，无则显式标记缺口。

## 当前实现状态

截至 2026-05-22：代码级 §2.1 已闭环，§2.2 六项已有代码 / run 证据；`npm run verify` 通过（108 项 Node/API/Web/scripts 测试，107 pass / 1 skip，另含 sandbox lint、Conduit Vitest、Web build）。**课题完成仍未闭合**：§8.2 的 Demo URL、演示视频、公开 AI 系统主仓和团队信息仍待人工。

| # | 亮点 | 代码 / run 证据 | 剩余边界 |
|---|------|----------------|----------|
| 1 | 抽象到位 | 4 个 Skill；第 3/4 个仅新增 Skill 文件，不改 Orchestrator/Agent 主干 | S7 录屏需展示只加 Skill 文件的接入过程 |
| 2 | 断点重放 | `resume-from-stage` API、checkpoints、Web 入口已实现 | S7 录屏需展示 plan 后只重跑 edit→verify→pr |
| 3 | 跨栈一致性 | L2 run `run-2026-05-21T05-52-12-490Z`；plan 影响矩阵 + backend/frontend diff + `crossStackSync` | 当前是 Skill 驱动的跨路径同步，不等同于任意后端字段自动推导全前端改造 |
| 4 | 可观测性 | run `run-2026-05-21T05-58-01-181Z` 非零 tokens/latency；Web 单 run + 跨 run AI Usage 面板 | S7 录屏需展示面板 |
| 5 | 业务上下文反哺 | `history-recall.json` + `plan.history_references`；相似 run `run-2026-05-21T05-51-56-519Z` | 不完整历史归档保持 `degraded/skipped`，不伪装全量召回 |
| 6 | 澄清深度 | 模糊输入 LLM run `run-2026-05-21T05-58-01-181Z` 含 `clarifications[]` | 清晰 L1 原句 run 不计入 #6 |

### Agent 当前实现真实状态

| Agent | 当前实现 | 边界 |
|-------|----------|------|
| Requirement Agent | `AI_MODE=rules` 走已注册演示模式；`AI_MODE=llm` 走 `clarifyWithLlm()` 并校验完整需求卡片 | rules 不是通用自然语言理解；未知需求必须 fail-fast |
| Planning Agent | 读取 sandbox 文件索引、Skill、history recall；L2 可输出影响矩阵；缺目标文件直接失败 | 仍是受 Skill 约束的确定性规划，不声称任意需求全自动推理 |
| Coding Agent | 通过 `skill.apply(sandbox)` 执行具体改动 | 业务模式逻辑留在 Skill，不在 Agent 主干堆分支 |
| Verification Agent | 执行真实 sandbox 命令和显式声明的 lint adapter | 缺 script / 缺锚点按失败或 gap 记录，不伪成功 |
| PR Agent | 生成本地 PR 草稿；可选 GitHub draft PR provider 已实现 | 真实远端 PR 是 H17 可选项，不是 §8.2 最小提交要求 |

### 剩余完成边界

- **S6**：人工填写团队名称、成员、Demo URL、视频 URL、公开 AI 系统主仓 URL。
- **S7**：录制 3–8 分钟演示视频，覆盖 §2.1 主链路和 §2.2 六项。
- **S8**：公开 `bytedance-implementation/` 作为 AI 系统主仓，且仓内包含 `sandbox-repo/`。
- **S10**：6.10 前提交 §8.2 材料。当前 `pre-submission-check.sh` 会因这些人工占位失败，这是正确的最终提交门禁行为。

实现层收口（保持不变）：

- 模型输出的 `requirement_card` 必须包含 `id`、`source_input`、`goal`、`scope.include`、`scope.exclude`、`assumptions`、`clarifications`、`acceptance` 和 `level`；缺字段直接失败，不用默认值补齐，也不用原始请求输入回填 `source_input`。
- **代码级 P0** 通过显式 `AI_MODE=rules` 运行；rules 只支持已注册演示模式，未知需求必须 fail-fast，不能静默套用阅读量主线。缺 `AI_MODE` 必须失败。**§2.2** 要求真实 LLM（澄清深度、可观测非零 tokens）；须使用 `AI_MODE=llm` 或等价。
- `article-list-display-field` Skill 必须找到预期 JSX / CSS 锚点才写入；目标结构漂移时直接失败，不生成半成功 patch。
- API 路由只保留 HTTP 编排；`runRoutes.js` 只聚合 run 路由，执行、证据读取、人工确认 / PR / submission 拆到独立小模块，run response 映射与存取逻辑继续独立维护。
- Web 入口、状态编排、HTTP client 与结果面板拆分，关键证据或事件日志缺失会显示错误态，不用普通空态掩盖。
- 人工确认必须显式提交 `approved` 或 `rejected`，确认 metadata 写入失败会返回错误，不再由 API 静默默认成通过或成功。
- API 创建 run 必须提供非空需求输入；返回已过 clarify 的 run 必须带 AI usage 和 AI calls；返回 `passed` / `ready_for_pr` 还必须带完整 requirement、plan、edit、verification、diff、PR draft。归档成功 run 必须具备 `requirement.md`、`plan.md`、`verification.json`、`diff.patch`、`pr-draft.md`、`ai-calls.jsonl` 和 `run-summary.json.aiUsage`，缺失即失败。
- `ai-calls.jsonl` 只记录真实模型或规则化澄清调用；真实 LLM response 必须返回 usage token 计数，`prompt_version`、`input_summary`、`output_summary`、tokens、延迟和成本必须显式写入且为 JSON number，不接受字符串数值，不从 plan、固定文案或 0 值默认补齐；确定性 plan / edit / verify / PR draft 阶段以各自证据文件表达。
- 跨 run AI Usage 只聚合 `run-summary.json.status == "passed"`、存在非空 `ai-calls.jsonl` 且 `run-summary.json.aiUsage` 与调用日志汇总一致的归档；失败、暂停、legacy 或不完整归档进入 `skipped` / `invalidRuns`，不会混入可观测性验收 totals。
- Planning Agent 必须读取真实 `sandbox-repo` 路径和目标文件索引；缺 repo path、sandbox root 不存在或目标文件不存在时直接失败，不生成空 `sandbox_index` 或 `exists:false` 计划证据。
- Skill 匹配必须有足够且唯一的意图证据；低置信度单关键词或并列候选直接失败并列出候选项，不静默选择最高排序项。
- L2 跨栈校验必须检查具体前端/后端变更锚点（如 `article.draft`、`draft-badge`、`DataTypes.BOOLEAN`、controller 默认字段），不能只用泛文本关键词命中当作一致。
- 历史召回只读取已落盘 evidence；不完整归档进入 `skipped`，整体状态标为 `degraded`（仍有可用 `matches` 时继续召回），不会把部分可用结果伪装成全量 ready。
- GitHub draft PR 请求必须显式携带 `confirm=true`、`head` 和 `base`，GitHub 非 JSON 或不完整成功响应会暴露为错误；该能力只在 H17 可选远端 PR 场景使用，不是 §8.2 最小提交的阻塞项。
- 提交材料状态至少检查文件存在且非空；空文件标记为 `invalid`，不展示成已生成。§8.2 外部链接、团队信息和提交清单必须识别 `待填` / `待部署` / `待录制` / 未勾选项；占位内容返回 `pending_human`。URL 只可返回 `provided_unverified`，不能仅凭链接展示为最终 ready。

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
- 默认不推送远程分支；创建真实 PR 必须由用户显式确认并提供 `head` / `base`。若目标是上游 Conduit，通常应先 fork 到有权限的账号，再从 fork 分支发起 PR。
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
| 公开主仓 | 公开 AI 系统主仓，且仓内包含 `sandbox-repo/` |
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
