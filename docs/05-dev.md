# 技术开发文档：Conduit 超级个体端到端交付系统 v1.0.0

## 文档目标

本文档定义如何实现一个面向 Conduit 仓库的端到端 AI 交付系统。根层只保存设计和规范；业务实现位于 `bytedance-implementation/` 实现子树。当前本地 checkout 是单 Git 工作区；公开发布时将实现子树作为 AI 系统主仓发布。

## 系统边界

### 必须实现

- 前端对话与流程控制台。
- Node 后端 API。
- AI 编排层，包括 Orchestrator、Agent、Skill 注册表。
- Conduit sandbox-repo 读取、定位、写入和 diff。
- lint / 单测执行与结果采集。
- PR 草稿生成，具备权限时可创建真实 PR。

### 不在本文档仓库实现

- Conduit fork 源码。
- 真实 API key。
- 真实部署平台配置。
- 评审用录屏、Demo 链接和最终代码仓库。

## 推荐技术栈

| 层 | 推荐 | 说明 |
|----|------|------|
| 前端 | React + Vite | 与课题 Conduit 背景一致，便于快速实现 |
| 后端 | Node.js + Express | 对齐 Conduit 后端技术栈，减少上下文切换 |
| 编排 | TypeScript services | 明确类型、事件和状态机 |
| 沙箱仓库 | Git worktree 或独立 clone | 保留真实 git diff |
| 澄清与编排 | `AI_MODE=rules`（代码级 P0）/ `AI_MODE=llm`（课题完成） | rules 跑胶水；llm 走 `clarifyWithLlm`（验收 run `05-58-01` 已归档） |
| 测试 | 仓库已有 lint / test script | 不臆造不存在命令 |

## 架构分层

```text
Frontend Console
  ↓ HTTP / SSE
Backend API
  ↓
Orchestrator
  ├─ Requirement Agent
  ├─ Planning Agent
  ├─ Coding Agent
  ├─ Verification Agent
  └─ PR Agent
  ↓
Skill Registry
  ↓
Conduit Sandbox Adapter
  ↓
Git Diff / Lint / Unit Test / PR Draft
```

## 目录目标态

```text
project-root/
├── apps/
│   ├── web/                 # 前端控制台
│   └── api/                 # Node API
├── services/
│   ├── orchestrator/        # 阶段状态机与事件流
│   ├── agents/              # 澄清、规划、编码、验证、PR Agent
│   ├── skills/              # Skill 注册与具体 Skill（当前 4 个）
│   ├── sandbox/             # Conduit 仓库适配
│   ├── checks/              # crossStackSync 等校验
│   └── index/               # sandbox 索引与历史召回
├── libs/
│   └── types/               # 共享阶段常量
├── external/
│   ├── git-provider/        # GitHub PR 适配
│   └── model-client/        # LLM 调用封装
├── docs/
│   └── reports/             # 运行、验证、演示与提交证据
├── sandbox-repo/            # Conduit fork/clone 代码目录；随公开 AI 主仓一并提交
└── .env.example
```

当前实现暂未单独创建 `libs/prompts`。P0 的模型消息模板集中在 `services/orchestrator/src/aiArtifacts.js`，后续只有在多需求模式或多 Prompt 版本开始复用时再拆出独立 prompts 目录。

## 证据目录约定

实现仓库应把每次运行的证据按 run 归档，最终提交材料按 submission 归档。

```text
docs/reports/
├── runs/<run-id>/
│   ├── requirement.md
│   ├── history-recall.json
│   ├── plan.md
│   ├── diff.patch
│   ├── verification.json
│   ├── ai-calls.jsonl
│   ├── pr-draft.md
│   ├── run-summary.json
│   └── metadata.json
└── submission/
    ├── checklist.md
    ├── demo-script.md
    ├── architecture.md
    ├── ai-usage.md
    ├── engineering-notes.md
    ├── team-info.md
    ├── defense-prep.md
    ├── video-recording-guide.md
    ├── public-repo-guide.md
    ├── security-check-report.md
    └── dependency-audit-decision.md
```

这些文件属于实现子树运行产物；根层文档只定义格式和验收含义。

## 核心数据模型

### DeliveryRun

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 一次需求交付流程 ID |
| input | string | PM 原始输入 |
| stage | enum | clarify / plan / edit / verify / pr / done / failed |
| status | enum | running / waiting_human / passed / failed |
| skill_id | string | 命中的 Skill |
| repo_path | string | sandbox-repo 路径 |
| evidence | Evidence[] | 阶段证据 |

### Skill

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | Skill 唯一 ID |
| intent | string | 适用需求模式 |
| inputs | string[] | 需要的上下文 |
| outputs | string[] | 产物类型 |
| target_paths | string[] | 允许修改路径模式 |
| validation | string[] | 验证命令 |

### Evidence

| 字段 | 类型 | 说明 |
|------|------|------|
| stage | string | 所属阶段 |
| type | string | clarification / plan / diff / command / pr |
| path | string | 文件或日志路径 |
| summary | string | 摘要 |
| status | string | passed / failed |

### AiCallLog

| 字段 | 类型 | 说明 |
|------|------|------|
| run_id | string | 所属 DeliveryRun |
| stage | string | clarify / plan / edit / verify / pr |
| model | string | 模型名称或部署 ID 别名 |
| prompt_version | string | Prompt 或 Skill 版本 |
| input_summary | string | 脱敏后的输入摘要 |
| output_summary | string | 脱敏后的输出摘要 |
| tokens_in | number | 输入 token 数 |
| tokens_out | number | 输出 token 数 |
| latency_ms | number | 调用耗时 |
| cost_estimate | number | 估算成本，可为空但字段必须存在 |
| status | string | passed / failed / reviewed |

### SubmissionArtifact

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | demo / video / repo / readme / architecture / ai_usage / engineering_notes |
| path_or_url | string | 文件路径或外部链接 |
| required | boolean | 是否属于 §8.2 必填项 |
| status | string | missing / invalid / generated / pending_human / provided_unverified |

## API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/runs` | 创建需求交付流程 |
| `GET` | `/api/runs/:id` | 查询流程状态 |
| `POST` | `/api/runs/:id/confirm` | 提交人工确认 |
| `POST` | `/api/runs/:id/retry` | 创建新 run（`retryOf`） |
| `POST` | `/api/runs/:id/resume-from-stage` | §2.2 断点重放：从指定阶段只重放下游 |
| `GET` | `/api/runs/:id/events` | 订阅阶段事件 |
| `GET` | `/api/runs/:id/diff` | 查看 git diff |
| `GET` | `/api/runs/:id/pr-draft` | 获取 PR 草稿 |
| `POST` | `/api/runs/:id/pr` | 显式确认后创建 GitHub draft PR |
| `GET` | `/api/runs/:id/submission` | 获取提交材料与 AI 留痕摘要 |
| `GET` | `/api/history` | 从归档 evidence 召回相似历史需求 |
| `GET` | `/api/ai-usage/summary` | 跨 passed run 汇总 AI 调用 metrics；失败/不完整归档返回 `skipped` |

## Orchestrator 状态机

```text
created
  → clarifying
  → waiting_requirement_confirm
  → planning
  → waiting_plan_confirm
  → editing
  → verifying
  → pr_drafting
  → ready_for_pr
```

失败状态：任一阶段可进入 `failed`，必须保留失败证据和已生成工件。

## Agent 职责

| Agent | 输入 | 输出 |
|-------|------|------|
| Requirement Agent | PM 输入、历史需求 | 澄清问题、需求卡片 |
| Planning Agent | 需求卡片、仓库索引、Skill | 方案、模块定位、任务拆分 |
| Coding Agent | 方案、目标文件、Skill | 代码 diff |
| Verification Agent | diff、验证命令 | lint / test 结果 |
| PR Agent | diff、验证结果 | PR 标题、描述、风险 |

## Skill 注册机制

P0 至少 **2 个** Skill；第 3 模式接入 **只新增 Skill 文件**（§2.2 #1）。

```yaml
id: article-list-display-field
intent: 在文章列表卡片增加展示字段
inputs:
  - requirement_card
  - repository_index
outputs:
  - file_patch
  - validation_plan
target_paths:
  - "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx"
  - "frontend/src/styles.css"
validation:
  - "npm run lint:sandbox"
  - "npm test --prefix sandbox-repo"
```

约束：

- Skill 只描述模式、上下文和边界。
- Skill 不硬编码具体 PM 文案。
- 新模式优先新增 Skill 文件。

当前实现真实状态（2026-05-21）：

- `registry.js` 的 `findSkill()` 使用 **intent 加权 + 关键词匹配**——对 `appliesWhen` 与需求文本做匹配；答辩新增 Skill 通常只改 `services/skills/src/`。
- `AI_MODE=rules` 只将明确命中的四类演示需求结构化为 requirement card；未知需求直接失败并暴露错误，不默认套用阅读量主线。运行时必须显式提供 `AI_MODE`。
- 各 Skill 的 `apply()` 以 **锚点替换** 或结构化 patch 写入 Conduit 路径；L2 Skill 同时改 frontend + backend。
- 已注册 **4 个 Skill**：`article-list-display-field`、`article-draft-indicator`、`article-detail-word-count`、`popular-tags-top-five`。第 3/4 个接入时 orchestrator / Agent 主干无改动。

## Conduit Sandbox Adapter

必须提供以下能力：

| 能力 | 说明 |
|------|------|
| clone_or_open | 打开真实 Conduit fork / clone |
| index_repo | 读取文件树与关键模块摘要 |
| read_files | 读取目标文件 |
| apply_patch | 写入代码变更 |
| git_diff | 获取真实 diff |
| run_command | 执行 lint / test |
| pr_draft | 生成 PR 材料 |

## 验证策略

P0 验证命令以 Conduit 仓库真实脚本为准。系统不得凭空生成不存在的命令；当 Conduit 缺少 lint script 时，只能使用显式命名的实现仓库 adapter 检查本次 Conduit 改动，并在验证结果中记录来源。

最低验证：

1. 检查目标文件已变更。
2. 生成 git diff。
3. 运行 Conduit lint script 或显式 adapter。
4. 运行与变更相关的单测；若仓库缺少对应测试，必须显式标记缺口。
5. L2 跨栈需求运行 `cross-stack-sync`，检查具体前端/后端字段锚点而不是泛文本关键词。
6. 生成验证报告。

## AI 使用留痕

系统必须记录 AI 使用过程，但不得保存真实密钥、完整敏感输入或内部数据。

最低留痕：

1. 每次模型调用写入 `ai-calls.jsonl`。
2. 规则化 scaffold 调用也必须在 clarify 阶段写入 `ai-calls.jsonl` 并标明 `rules-first-p0`；真实 LLM response 必须返回 usage token 计数；`prompt_version`、`input_summary`、`output_summary`、tokens、延迟和成本必须显式写入且为 JSON number；暂停/重放恢复时缺该文件直接失败，不补造调用记录；确定性 plan / edit / verify / PR draft 阶段不混入 AI 调用日志。
3. 已过 clarify 的 API response、`failure.json` 或 `run-summary.json` 必须持久化 `aiUsage`，归档读取只校验不现场补算展示值。
4. 跨 run AI Usage 汇总只统计 `run-summary.json.status == "passed"`、`ai-calls.jsonl` 非空且 `run-summary.json.aiUsage` 与日志一致的归档；失败、暂停、legacy 或不完整归档作为 `skipped` / `invalidRuns` 返回。
5. Planning Agent 必须读取真实 sandbox repo path 与目标文件索引；缺 repo path、sandbox root 或目标文件时 fail-fast。
6. Skill 选择必须记录 Skill ID、版本、匹配原因和人工确认状态；低置信度或并列候选直接失败，不静默选第一个。
7. 每次 Prompt 变更记录版本号和变更意图。
8. 常规运行由编排自动推进；Web「Record review」按钮与 `confirm` API 记录事后审阅留痕。演示真阻塞人工确认时设置 `BLOCK_ON_CONFIRM=1`，系统进入 waiting 阶段后由 continue API 推进下游。
9. README 或 `docs/reports/submission/ai-usage.md` 汇总模型清单、用途、调用边界和审阅机制。

## 安全与配置

`.env.example` 至少包含：

```bash
AI_MODE=rules
SANDBOX_REPO_PATH=
# AI_MODE=llm 时必填（勿提交真实 key）：
# LLM_API_KEY=
# LLM_MODEL=
# LLM_BASE_URL=
GITHUB_TOKEN=
```

要求：

- 真实密钥只放本地环境变量。
- 官方下发 EP / API key 只在本地配置或部署密钥中使用，不进入 README、派生文档、测试快照或运行报告。
- 默认不自动推送远程分支；创建真实 draft PR 时必须显式传入 `confirm=true`、`head` 和 `base`。真实 draft PR / 上游 Conduit PR 是 H17 可选能力，不是 §8.2 最小提交门槛。
- GitHub Token 权限最小化，仅用于创建 PR 时启用。
- **模型**：代码级 P0 可用 `AI_MODE=rules`；课题完成须 `AI_MODE=llm` **模糊输入验收 run**（`run-2026-05-21T05-58-01-181Z`）并在 `ai-usage.md` 声明名称、用途、费用与合规边界。

冲刺实现顺序见 [`06-plan#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot)。

## P0 交付判定

同时满足以下条件，才可声称 P0 完成：

- 前端、后端、AI 编排三层均可运行。
- 至少一个 L1 需求从输入走到 PR 草稿。
- 真实 Conduit sandbox 产生 git diff。
- lint 与相关单测结果可见。
- 失败路径能显示错误而不是伪成功。
- README 能说明启动、配置、演示和 AI 使用方式。
- 提交材料清单能覆盖 Demo、视频、公开 AI 系统主仓（内含 `sandbox-repo/`）、架构图、AI 使用说明和工程难点说明。

## 技术结论
本系统的实现重点不是造一个复杂平台，而是用最小胶水代码连接模型、Skill、Git 仓库和测试命令，形成可现场演示、可审计、可扩展的 PM 到 PR 闭环。
