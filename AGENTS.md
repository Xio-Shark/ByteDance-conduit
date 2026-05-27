# AGENTS 入口

先读 [`README.md`](./README.md)（含**怎么阅读文档**、阅读顺序、每份文档作用），再读 [`仓库导航.md`](./仓库导航.md)（逻辑分工与文件索引），然后按本文件执行。

## 逻辑分工

当前本地 checkout 是单 Git 工作区；`bytedance-implementation/` 是实现子树，不是独立 `.git` 仓。以下“文档仓 / 实现仓”指职责边界。

| 区域 | 路径 | Agent 可做什么 | 不可做什么 |
|------|------|----------------|------------|
| **根层设计基线** | `/Users/xioshark/Desktop/bytedance` | 维护设计基线：`README.md`、`AGENTS.md`、`docs/01`–`12` | 新建/修改 `apps/`、`services/`、`sandbox-repo/`、run 证据、Demo |
| **实现子树** | [`bytedance-implementation/`](./bytedance-implementation/) | **全部代码工作**：实现、调试、测试、`npm run verify` / `run:p0`、Conduit 改动、run 与 submission 证据 | 写入真实 API key；在工作区外另建实现副本 |

进行任何代码相关操作前，工作目录应为实现子树，或使用该目录下的绝对路径。

## 阅读顺序（Agent 首次进场）

完整说明见 [`README.md#怎么阅读文档`](./README.md#怎么阅读文档)。Agent 最小路径：

1. 本文件 + [`README.md`](./README.md) + [`仓库导航.md`](./仓库导航.md)
2. [`docs/01-understanding.md`](./docs/01-understanding.md) — 题目边界、P0 标准
3. [`docs/03-spec.md`](./docs/03-spec.md) — **可执行规格**（写代码前必读）
4. [`docs/05-dev.md`](./docs/05-dev.md) — 实现仓目录、API、证据路径
5. [`docs/06-plan.md`](./docs/06-plan.md) — L1 演示主线 + **§2.2 六项必达** + **[冲刺关键路径](./docs/06-plan.md#冲刺关键路径进度-ssot)**（执行清单 SSOT）

按需补读：`02-prd`、`04-design`、`07`–`09` 架构、`11-acceptance.yaml`、`12-traceability.yaml`。索引见 [`docs/README.md`](./docs/README.md)。

| 序号 | 文档 | 作用 |
|------|------|------|
| 01 | understanding | 题目理解、范围、模型/PDF 约束 |
| 02 | prd | 产品需求与评分 |
| 03 | spec | 状态机、接口、证据、验收门槛 |
| 04 | design | 界面与交互 |
| 05 | dev | 实现方案（对照实现仓） |
| 06 | plan | 里程碑、P0 选题、**冲刺关键路径** |
| 07–09 | 架构 + ADR | 分层与架构决策 |
| 10 | progress | 实现进度快照 |
| 11–12 | acceptance / traceability | 验收与需求追踪 |

## 代码任务执行顺序

完成源题 PDF 相关实现时：

1. 在文档仓读完 **01 → 03 → 05 → 06**（必要时 11、12）。
2. 在 **`bytedance-implementation/`** 按 [`docs/05-dev.md`](./docs/05-dev.md) 维护目录与配置。
3. 以 [`docs/03-spec.md`](./docs/03-spec.md) 为行为边界；以 [`docs/11-acceptance.yaml`](./docs/11-acceptance.yaml)、[`docs/12-traceability.yaml`](./docs/12-traceability.yaml) 做验收与追踪。
4. 按 [`docs/06-plan.md#冲刺关键路径`](./docs/06-plan.md#冲刺关键路径进度-ssot) 推进 §2.2 与 §8.2；状态写入 `docs/10-progress.md`。
5. P0 演示需求见 **06-plan**；实现仓执行 `npm run run:p0`（脚本显式设置 `AI_MODE=rules`，不依赖隐式默认）。

## 文档任务：改哪里

| 任务类型 | 只改 |
|----------|------|
| 范围、题目理解 | `docs/01-understanding.md`、`docs/02-prd.md` |
| 规格、接口、证据、门槛 | `docs/03-spec.md` |
| 页面与演示体验 | `docs/04-design.md` |
| 实现路径、技术栈、配置 | `docs/05-dev.md` |
| 计划、冲刺任务与里程碑 | `docs/06-plan.md`（含 [冲刺关键路径](./docs/06-plan.md#冲刺关键路径进度-ssot)） |
| 架构决策 | `docs/07`–`09` |
| 进度说明 | `docs/10-progress.md`、根目录 [`当前进度汇报.md`](./当前进度汇报.md)（摘要，须与 10 同步） |
| 仓库结构导航 | [`仓库导航.md`](./仓库导航.md) |
| 验收 / 追踪 | `docs/11-acceptance.yaml`、`docs/12-traceability.yaml` |

同一事实只维护一处（DRY）；不要把规格重复抄进 `README.md`。

## 源题 PDF 与模型

阅读 [`实现一个可以端到端交付全栈项目的“超级个体”.pdf`](./实现一个可以端到端交付全栈项目的“超级个体”.pdf) 时：

- **整节忽略 §7.1**（官方资源池、示例密钥、curl、配额、IDE 推荐等），不得当作交付或实现义务。
- **§7.2** 及 PDF 其余章节仍有效；过程留痕、Skill、调用日志等见 spec 与 submission 材料。
- 禁止把 EP、API key、Bearer token 写入派生文档、源码、`.env.example`、测试快照或运行报告。

**两类「用 AI」不要混用**（完整说明见 [`docs/01-understanding.md#两类用-ai-不要混用`](./docs/01-understanding.md#两类用-ai-不要混用)）：

| 维度 | 是什么 | 豆包 | 其它 LLM |
|------|--------|------|----------|
| **开发协作** | 人工 / Cursor 等维护本仓库 `docs/`、或实现仓代码 | **不用豆包改文档**（团队约定） | 可用 |
| **产品运行时** | PM 在超级个体系统里提需求，clarify 等阶段 | 可选（PDF 参考名） | **可用**，须在实现仓 `ai-usage.md` 声明 |

- 产品 **clarify**：**代码级 P0** 可用 `AI_MODE=rules`；**课题完成** 须 **模糊输入 + 真实 LLM 主动追问** 的验收 run（清晰 L1 原句的 LLM run **不计入** §2.2 #6），在实现仓 `ai-usage.md` 声明。**不强制豆包**；P1-5 已团队决策跳过。
- 与 PDF **凭据/§7.1** 冲突时，以 [`docs/01-understanding.md`](./docs/01-understanding.md)、[`docs/03-spec.md`](./docs/03-spec.md) 为准；**不得**用派生文档降低 §7.2 留痕或 §8.2 提交要求。

## 执行规则

1. 先判断任务属于**文档设计**还是**实现仓代码**；代码类一律进 `bytedance-implementation/`。
2. 维护文档时遵循 KISS / YAGNI / DRY / SOLID；只改上表对应 `docs/` 文件。
3. 缺少关键输入时说明缺口，不静默补设定。
4. 不重新引入 Playbook、CSV 台账、模板目录、Agent Spec 或与本仓库无关的状态快照报告。
5. 修改 `docs/` 后检查：Markdown 链接可解析、YAML 可解析、无真实密钥泄露。
