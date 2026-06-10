# 团队与交付链接（S6）

§8.2 基础信息与交付链接。团队名称与成员名单已由团队确认；公开 AI 系统主仓已发布，对外 Demo / 视频链接仍须答辩前补齐。

---

## 基础信息

| 字段 | 内容 |
|------|------|
| 项目名称 | Conduit 超级个体端到端交付系统 |
| 课题名称 | 实现一个可以端到端交付全栈项目的「超级个体」 |
| 版本 | v1.0.0 |
| 团队名称 | 关注塔菲喵 |
| 成员名单 | 滕彦翕（【学校】，【专业】）；李泽士（【学校】，【专业】）；王伯瀚（【学校】，【专业】） |
| 导师 / 联系方式 | 未提供 |

**注**：成员学校/专业信息请在提交前补齐（将【学校】【专业】替换为真实信息）。

---

## 分工说明（按真实参赛形态填写）

> 不预设团队人数。单人参赛时保留一行并写「单人完成」；团队参赛时按真实成员增删行。不得为了匹配模块数量虚构 6 个角色。

| 成员 | 实际职责 | 对应仓库 / 证据 |
|------|----------|-----------------|
| 滕彦翕 | **【待补充具体分工】**例：Orchestrator + Agent 编排、Skill 抽象设计、submission 材料整理 | `services/orchestrator/`、`services/agents/`、`docs/reports/submission/` |
| 李泽士 | **【待补充具体分工】**例：前端 Console 开发、AI Usage 面板、跨 run 汇总 | `apps/web/`、`AiUsagePanel.jsx`、`CrossRunAiUsagePanel.jsx` |
| 王伯瀚 | **【待补充具体分工】**例：后端 API 路由、sandbox 封装、验证与测试 | `apps/api/`、`services/sandbox/`、测试文件 |

**注**：上述分工为示例，请根据真实情况修改。可参考模块边界：Orchestrator / Agent / Skill / Web / API / 测试 / submission。

---

## 对外链接（答辩前填写）

| 材料 | 链接 | 状态 |
|------|------|------|
| 在线 Demo | http://49.232.191.243 | ✅ 已部署（访问 Web 控制台） |
| 演示视频（3–8 分钟） | **【待补充视频链接】** | 录制脚本见 [`demo-script.md`](./demo-script.md) 和 [`video-recording-guide.md`](./video-recording-guide.md) |
| **AI 系统主仓（公开）** | <https://github.com/Xio-Shark/ByteDance-conduit> | ✅ 准备发布；公开仓以 `bytedance-implementation/` 为根目录，且 `sandbox-repo/` 已作为普通源码目录纳入 |
| 设计基线文档仓（可选引用） | 本仓 `docs/01`–`13` | 可选；非 §8.2 替代项 |
| 本地 PR 草稿证据 | `docs/reports/runs/run-2026-05-21T02-16-15-215Z/pr-draft.md` | ✅ 已生成 |
| 真实 draft PR URL（H17，可选） | _（暂缓；用户不要求远端 PR）_ | 上游 Conduit PR 非 §8.2 必填；本地草稿即可 |

---

## 功能说明（答辩叙述，5–8 句）

1. PM 在 Web 控制台输入自然语言需求，系统创建 DeliveryRun 并经过 clarify → plan → edit → verify → pr 全链路。
2. **L1 主线**：文章列表阅读量（前端假数据）；**L2 / 优秀档**：schema-driven 封面图、评论点赞、历史方案复用和多轮澄清。
3. Skill / Agent / Orchestrator 分层；当前 9 个 Skill（6 个主线 Skill + 3 个 U6 演练 Skill），`articleCoverImage.js` ≤30 行、`commentLikeCount.js` ≤50 行，新模式不改主干。
4. 支持 `resume-from-stage` 从指定阶段重放下游，上游 plan / requirement 保留。
5. 历史相似 run 召回写入 `plan.history_references`，非仅 UI 展示。
6. 所有阶段证据归档于 `docs/reports/runs/<run-id>/`；AI 调用写入 `ai-calls.jsonl`。
7. Conduit 真实路径 diff + lint adapter + Vitest；PR 草稿含验证摘要，不要求已向上游 Conduit 提交 PR。
8. 提交材料汇总于 `docs/reports/submission/`（本目录）。

---

## 项目亮点 / 创新点（≤3 条）

| 亮点 | 对应 §2.2 | 说明 | 证据 |
|------|-----------|------|------|
| 注册式 Skill 抽象 | #1 抽象到位 | 6 个主线 Skill 覆盖 L1/L2/非列表/跨栈模式，3 个 U6 演练 Skill 证明限时新增模式；U1 schema-driven Skill 只声明 schemaChange，U5 评论点赞 Skill 脱离文章列表域；新增模式不改 Orchestrator / Agent 主干 | `services/skills/src/`、`run-l2-auto-cover-image`、`run-l2-comment-like`、`u6-rehearsal-manifest.json` |
| 可重放、可观测的交付流水线 | #2 断点重放；#4 可观测性 | `resume-from-stage` 可从指定阶段重放下游；AI 调用写入 `ai-calls.jsonl`，Web 面板展示单 run 与跨 run usage，U3 证明 plan 阶段真实 LLM 调用 | `checkpoints.json`、`run-plan-llm-driven`、`CrossRunAiUsagePanel` |
| 跨栈一致性 + 上下文反哺 + 多轮澄清 | #3/#5/#6 | schemaDriver 自动推断 backend/frontend 目标；历史 run 支持 token/bigram 重叠的历史方案复用并写入 plan（非语义 embedding）；模糊需求先追问，PM 回答后 refine 再进入后续阶段 | `run-l2-auto-cover-image`、`run-semantic-recall-demo`、`run-l3-multi-turn-clarify` |

---

## 关联材料

- [`checklist.md`](./checklist.md)
- [`defense-prep.md`](./defense-prep.md)
- [`public-repo-guide.md`](./public-repo-guide.md)
