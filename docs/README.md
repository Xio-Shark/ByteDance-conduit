# 设计基线文档 v1.0.0

本目录是课题 **唯一事实源**，按端到端交付流程顺序阅读。根目录 [`README.md`](../README.md) 说明仓库边界与实现仓入口。

## 阅读顺序

| 序号 | 文档 | 回答的问题 |
|------|------|------------|
| 01 | [`01-understanding.md`](./01-understanding.md) | 题目是什么、P0 成功标准 |
| 02 | [`02-prd.md`](./02-prd.md) | 做什么、为什么、评分维度 |
| 03 | [`03-spec.md`](./03-spec.md) | 系统规格、证据、验收门槛 |
| 04 | [`04-design.md`](./04-design.md) | 界面与交互 |
| 05 | [`05-dev.md`](./05-dev.md) | 实现目录、API、配置（指导 `bytedance-implementation/`） |
| 06 | [`06-plan.md`](./06-plan.md) | 里程碑、P0 演示题、**冲刺关键路径（执行清单 SSOT）** |
| 07 | [`07-architecture-overview.md`](./07-architecture-overview.md) | 架构分层与主流程 |
| 08 | [`08-adr-0001-super-individual-agentic-delivery.md`](./08-adr-0001-super-individual-agentic-delivery.md) | 为何采用 Agentic 交付架构 |
| 09 | [`09-adr-0002-evidence-first-docs-only-repository.md`](./09-adr-0002-evidence-first-docs-only-repository.md) | 为何文档仓与实现仓分离 |
| 10 | [`10-progress.md`](./10-progress.md) | 实现进度快照（对照实现仓；与 `06-plan` 清单配合） |
| 11 | [`11-acceptance.yaml`](./11-acceptance.yaml) | 验收项（§2.2 六项为 P0） |
| 12 | [`12-traceability.yaml`](./12-traceability.yaml) | 需求 → 文档锚点追踪 |

## 维护规则

- 修改范围、规格、计划或验收时，只改本目录对应文件。
- **冲刺任务与优先级**只维护 [`06-plan.md#冲刺关键路径`](./06-plan.md#冲刺关键路径进度-ssot)；根目录 [`当前进度汇报.md`](../当前进度汇报.md) 为可读摘要，变更须同步 [`10-progress.md`](./10-progress.md)。
- 真实源码、Conduit sandbox、run 证据在 [`bytedance-implementation/`](../bytedance-implementation/)。
- 不再维护根目录 `设计文档/`、`源码文档/` 副本。
