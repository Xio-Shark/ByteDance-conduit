# 架构总览：Conduit 超级个体端到端交付系统

## 核心定义

本系统把一个 PM 需求转化为 Conduit 仓库中的可审阅代码变更。它不是单个 Agent，也不是聊天外壳，而是由前端控制台、Node API、AI 编排、Skill 注册、Conduit sandbox、验证命令和 PR 证据组成的交付闭环。

## 架构目标

- 让 PM 需求先被澄清，再进入方案与编码。
- 让系统在写代码前说明目标文件、影响范围和验证命令。
- 让代码写入真实 Conduit fork 或 sandbox-repo。
- 让 lint / 单测结果成为交付结论的依据。
- 让新增需求模式优先通过 Skill 注册扩展。

[03-spec.md](./03-spec.md) 是本架构的可执行规格锚点；实现仓库应以其中的状态机、Agent、Skill、API、证据和安全配置规格作为开发边界。

## 系统分层

```text
┌─────────────────────────────────────────────┐
│ Frontend Console                            │
│ 需求输入 / 阶段进度 / 方案确认 / diff / PR   │
└───────────────────┬─────────────────────────┘
                    │ HTTP / SSE
┌───────────────────▼─────────────────────────┐
│ Backend API                                  │
│ Run 创建 / 状态查询 / 人工确认 / 事件输出     │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│ Orchestrator                                │
│ clarify → plan → edit → verify → pr         │
└──────┬────────────┬────────────┬─────────────┘
       │            │            │
┌──────▼───┐  ┌─────▼─────┐  ┌───▼────────────┐
│ Agents   │  │ Skills    │  │ Evidence Store │
│ 澄清/规划 │  │ 需求模式  │  │ diff/log/report│
│ 编码/验证 │  │ 注册边界  │  │ PR 草稿        │
└──────┬───┘  └─────┬─────┘  └───┬────────────┘
       │            │            │
┌──────▼────────────▼────────────▼────────────┐
│ Conduit Sandbox Adapter                     │
│ read_files / apply_patch / git_diff / test  │
└─────────────────────────────────────────────┘
```

P1 起，Evidence Store 可扩展为观测与提交材料中心，额外沉淀 AI 调用日志、token / 延迟 / 成本、Demo 素材、架构说明和 AI 使用说明。

## 主流程

```text
PM 输入 L1 需求
  → Requirement Agent 生成澄清问题与需求卡片
  → Planning Agent 定位 Conduit 模块和目标文件
  → Coding Agent 基于 Skill 生成并应用 patch
  → Verification Agent 运行 lint / 单测并收集日志
  → PR Agent 生成分支名、标题、描述和风险说明
```

## 关键模块职责

| 模块 | 职责 | 不做什么 | 当前实现真实状态 |
|------|------|----------|----------------|
| Frontend Console | 展示流程、证据、人工确认入口 | 不直接读写本地仓库 | 已闭环：阶段进度、事件、diff、验证、PR 草稿、AI Usage 面板 |
| Backend API | 暴露 run、confirm、retry、events、diff、pr-draft、resume、submission 接口 | 不包含具体需求模式逻辑 | 已闭环：run 创建/查询/confirm/retry/continue/resume/归档恢复/PR submission/submission readiness |
| Orchestrator | 管理阶段、状态、事件、checkpoint 和失败 | 不写死具体 PM 文案 | clarify→plan→edit→verify→pr 已拆分；支持 checkpoints、人工阻塞 confirm 和 resume-from-stage |
| Requirement Agent | 根据输入推理澄清问题、输出需求卡片 | 在信息不足时直接写代码 | **rules**：已注册演示模式；**llm**：`clarifyWithLlm()` 已验收，模糊 run 含 `clarifications[]` |
| Planning Agent | 读仓库索引、选 Skill、输出方案与影响范围 | 编造不存在路径或命令 | 读取 sandbox 索引、history recall 和 Skill；L2 可输出影响矩阵；缺真实目标文件 fail-fast |
| Coding Agent | 基于方案与 Skill 生成 patch | 写入非授权路径 | 一行 passthrough：`skill.apply(sandbox)`；全部逻辑在 Skill 内 |
| Verification Agent | 执行 lint/单测并收集结果 | 吞掉失败或伪造成功 | 已闭环：真实执行 Conduit 命令 + 实现仓 lint adapter |
| PR Agent | 生成 PR 标题/描述/风险 | 隐瞒失败验证 | 已闭环：模板拼接 PR 文案 |
| Skill Registry | 注册需求模式、匹配 Skill | 不替代主流程状态机 | 4 个 Skill；低置信度或并列匹配 fail-fast，不静默选第一个 |
| Sandbox Adapter | 对真实 Conduit 仓库读、写、diff、执行命令 | 不使用 mock 仓库伪造结果 | 已闭环：read/write/diff/命令执行 |

## Spec 映射

| Spec 区域 | 架构承接 |
|-----------|----------|
| 状态机规格 | Orchestrator 管理阶段推进、失败和重跑 |
| 需求卡片规格 | Requirement Agent 输出可确认需求卡片 |
| Skill 规格 | Skill Registry 注册 L1 / L2 / L3 需求模式 |
| Agent 规格 | Agents 分离澄清、规划、编码、验证、PR 职责 |
| API 规格 | Backend API 暴露 run、confirm、retry、events、diff、pr-draft |
| 证据规格 | Evidence Store 按 run 和 submission 归档 |
| 验证规格 | Sandbox Adapter 执行真实 lint / test 并记录退出码 |
| 配置与安全规格 | 外部模型和 GitHub 权限只通过环境变量或部署密钥接入 |

## 人工检查点

| 检查点 | 触发时机 | 人类动作 |
|--------|----------|----------|
| 需求确认 | 澄清后 | 确认目标、范围、非目标、验收标准 |
| 方案确认 | 代码生成前 | 确认目标文件、影响范围、风险和验证命令 |
| PR 前确认 | 验证完成后 | 确认 PR 描述、风险和是否推送远程 |

## 证据链

P0 必须产出以下证据：

| 证据 | 示例路径 |
|------|----------|
| 需求卡片 | `docs/reports/runs/<run-id>/requirement.md` |
| 方案与模块定位 | `docs/reports/runs/<run-id>/plan.md` |
| git diff | `docs/reports/runs/<run-id>/diff.patch` |
| lint / test 日志 | `docs/reports/runs/<run-id>/verification.json` |
| AI 调用留痕 | `docs/reports/runs/<run-id>/ai-calls.jsonl` |
| PR 草稿 | `docs/reports/runs/<run-id>/pr-draft.md` |
| 提交材料清单 | `docs/reports/submission/checklist.md` |

## 评分锚点映射（§2.2 全部必达）

| 亮点 | 架构承接 | 当前 |
|------|----------|------|
| 抽象到位 #1 | Skill Registry；第 3/4 模式仅增 Skill 文件 | 4 Skill 已接入；S7 录屏待人工 |
| 断点重放 #2 | 阶段事件 + `resume-from-stage` | API / checkpoint / Web 入口已实现；S7 录屏待人工 |
| 跨栈一致性 #3 | L2 Planning 影响矩阵 + 跨栈 diff | L2 run `05-52-12` 已归档；为 Skill 驱动跨路径同步 |
| 可观测性 #4 | `ai-calls.jsonl` + Web 监控面板 | LLM 非零 metrics run `05-58-01` + 面板已就绪；S7 录屏待人工 |
| 业务上下文反哺 #5 | history-recall → plan 引用 | run `05-51-56` 已验证 plan 引用历史召回 |
| 澄清深度 #6 | 真实 LLM + **模糊**输入追问 | run `05-58-01` 已验证 `clarifications[]` |

闭合任务见 [06-plan 冲刺关键路径](./06-plan.md#冲刺关键路径进度-ssot)。

## 架构结论

v1.0.0 架构已证明 §2.1 MVP，并已有 §2.2 六项代码 / run 证据（见 [03-spec §2.2](./03-spec.md#22-评判亮点规格)）。最终课题完成仍取决于 §8.2 对外交付和 S7 答辩录屏。
