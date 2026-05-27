# 团队与交付链接（S6）

§8.2 基础信息模板。带 `_（待填）_` 的字段须答辩前由团队人工确认；其余为可从仓库与 run 证据自动归纳的内容。

---

## 基础信息

| 字段 | 内容 |
|------|------|
| 项目名称 | Conduit 超级个体端到端交付系统 |
| 课题名称 | 实现一个可以端到端交付全栈项目的「超级个体」 |
| 版本 | v1.0.0 |
| 团队名称 | _（待填）_ |
| 成员名单 | _（待填：姓名 / 角色）_ |
| 导师 / 联系方式 | _（待填）_ |

---

## 分工说明（建议映射实际模块）

| 成员 | 职责 | 对应仓库 / 证据 |
|------|------|-----------------|
| _（待填）_ | Orchestrator、断点重放、证据归档 | `services/orchestrator/`；`run-*` checkpoints |
| _（待填）_ | Agent 层（clarify / plan / verify / PR） | `services/agents/`；`clarify-conversation-export.md` |
| _（待填）_ | Skill 注册与 Conduit 写入 | `services/skills/`、`sandbox-repo/` |
| _（待填）_ | Web 控制台与 AI Usage 面板 | `apps/web/` |
| _（待填）_ | API、submission、文档与答辩材料 | `apps/api/`、`docs/reports/submission/` |
| _（待填）_ | 设计基线与验收追踪 | 文档仓 `docs/01`–`12` |

---

## 对外链接（答辩前填写）

| 材料 | 链接 | 状态 |
|------|------|------|
| 在线 Demo | _（待填：如 Vercel / 内网穿透 URL）_ | 待部署 |
| 演示视频（3–8 分钟） | _（待填：B 站 / 飞书 / YouTube 等）_ | 待录制（脚本见 [`video-recording-guide.md`](./video-recording-guide.md)） |
| **AI 系统主仓（公开）** | _（待填：GitHub/GitLab URL）_ | 待发布；应公开 `bytedance-implementation/` 且包含 `sandbox-repo/`（结构见 [`public-repo-guide.md`](./public-repo-guide.md)） |
| 设计基线文档仓（可选引用） | _（待填；非 §8.2 替代项）_ | 可选 |
| 本地 PR 草稿证据 | `docs/reports/runs/run-2026-05-21T02-16-15-215Z/pr-draft.md` | ✅ 已生成 |
| 真实 draft PR URL（H17，可选） | _（暂缓；用户不要求远端 PR）_ | 上游 Conduit PR 非 §8.2 必填；本地草稿即可 |

---

## 功能说明（答辩叙述，5–8 句）

1. PM 在 Web 控制台输入自然语言需求，系统创建 DeliveryRun 并经过 clarify → plan → edit → verify → pr 全链路。
2. **L1 主线**：文章列表阅读量（前端假数据）；**L2**：草稿状态跨栈；**模糊澄清**：LLM 主动追问（`run-2026-05-21T05-58-01-181Z`）。
3. Skill / Agent / Orchestrator 分层；第 3 需求模式仅新增 `articleDetailWordCount.js`，不改主干。
4. 支持 `resume-from-stage` 从指定阶段重放下游，上游 plan / requirement 保留。
5. 历史相似 run 召回写入 `plan.history_references`，非仅 UI 展示。
6. 所有阶段证据归档于 `docs/reports/runs/<run-id>/`；AI 调用写入 `ai-calls.jsonl`。
7. Conduit 真实路径 diff + lint adapter + Vitest；PR 草稿含验证摘要，不要求已向上游 Conduit 提交 PR。
8. 提交材料汇总于 `docs/reports/submission/`（本目录）。

---

## 结果亮点（≤3 条，映射 §2.2）

1. **抽象到位（#1）**：4 个 Skill；第 3/4 模式只新增 Skill 文件，Orchestrator/Agent 主干不变。
2. **断点重放（#2）**：`POST /api/runs/:id/resume-from-stage` + checkpoints；plan 后只重跑 edit→verify→pr。
3. **跨栈 + 澄清 + 上下文（#3/#5/#6）**：L2 草稿 run；模糊 LLM 追问；history-recall 入 plan。（视频还须展示 #4 可观测面板）

---

## 关联材料

- [`checklist.md`](./checklist.md)
- [`defense-prep.md`](./defense-prep.md)
- [`public-repo-guide.md`](./public-repo-guide.md)
