# 答辩与 §8.2 提交准备（S10）

截止：**2026-06-10**。本文档汇总提交材料索引与答辩路径；**不含 GitHub 远端推送**。

---

## 材料包索引

| 材料 | 路径 | 状态 |
|------|------|------|
| 提交清单 | [`checklist.md`](./checklist.md) | ✅ |
| 团队 / 链接 | [`team-info.md`](./team-info.md) | 🟡 链接与成员待填 |
| 演示脚本 | [`demo-script.md`](./demo-script.md) | ✅ |
| 视频录制指南 | [`video-recording-guide.md`](./video-recording-guide.md) | ✅ 脚本；视频待录 |
| 架构说明 | [`architecture.md`](./architecture.md) | ✅ 已同步 |
| 工程难点 | [`engineering-notes.md`](./engineering-notes.md) | ✅ 已同步 |
| AI 使用说明 | [`ai-usage.md`](./ai-usage.md) | ✅ |
| Prompt / Skill 变更 | [`prompt-changelog.md`](./prompt-changelog.md) | ✅ |
| 澄清对话导出 | [`clarify-conversation-export.md`](./clarify-conversation-export.md) | ✅ |
| 开发工具清单 | [`tools-manifest.md`](./tools-manifest.md) | ✅ |
| 公开仓指南 | [`public-repo-guide.md`](./public-repo-guide.md) | 草稿存在；远端公开仓 `pending_human` |
| 安全检查 | [`security-check-report.md`](./security-check-report.md) | ✅ |
| 依赖 audit 决策 | [`dependency-audit-decision.md`](./dependency-audit-decision.md) | ✅ |

---

## §2.2 六项证据速查

| # | 亮点 | 证据 run / 路径 |
|---|------|-----------------|
| 1 | 抽象到位 | `run-2026-05-21T05-52-18-277Z`；`articleDetailWordCount.js` |
| 2 | 断点重放 | `resume-from-stage`；`checkpoints.json` |
| 3 | 跨栈一致性 | `run-2026-05-21T05-52-12-490Z` |
| 4 | 可观测性 | `run-2026-05-21T05-58-01-181Z` + AI Usage 面板 |
| 5 | 业务上下文 | `run-2026-05-21T05-51-56-519Z` |
| 6 | 澄清深度 | `run-2026-05-21T05-58-01-181Z` |

验收 YAML：文档仓 `docs/11-acceptance.yaml`（24/28 AC verified；AC-F011 仍待外部/人工闭合）。

---

## 答辩叙述顺序（建议 15 分钟现场）

1. **问题与架构**（2 min）：PM→PR 闭环；[`architecture.md`](./architecture.md)
2. **Live Demo**（5 min）：按 [`video-recording-guide.md`](./video-recording-guide.md) 精简版
3. **§2.2 六项**（5 min）：逐项指 run 目录与面板
4. **AI 留痕与合规**（2 min）：`ai-usage.md` + `prompt-changelog.md`
5. **Q&A 备用**（1 min）：[`engineering-notes.md`](./engineering-notes.md) 难点

---

## 提交前最后 48 小时 Checklist

- [ ] [`team-info.md`](./team-info.md) 成员与 Demo/视频/仓库链接已填
- [ ] 演示视频 3–8 分钟已上传（S7）
- [ ] AI 系统主仓已公开，且仓内包含 `sandbox-repo/`（S8）
- [ ] [`security-check-report.md`](./security-check-report.md) 发布日再检
- [ ] `npm run verify` 全绿
- [ ] 文档仓 `docs/10-progress.md` 与根目录汇报同步

---

## 仍待人工 / 远端（非本文档范围）

| 项 | 说明 |
|----|------|
| H17 真实 draft PR | 可选远端能力；上游 Conduit PR 非 §8.2 必填，本地 `pr-draft.md` 即可 |
| 豆包 clarify（P1-5） | **已决策跳过**；不强制豆包；§2.2 #6 以 `run-2026-05-21T05-58-01-181Z`（mimo-v2.5）举证 |
| GitHub 公开推送 | 见 [`public-repo-guide.md`](./public-repo-guide.md) |
| 团队姓名 | 见 [`team-info.md`](./team-info.md) |

---

## Git 基线

| 项 | 值 |
|----|-----|
| 本地 Git 状态 | 有历史 commit；当前仍有未跟踪实现 / run / submission 路径 |
| 发布范围 | 公开仓必须含实现仓、`sandbox-repo/`、关键 run 证据与 submission 文档；以 `public-repo-guide.md` 的 `git ls-files` / archive dry-run 校验为准 |

`git ls-files` 与 `archive:dry-run` 只是本地发布候选校验；公开仓是否真实包含这些内容仍须远端发布后 fresh clone 复核，不替代 §8.2 外部门禁。

公开推送前确认 `.env` 从未进入 commit history。
