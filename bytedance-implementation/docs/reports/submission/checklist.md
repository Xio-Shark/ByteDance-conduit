# Submission Checklist

对齐文档仓 [`docs/06-plan#冲刺关键路径`](../../../../docs/06-plan.md#冲刺关键路径进度-ssot) 与 [`docs/11-acceptance.yaml`](../../../../docs/11-acceptance.yaml)。

## 基础信息

- 项目名称 / 课题：实现一个可以端到端交付全栈项目的“超级个体”
- 团队名称与成员名单：见 [`team-info.md`](./team-info.md)（_姓名待填_）
- 分工说明：见 [`team-info.md`](./team-info.md)

## 证据库卫生（演示前置）

- [x] **H1**：坏归档影响已隔离为 `degraded` / `skipped`，不伪装全量召回；旧失败归档仍可保留为失败证据
- [x] **H2**：`history-recall` 脱离 `invalid_history`（或 spec 对齐命名）

## §2.2 代码/run 证据（S7 视频待录）

- [x] **#1 抽象到位**（H10–H12）：≥2 Skill；第 3 模式仅新增 1 个 Skill 文件（不改主干）
- [x] **#2 断点重放**（H5–H7）：`resume-from-stage`；plan 后改输入，只重跑 edit→verify→pr
- [x] **#3 跨栈一致性**（H10–H11）：≥1 条 L2 run；plan 影响矩阵 + 跨栈 diff
- [x] **#4 可观测性**（H4,H13）：§2.2 验收口径 LLM run 的非零 tokens/延迟/成本 + Web 面板
- [x] **#5 业务上下文反哺**（H8–H9）：相似 run 召回 **写入 plan**（非仅 UI）
- [x] **#6 澄清深度**（H4）：**故意模糊**输入 + 真实 LLM 主动追问（清晰 L1 原句 run **不计入**）

> 上述勾选只代表代码 / run 证据已归档；最终评判仍需 S7 演示视频逐项展示六项。

## §7.2 AI 留痕（提交前）

- [x] **S1**：`prompt-changelog.md`（Prompt/Skill 版本与变更意图）
- [x] **S2**：README + `ai-usage.md` 模型清单表（含 **豆包决策**：不强制、P1-5 跳过）
- [x] **S3**：`ai-usage.md` 合规段
- [x] **S4**：`tools-manifest.md`（开发期 Agent/IDE 与配置版本，建议项）
- [x] **S5**：关键对话材料（`clarify-conversation-export.md`）

## 功能说明（答辩叙述）

见 [`team-info.md`](./team-info.md) 与 [`defense-prep.md`](./defense-prep.md)。

## 交付材料（§8.2）

- 在线 Demo 链接：[`team-info.md`](./team-info.md) _（待填 URL）_
- 演示视频链接：[`team-info.md`](./team-info.md) _（待填；脚本 [`video-recording-guide.md`](./video-recording-guide.md)）_
- **源代码仓库**：[`public-repo-guide.md`](./public-repo-guide.md) _（待填公开 AI 系统主仓 URL；仓内包含 `sandbox-repo/`）_
- README / 运行说明：[`README.md`](../../../README.md)

## 技术说明

- 系统架构说明：[`architecture.md`](./architecture.md)
- AI 使用说明：[`ai-usage.md`](./ai-usage.md)
- 工程难点：[`engineering-notes.md`](./engineering-notes.md)

## 工程验证

- [x] **H14**：`npm run verify` 全绿（108 项 Node/API/Web/scripts 测试；107 pass / 1 skip）；只证明本地代码门禁，不勾选 §8.2 对外交付
- [x] submission readiness API 会把待填团队信息、Demo/视频/公开仓占位和未勾选最终提交项标为 `pending_human`
- [x] `npm run archive:dry-run` 通过：候选发布包可枚举关键源码、submission 材料、`sandbox-repo/`、脚本测试与 7 条 §2.2 关键 run（347 files，并输出 manifest/content hash）；排除 `.env`、`node_modules`、Web build 产物和测试结果目录
- [ ] `scripts/pre-submission-check.sh` 通过（当前会先运行 archive dry-run，再聚合报告 4 类外部门禁阻塞：公开发布清单路径未全部被 Git 跟踪、关键源码 / run / submission / sandbox 发布路径仍未准备成 tracked public repository、§8.2 人工占位、最终外部提交未完成；readiness 失败后不会继续跑 `npm run verify`；即使发布日脚本通过，也仍需人工验证公开 URL、Demo、视频、团队信息和远端 fresh clone）
- [x] **H15–H16**：对照 `docs/11` / `docs/12` 勾选（24/28 AC verified；AC-F006-02、AC-F011-01 partial；AC-F011-02/03 manual_pending）
- [ ] **S9**：公开发布当天最终安全检查通过（当前仅已生成 [`security-check-report.md`](./security-check-report.md)，仍需重跑脚本与远端扫描）
- [x] **X1**：`sandbox-repo` audit 决策（[`dependency-audit-decision.md`](./dependency-audit-decision.md)）

## 答辩准备（S10）

- [x] 材料包索引：[`defense-prep.md`](./defense-prep.md)
- [ ] 6.10 前对外提交：团队链接 + 视频 + 公开 AI 系统主仓（人工）

## 结果说明（≤3 条亮点，映射 §2.2）

见 [`team-info.md`](./team-info.md)。
