# Conduit 超级个体工作区

本工作区以“实现一个可以端到端交付全栈项目的超级个体”课题的 `v1.0.0` 设计基线为入口；真实实现位于 [`bytedance-implementation/`](./bytedance-implementation/) 子树。

**不确定文件在哪、干什么？** 先看 [`仓库导航.md`](./仓库导航.md)（逻辑分工、每份文档与实现目录的职责索引）。

**Agent 可以进行代码相关工作**（实现、调试、测试、运行验证、生成 run 证据等），但**必须在实现子树** [`bytedance-implementation/`](./bytedance-implementation/)（绝对路径：`/Users/xioshark/Desktop/bytedance/bytedance-implementation`）内进行，不得在工作区根层新建或修改 `apps/`、`services/`、`sandbox-repo/` 等业务源码。

> 当前本地 checkout 是单 Git 工作区：`bytedance-implementation/` 是实现子树，不是已拆出的独立 `.git` 仓。§8.2 公开发布时，应将该实现子树作为 AI 系统主仓发布，并确保公开内容包含 `sandbox-repo/`。

## 文档原则

- **KISS**：入口只做导航，细节只放在对应源文档。
- **YAGNI**：不保留快照报告、重复技术栈说明、执行型台账或未使用模板。
- **DRY**：同一事实只维护一处；其他文档用链接引用。
- **SOLID**：每个文档只回答一个问题，职责边界清楚。

## 怎么阅读文档

工作区根层是**设计基线入口**；可运行业务代码在 [`bytedance-implementation/`](./bytedance-implementation/) 子树。所有课题说明集中在 [`docs/`](./docs/) 一个目录里，按端到端交付流程编号 `01`–`12`；**改文档只改 `docs/` 里对应文件**，不要在根目录另建副本。

### 三步入口（建议所有人先走一遍）

| 步骤 | 读什么 | 作用 |
|------|--------|------|
| 1 | 本文件 [`README.md`](./README.md) | 仓库分工、阅读路线、**代码级 P0 vs 提交完成**、§7.1 凭据忽略 |
| 2 | [`仓库导航.md`](./仓库导航.md) | **逻辑分工与目录树**、每个文件/目录的作用、按目标选读 |
| 3 | [`AGENTS.md`](./AGENTS.md) | Agent / 协作者的工作边界：能改哪些路径、代码必须去哪个实现仓 |
| 4 | [`docs/`](./docs/) 按 **01 → 12** 顺序 | 课题的完整设计基线（下文逐份说明） |

源题原文（只读、不转写密钥）：[`实现一个可以端到端交付全栈项目的“超级个体”.pdf`](./实现一个可以端到端交付全栈项目的“超级个体”.pdf)；可读 Markdown 版（§7.1 凭据已脱敏）：[`实现一个可以端到端交付全栈项目的“超级个体”.md`](./实现一个可以端到端交付全栈项目的“超级个体”.md)。派生理解以 [`docs/01-understanding.md`](./docs/01-understanding.md) 为准。

### 设计基线阅读顺序与每份文档的作用

按编号顺序阅读；**不要跳读 03-spec**，它是实现与验收的硬约束。

| 序号 | 文档 | 作用（这份文档回答什么） | 典型读者场景 |
|------|------|--------------------------|--------------|
| **01** | [`01-understanding.md`](./docs/01-understanding.md) | 题目边界、**§2.2 六项必达**、完成定义分层 | 第一次接触课题；对齐范围与术语 |
| **02** | [`02-prd.md`](./docs/02-prd.md) | 产品目标、用户故事、功能列表、评分维度、必须规避的降档项 | 写 PRD 级材料、答辩讲「做什么」 |
| **03** | [`03-spec.md`](./docs/03-spec.md) | **可执行规格**：状态机、Agent/Skill、API、证据文件、P0 门槛、安全规则 | **写代码前必读**；与实现仓行为对齐 |
| **04** | [`04-design.md`](./docs/04-design.md) | 控制台页面、阶段展示、diff/验证/PR 草稿/提交状态等交互 | 做前端、写演示脚本、画界面 |
| **05** | [`05-dev.md`](./docs/05-dev.md) | 实现仓目录结构、技术栈、环境变量、API 与证据路径 | **在 `bytedance-implementation/` 落地代码时对照** |
| **06** | [`06-plan.md`](./docs/06-plan.md) | 里程碑 M1–M7、§2.2 六项追踪、**冲刺关键路径**、演示题 | 排期、验收节点、选演示主线 |
| **07** | [`07-architecture-overview.md`](./docs/07-architecture-overview.md) | 系统分层、主流程、与 Spec 的对应关系 | 画架构图、答辩讲分层 |
| **08** | [`08-adr-0001-…`](./docs/08-adr-0001-super-individual-agentic-delivery.md) | 决策：为何用 Agent + Skill + Orchestrator 交付闭环 | 解释架构选型 |
| **09** | [`09-adr-0002-…`](./docs/09-adr-0002-evidence-first-docs-only-repository.md) | 决策：为何文档仓与实现仓分离、证据放哪里 | 解释双仓库、评审材料组织 |
| **10** | [`10-progress.md`](./docs/10-progress.md) | 实现进度快照（对照实现仓；与冲刺清单配合） | 查「做到哪了」 |
| **11** | [`11-acceptance.yaml`](./docs/11-acceptance.yaml) | 结构化验收项（P0/P1），用于自查与测试设计 | 写测试、答辩前逐项勾选 |
| **12** | [`12-traceability.yaml`](./docs/12-traceability.yaml) | 需求 ID → 文档锚点 → 预期证据，防止需求遗漏 | 追踪「每条需求是否有文档与证据」 |

更短的索引表见 [`docs/README.md`](./docs/README.md)。

### 按目标选读（不必每次 01–12 全读）

| 你的目标 | 建议阅读 |
|----------|----------|
| 只想知道课题边界与 P0 定义 | 01 → 06 |
| 要在实现仓写/改代码 | 01 → 03 → **05** → 11；实现时以 03 为验收依据 |
| 要做 UI / 演示 | 03 → 04 → 06 |
| 要答辩 / 写提交材料 | 02 → 07 → 09 → 10；实现仓 `docs/reports/submission/` |
| 要核对是否满足验收 | 03 → 11 → 12；[10-progress](./docs/10-progress.md)；实现仓 run 证据 |
| 要跟踪冲刺任务 | [06-plan 冲刺关键路径](./docs/06-plan.md#冲刺关键路径进度-ssot) → 10-progress |
| Agent 首次进场 | **AGENTS.md** → [`仓库导航.md`](./仓库导航.md) → 01 → 03 → 05 → 06 |

### 读完文档之后

- **写代码、跑测试、生成 run 证据**：切换到 [`bytedance-implementation/`](./bytedance-implementation/)（路径：`/Users/xioshark/Desktop/bytedance/bytedance-implementation`）。
- **改需求/规格/计划**：只改 `docs/` 中对应编号文件，见下文「任务路由」。
- **运行证据与提交草稿**：在实现子树 `docs/reports/runs/` 与 `docs/reports/submission/`，不在工作区根层。

## Agent 执行入口

### 逻辑分工

| 位置 | Agent 可做什么 | 不可做什么 |
|------|----------------|------------|
| 根层（`bytedance/`） | 阅读与维护设计基线：`README.md`、`AGENTS.md`、`docs/**` | 编写或修改业务源码、Conduit sandbox、run 证据、Demo |
| 实现子树（[`bytedance-implementation/`](./bytedance-implementation/)） | **全部代码工作**：实现、重构、单测、lint、`npm run verify` / `run:p0`、运行报告与提交材料 | 把真实 API key 写入仓库；在本工作区外另建平行实现目录 |

实现子树路径：`/Users/xioshark/Desktop/bytedance/bytedance-implementation`。进行任何代码相关操作前，应将工作目录切换到该路径（或等价地使用该路径下的文件绝对路径）。

### 执行顺序

当目标是完成源题 PDF 任务时：

1. 在本仓库读取 [`AGENTS.md`](./AGENTS.md) 与 [`docs/`](./docs/)（按 `01`–`12` 顺序）。
2. **在 `bytedance-implementation/` 下进行所有代码与验证工作**；不要在工作区根层落业务源码。
3. 按 [`docs/05-dev.md`](./docs/05-dev.md) 维护目标目录：`apps/web`、`apps/api`、`services/orchestrator`、`services/agents`、`services/skills`、`services/sandbox`、`libs/types`、`external/git-provider`、`docs/reports`。
4. 以 [`docs/03-spec.md`](./docs/03-spec.md) 为验收规格，以 [`docs/11-acceptance.yaml`](./docs/11-acceptance.yaml) 和 [`docs/12-traceability.yaml`](./docs/12-traceability.yaml) 作为测试与证据追踪清单。
5. P0 演示主线固定为 [`docs/06-plan.md`](./docs/06-plan.md) 中的“文章列表加阅读量字段”。

## 实现阶段指令

以下阶段均在 [`bytedance-implementation/`](./bytedance-implementation/) 执行（Agent 代码工作的唯一落点）。

| 阶段 | 目标 | 必做项 | 完成证据 |
|------|------|--------|----------|
| M2 工程骨架 | 三端和 Conduit 接入可启动 | 创建 `apps/web`、`apps/api`、`services/orchestrator`、`services/sandbox`；配置 `.env.example`；接入 Conduit fork / clone | 三端启动命令可运行；`sandbox-repo` 来源可证明；`.env.example` 只有占位变量 |
| M3 P0 链路 | PM 输入到真实 diff | 实现 Requirement / Planning / Coding Agent；实现 `article-list-display-field` Skill；写入 Conduit 真实路径 | `docs/reports/runs/<run-id>/requirement.md`、`plan.md`、`diff.patch` |
| M4 验证与 PR | lint / 单测和 PR 草稿闭环 | Verification Agent 运行真实脚本；缺测试显式记录；PR Agent 生成 PR 材料 | `verification.json`、`ai-calls.jsonl`、`pr-draft.md` |
| M5 演示体验 | 人工确认留痕与失败路径 | 前端展示阶段进度、事件、diff、验证、PR 草稿；失败后可 `retry` 新 run | UI 可完成一条 L1 演示；失败时有阶段、错误、日志和 retry 入口 |
| M6 提交材料 | 完成 §8.2 材料 | 汇总 README、架构说明、AI 使用说明、工程难点、Demo / 视频素材 | `docs/reports/submission/checklist.md`、`demo-script.md`、`architecture.md`、`ai-usage.md`、`engineering-notes.md` |

## P0 完成判定

分两层，**不要混称**：

### 代码级 P0（实现仓胶水链路）

- [x] 实现仓库存在真实 `apps/web`、`apps/api`、`services/orchestrator`，且三端可启动。
- [x] `sandbox-repo` 基于 `TonyMckes/conduit-realworld-example-app` fork / clone 或裁剪子集。
- [x] 至少一条 L1 需求（§9.1：**文章列表阅读量，前端假数据、不改后端**）推进到 PR 草稿。
- [x] `diff.patch` 含 Conduit 真实路径；`verification.json` 含 lint/单测或显式缺口。
- [x] `pr-draft.md`、`ai-calls.jsonl`（rules 模式可 tokens=0）齐备；无真实密钥入库。

### 课题完成（§2.1 + §2.2 六项 + §8.2，6.10 截止）

**§2.2 代码与 run 证据**（实现仓已齐；答辩须 S7 录屏演示）：

- [x] **§2.2 #1 抽象到位**：4 Skill；第 3/4 个仅新增 Skill 文件
- [x] **§2.2 #2 断点重放**：`resume-from-stage` + checkpoints + Web 入口
- [x] **§2.2 #3 跨栈一致性**：L2 run `05-52-12` + `crossStackSync`
- [x] **§2.2 #4 可观测性**：验收 run `05-58-01` 非零 tokens + 跨 run AI Usage 面板
- [x] **§2.2 #5 业务上下文反哺**：`history_references` 入 plan（run `05-51-56`）
- [x] **§2.2 #6 澄清深度**：模糊输入 + `clarifications[]`（run `05-58-01`）

**§8.2 对外交付**（仍待人工）：

- [ ] 公开 AI 系统主仓（`bytedance-implementation/`），且仓内包含 `sandbox-repo/`
- [ ] Demo URL、演示视频、团队姓名（见 `submission/team-info.md`）

### 提交 / PR 口径

- **课题提交不是向上游 Conduit 仓库直接提交代码**。最终对外提交的是 AI 系统主仓，也就是 `bytedance-implementation/` 的公开 GitHub/GitLab 仓库。
- `sandbox-repo/` 是 AI 系统写入和验证 Conduit 改动的真实目标代码目录，须随 AI 主仓一并公开，供评审查看 diff 来源。
- `pr-draft.md` 是代码级 P0 的必需证据；真实 GitHub draft PR / 上游 Conduit PR 是可选远端能力，只有在配置 GitHub 凭据、fork/分支权限和显式确认后才执行。

## 源题 PDF §7.1 忽略

阅读 [`实现一个可以端到端交付全栈项目的“超级个体”.pdf`](./实现一个可以端到端交付全栈项目的“超级个体”.pdf) 或 [Markdown 版](./实现一个可以端到端交付全栈项目的“超级个体”.md) 时，**整节忽略 §7.1（官方资源池）**：含 TRAE / 火山方舟配置说明、示例 EP / API key、curl 示例、调用配额与封禁规则、IDE 推荐等。上述内容不构成本仓库或实现仓库的设计、验收或实现义务。

仍有效的相关约定：§7.2（AI 使用额外要求）；§2.1 模型资源义务仍在，**忽略的是 §7.1 凭据发放方式**。详细说明见 [`docs/01-understanding.md`](./docs/01-understanding.md#源题-pdf-适用范围)。

## 模型策略

**两类「用 AI」不要混用**，完整口径见 [`docs/01-understanding.md#模型策略产品运行时--b`](./docs/01-understanding.md#模型策略产品运行时--b)：

- **开发协作**：维护本仓库 `docs/` 时，团队约定 **不用豆包改文档**。
- **代码级 P0**：`AI_MODE=rules` 可跑固定 L1 胶水链路（`npm run run:p0`）。
- **提交 / 答辩**：clarify **至少一次真实 LLM**（豆包或其它 API），在实现仓 `ai-usage.md` 声明；**不强制豆包**（团队已决策 P1-5 跳过，以 `mimo-v2.5` 模糊验收 run 举证 §2.2 #6）。
- 核心链路（Conduit 写入、lint / 单测、PR 草稿）不得 mock；`ai-calls.jsonl` 须如实留痕。

## 凭据安全要求

源题 PDF §7.1 中的官方模型资源示例属于忽略范围，且不得转写进派生材料。agent 不得把任何真实 EP、API key 或 Bearer token 写入 README、实现仓库源码、`.env.example`、测试快照、运行报告、PR 描述或提交材料。实现仓库只能通过本地环境变量或部署密钥使用真实凭据。

## 唯一事实源

| 问题 | 唯一事实源 |
|------|------------|
| 仓库结构与各文件作用 | [`仓库导航.md`](./仓库导航.md) |
| 源题是什么 | [PDF](./实现一个可以端到端交付全栈项目的“超级个体”.pdf) / [MD](./实现一个可以端到端交付全栈项目的“超级个体”.md)（§7.1 凭据已脱敏） |
| 如何理解题目 | [`docs/01-understanding.md`](./docs/01-understanding.md) |
| 产品要做什么 | [`docs/02-prd.md`](./docs/02-prd.md) |
| 系统必须满足什么规格 | [`docs/03-spec.md`](./docs/03-spec.md) |
| 界面长什么样 | [`docs/04-design.md`](./docs/04-design.md) |
| 如何实现 | [`docs/05-dev.md`](./docs/05-dev.md) |
| 何时做 | [`docs/06-plan.md`](./docs/06-plan.md)（含 [冲刺关键路径](./docs/06-plan.md#冲刺关键路径进度-ssot)） |
| 架构怎么分层 | [`docs/07-architecture-overview.md`](./docs/07-architecture-overview.md) |
| 为什么采用当前架构 | [`docs/08-adr-0001-…`](./docs/08-adr-0001-super-individual-agentic-delivery.md) |
| 为什么文档仓库与实现仓库分离 | [`docs/09-adr-0002-…`](./docs/09-adr-0002-evidence-first-docs-only-repository.md) |
| 实现进度 | [`docs/10-progress.md`](./docs/10-progress.md) + [`当前进度汇报.md`](./当前进度汇报.md)（摘要） |
| 冲刺任务清单 | [`docs/06-plan.md#冲刺关键路径`](./docs/06-plan.md#冲刺关键路径进度-ssot) |
| 如何验收 | [`docs/11-acceptance.yaml`](./docs/11-acceptance.yaml) |
| 如何追踪需求到证据 | [`docs/12-traceability.yaml`](./docs/12-traceability.yaml) |

## 任务路由

| 用户任务 | 修改位置 | 不做什么 |
|----------|----------|----------|
| 实现、调试、测试、运行 P0、生成证据 | **`bytedance-implementation/`** | 不在本仓库根目录写业务源码 |
| 调整范围或评分理解 | `docs/01-understanding.md` / `docs/02-prd.md` | 不改技术方案 |
| 调整系统能力、接口、证据、验收门槛 | `docs/03-spec.md` | 不重复写到 README |
| 调整页面和演示体验 | `docs/04-design.md` | 不在本仓库写实现代码 |
| 调整实现路径、技术栈、安全配置 | `docs/05-dev.md` | 不写真实密钥 |
| 调整计划与冲刺任务 | `docs/06-plan.md`（含冲刺关键路径） | 不放接口和数据模型 |
| 调整架构决策 | `docs/07`–`09` | 不创建平台化方案 |
| 调整验收和追踪 | `docs/11-acceptance.yaml` / `docs/12-traceability.yaml` | 保持 YAML 可解析 |
| 调整仓库结构说明 | [`仓库导航.md`](./仓库导航.md) | 不重复抄 spec 全文 |

## 仓库边界

| 目录 | 内容 |
|------|------|
| 根层（`bytedance/`） | 设计基线、[`docs/`](./docs/)、[`仓库导航.md`](./仓库导航.md)、源题 PDF / [MD 版](./实现一个可以端到端交付全栈项目的“超级个体”.md) |
| [`bytedance-implementation/`](./bytedance-implementation/) | 前端、后端、编排、Skill、sandbox-repo、`docs/reports/`、提交材料；**Agent 代码工作的唯一目录** |

除源题 PDF 原文外，工作区根层不包含业务源码、Conduit fork、运行报告、PR 证据、Demo、视频、**临时 CSV 执行台账**或 Agent Spec 目录。实现相关内容只放在 `bytedance-implementation/`；冲刺任务只维护 [`docs/06-plan.md#冲刺关键路径`](./docs/06-plan.md#冲刺关键路径进度-ssot) 与 [`docs/10-progress.md`](./docs/10-progress.md)。

## 修改检查

1. 本地 Markdown 链接可解析。
2. YAML 文件可解析。
3. 除源题 PDF 原文外，没有真实 API key、EP 或 Bearer token。
4. 不留下临时 CSV、规划文档或执行台账。
