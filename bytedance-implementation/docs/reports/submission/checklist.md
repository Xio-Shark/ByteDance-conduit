# Submission Checklist

对齐文档仓 [`docs/06-plan#冲刺关键路径`](../../../../docs/06-plan.md#冲刺关键路径进度-ssot) 与 [`docs/11-acceptance.yaml`](../../../../docs/11-acceptance.yaml)。

## 基础信息

- 项目名称 / 课题：实现一个可以端到端交付全栈项目的“超级个体”
- 团队名称与成员名单：待人工填写（S6）
- 分工说明：待人工填写（S6）

## 证据库卫生（演示前置）

- [x] **H1**：修复缺 `requirement.md` 的 3 条坏归档
- [x] **H2**：`history-recall` 脱离 `invalid_history`（或 spec 对齐命名）

## §2.2 评判亮点（全部必达）

- [x] **#1 抽象到位**（H10–H12）：≥2 Skill；第 3 模式仅新增 1 个 Skill 文件（不改主干）
- [x] **#2 断点重放**（H5–H7）：`resume-from-stage`；plan 后改输入，只重跑 edit→verify→pr
- [x] **#3 跨栈一致性**（H10–H11）：≥1 条 L2 run；plan 影响矩阵 + 跨栈 diff
- [x] **#4 可观测性**（H4,H13）：§2.2 验收口径 LLM run 的非零 tokens/延迟/成本 + Web 面板
- [x] **#5 业务上下文反哺**（H8–H9）：相似 run 召回 **写入 plan**（非仅 UI）
- [x] **#6 澄清深度**（H4）：**故意模糊**输入 + 真实 LLM 主动追问（清晰 L1 原句 run **不计入**）

## §7.2 AI 留痕（提交前）

- [x] **S1**：`prompt-changelog.md`（Prompt/Skill 版本与变更意图）
- [x] **S2**：README + `ai-usage.md` 模型清单表
- [x] **S3**：`ai-usage.md` 合规段
- [x] **S4**：`tools-manifest.md`（开发期 Agent/IDE 与配置版本，建议项）
- [x] **S5**：关键对话材料（模糊澄清 run 的多轮证据 → `clarify-conversation-export.md`）

## 功能说明（答辩叙述）

1. PM 在 Web 控制台输入需求（L1 主线 + L2 跨栈 + L3 模糊澄清各至少一次 run）。
2. Requirement Agent：rules 胶水 + **H4 模糊 LLM 追问**（§2.2 #6）。
3. Planning Agent：Skill 选择、文件定位、**H8 history-recall 入 plan**（§2.2 #5）、L2 影响矩阵（§2.2 #3）。
4. Coding Agent：写入 `sandbox-repo/`（L1 前端 + L2 跨栈路径）。
5. Verification Agent：lint / 单测或显式缺口。
6. PR Agent：PR 草稿；**H17** 可选真实 draft PR URL。
7. **H7** 演示断点重放；**H12** 演示第三 Skill 只加文件。

## 交付材料（§8.2）

- 在线 Demo 链接：待人工填写（S6）
- 演示视频链接（3–8 分钟，**覆盖 §2.2 六项 + §7.2**）：待人工填写（S7）
- **源代码仓库**：待人工填写（S8）— AI 主仓公开链接，内含 **`sandbox-repo/`** 子仓
- README / 运行说明：`README.md`

## 技术说明

- 系统架构说明：`docs/reports/submission/architecture.md`
- AI 使用说明：`docs/reports/submission/ai-usage.md`
- 工程难点说明：`docs/reports/submission/engineering-notes.md`

## 工程验证

- [x] **H14**：`npm run verify` 全绿（53 项测试）
- [x] **H15–H16**：对照 `docs/11` / `docs/12` 勾选（27/30 AC verified）
- [ ] **S9**：提交前无真实 API key/EP 入库
- [ ] **X1**：`sandbox-repo` npm audit 决策并记录

## 结果说明（≤3 条亮点，映射 §2.2）

- 亮点 1：Skill / Agent / Orchestrator 分层 + 第三 Skill 只加文件（#1）
- 亮点 2：断点重放与阶段证据（#2）
- 亮点 3：L2 跨栈 run + 模糊 LLM 澄清 + 历史召回入 plan（#3/#5/#6；视频还须展示 #4）
