# Demo Script

更新时间：**2026-06-09**。

用途：录制 3-8 分钟演示视频，或现场给评委远程展示。本文档是“照着操作 + 照着读”的版本，不需要再临场组织语言。

更完整的长稿见 [`demo-flow-narration.md`](./demo-flow-narration.md)。

线上演示地址：

```text
http://49.232.191.243
```

API 健康检查地址：

```text
http://49.232.191.243/api/health
```

本文档绝对路径：

```text
/Users/xioshark/Desktop/bytedance/bytedance-implementation/docs/reports/submission/demo-script.md
```

---

## 0. 录制前准备

### 0.1 打开终端

操作：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
npm install
npm install --prefix sandbox-repo
BLOCK_ON_CONFIRM=1 AI_MODE=llm PLAN_MODE=llm npm run dev
```

> 主路径使用真实模型（`.env` 配置 `LLM_*`，当前默认 `deepseek-v4-flash`）。断网应急时可改用 `AI_MODE=rules PLAN_MODE=rules`，但 tokens 为 0，仅作兜底回放，不作为答辩主路径。

看到终端里 API 和 Web 都启动后，打开浏览器：

```text
http://localhost:5173
```

如果云服务器已经部署好，优先打开线上 Demo：

```text
http://49.232.191.243
```

本地录屏时用 `localhost` 即可。线上录屏前先检查：

```text
http://49.232.191.243/api/health
```

正常应返回 `{"status":"ok"}`。

### 0.2 调整画面

操作：

1. 浏览器缩放调到 90%-100%。
2. 关闭微信、邮箱、通知、无关终端。
3. 准备两个窗口：
   - 浏览器：展示 Web 控制台。
   - 终端或编辑器：展示 `docs/reports/runs/...` 证据文件。
4. macOS 按 `Command + Shift + 5` 开始录屏。

不要在视频里展示：

- `.env`
- 真实 API key
- GitHub token
- 个人联系方式
- 提交系统后台隐私信息

---

## 1. 视频主线总览

建议录制 6 分钟左右。

| 时间 | 画面 | 要证明什么 |
|------|------|------------|
| 0:00-0:25 | Web 控制台首页 | 这是端到端交付系统，不是聊天壳 |
| 0:25-1:50 | 点击示例并跑一次需求 | PM 输入需求到需求卡片、方案、diff、验证、PR 草稿 |
| 1:50-2:40 | 多轮澄清证据 | 模糊需求不会硬编，会追问和改写 |
| 2:40-3:30 | AI Usage 与 LLM plan | 有真实 LLM 调用和 token 留痕 |
| 3:30-4:40 | schema-driven / Skill 证据 | 新字段能跨前后端落代码 |
| 4:40-5:30 | 历史方案复用和恢复编辑 | 能复用历史经验，也支持确认后继续 |
| 5:30-6:10 | PR 草稿和提交材料 | 交付件可审阅、可提交 |
| 6:10-6:25 | 收尾 | 总结六项要求已覆盖 |

---

## 2. 逐步操作和照读稿

### 2.1 开场，展示系统定位

屏幕操作：

1. 浏览器打开线上 Demo：`http://49.232.191.243`。如果线上服务还没启动，再用本地地址：`http://localhost:5173`。
2. 让画面停在首页，能看到：
   - PM 需求输入框
   - 示例需求按钮
   - 阶段列表
   - AI 用量或运行历史区域

照读口播：

> 大家好，我演示的是一个面向 Conduit 全栈博客项目的 AI 交付系统。它不是简单聊天问答，而是把 PM 的自然语言需求，转成可执行的需求卡片、方案、代码变更、自动化验证结果和 PR 草稿。  
> 这里的前端是 React 控制台，后端是 Node API，真实写入的是 `sandbox-repo` 里的 Conduit 项目代码。接下来我会用一个示例需求跑完整链路，并展示已经归档的 LLM 能力证据。

不要读：

> 这个系统所有能力都已经完全线上生产可用。

如果某些最终门禁还没跑完，就不要说“全部门禁已通过”。

---

### 2.2 点击示例，自动输入并发起运行

屏幕操作：

1. 在页面上点击示例需求按钮，例如：

```text
阅读量展示
```

2. 确认它会自动把 PM 需求写入输入框，并自动开始运行。
3. 如果按钮只填入但没有自动运行，就点击页面上的运行按钮。
4. 等待运行结果出现。

示例 PM 需求：

```text
给文章列表加阅读量展示，前端假数据即可，不改后端。
```

照读口播：

> 我现在点击一个中文示例需求。这个按钮不是静态文案，它会把 PM 需求填入输入框，并发起一次交付运行。  
> 这个需求里有一个很重要的约束：前端假数据即可，不改后端。所以系统后续应该把范围控制在前端展示层，而不是去改数据库 schema 或 API。

如果页面没有自动触发运行，改读：

> 示例已经把需求填进来了，我现在手动点击运行，后面的链路是一样的。

---

### 2.3 展示需求卡片

屏幕操作：

1. 滚动到 `需求` / `Requirement` / 需求卡片区域。
2. 指给评委看：
   - PM 原始输入
   - scope / include
   - exclude
   - acceptance criteria

照读口播：

> 第一阶段是需求结构化。系统把自然语言拆成目标、范围、排除范围和验收标准。  
> 这里可以看到它识别出“不改后端”这个约束，所以后续计划不会触碰后端 schema 和 API。这个步骤很关键，因为它决定了后面的代码生成边界。

重点展示：

```text
exclude: backend schema / API
```

如果页面字段名称是中文，就按中文读：

> 这里的“排除范围”明确写了不修改后端。

---

### 2.4 展示方案和目标文件

屏幕操作：

1. 滚动到 `方案` / `Plan` 区域。
2. 展示 Skill、目标文件、历史参考。
3. 重点展示目标文件类似：

```text
sandbox-repo/frontend/src/components/ArticlesPreview.jsx
sandbox-repo/frontend/src/styles.css
```

照读口播：

> 第二阶段是方案规划。系统会选择匹配的 Skill，并定位到真实 Conduit 仓库里的目标文件。  
> 这个例子只需要修改文章列表卡片和样式，所以目标文件集中在 `ArticlesPreview.jsx` 和 `styles.css`。这说明系统不是把代码随便生成到一个新文件里，而是能落到已有项目结构里。

如果看到历史参考：

> 这里还有历史参考，说明系统会复用之前相似需求的经验，减少重复试错。

---

### 2.5 展示 diff：证明写入 sandbox-repo

屏幕操作：

1. 滚动到 `Diff` 区域。
2. 展示文件路径和具体代码差异。
3. 如果页面有文件列表，点开 `ArticlesPreview.jsx` 和 `styles.css`。

照读口播：

> 第三阶段是代码写入。这里展示的是实际 diff，路径来自 `sandbox-repo` 下的 Conduit 真实项目。  
> 评委可以看到这不是只生成一段建议，而是实际修改了项目文件。对于这个阅读量需求，改动集中在文章列表展示和样式上，符合刚才的“不改后端”约束。

如果 diff 里有历史文件：

> 当前 sandbox 保留了一些演练痕迹，所以文件列表可能包含历史 diff。演示重点看本次 run 的需求、方案、验证和 PR 草稿；正式提交会用公开仓 fresh clone 再复核。

---

### 2.6 展示 lint / 单测

屏幕操作：

1. 滚动到 `验证` / `Verification` 区域。
2. 展示命令和退出码。
3. 重点展示：

```text
npm run lint:sandbox
npm run test
exit 0
```

照读口播：

> 第四阶段是验证。系统不是只写代码，还会记录验证命令和结果。  
> 这里可以看到 lint 和单测都是通过的，退出码是 0。也就是说，这条交付链路包含了基本质量门禁。

如果当前实时结果失败：

> 当前实时环境有失败项，我不会把它说成通过。这里切到已归档的稳定 run 证据，展示当时通过的验证记录。

稳定证据路径：

```text
docs/reports/runs/run-2026-05-21T02-16-15-215Z/verification.json
```

终端展示命令：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
sed -n '1,180p' docs/reports/runs/run-2026-05-21T02-16-15-215Z/verification.json
```

---

### 2.7 展示 PR 草稿

屏幕操作：

1. 滚动到 `PR 草稿` / `PR Draft` 区域。
2. 展示：
   - PR 标题
   - summary
   - changed files
   - verification
   - risks

照读口播：

> 最后系统生成 PR 草稿，把需求、改动文件、验证结果和风险集中到一个可审阅的交付件里。  
> 真实 GitHub PR 需要配置 GitHub token；没有 token 不影响本地演示和比赛提交，因为我们仍然能生成 `pr-draft.md`，并展示完整 diff 和验证证据。

必须讲清楚：

> GitHub token 只是远端开 PR 的增强能力，不是本 Demo 必需项。

---

## 3. 展示 §2.2 六项能力证据

这部分不一定每项都现场跑，建议用归档 run 展示。归档证据更稳定，适合录屏。

先切到终端：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
```

### 3.1 多轮澄清：模糊需求不会硬编

屏幕操作：

```bash
sed -n '1,120p' docs/reports/runs/run-l3-multi-turn-clarify/ai-calls.jsonl
sed -n '1,160p' docs/reports/runs/run-l3-multi-turn-clarify/requirement.md
```

照读口播：

> 这一段展示多轮澄清能力。面对模糊需求，系统不会直接硬编代码，而是通过 LLM 追问、吸收 PM 回答，再生成更明确的需求。  
> 这里的 `ai-calls.jsonl` 记录了 LLM 调用，`requirement.md` 记录了澄清后的需求结果。

对应要求：

```text
#6 多轮 LLM clarify
```

---

### 3.2 AI Usage：真实 LLM 调用和 token 留痕

屏幕操作：

```bash
sed -n '1,120p' docs/reports/runs/run-plan-llm-driven/ai-calls.jsonl
sed -n '1,140p' docs/reports/runs/run-plan-llm-driven/run-summary.json
```

照读口播：

> 这一段展示 AI Usage。主路径走真实模型，clarify 和 plan 阶段都有真实 LLM 调用和非零 token 记录。  
> 这里可以看到每次调用的 tokens、延迟和成本，证明它不是套壳，而是真实模型驱动。断网应急的 rules 兜底模式 token 为 0，仅作回放，不作为答辩证据。

对应要求：

```text
#4 AI usage / non-zero token evidence
```

---

### 3.3 schema-driven 跨栈改动

屏幕操作：

```bash
sed -n '1,180p' docs/reports/runs/run-l2-auto-cover-image/plan.md
sed -n '1,120p' services/skills/src/articleCoverImage.js
```

照读口播：

> 这一段展示 schema-driven 的 L2 能力。Skill 只声明业务字段和意图，系统会把影响扩展到后端 model、controller、前端 type、service、mock 和 component。  
> 重点是新增模式不用大改主干逻辑，而是通过 Skill 注册和 schema 推导完成跨层落地。

对应要求：

```text
#3 schema-driven L2
#1 Skill 扩展能力
```

---

### 3.4 历史方案复用：token 重叠召回历史经验

屏幕操作：

```bash
sed -n '1,180p' docs/reports/runs/run-semantic-recall-demo/plan.md
sed -n '1,160p' docs/reports/runs/run-semantic-recall-demo/history-recall.json
```

照读口播：

> 这一段展示历史方案复用。系统基于 token 重叠从历史 run 中找相似需求，把相关经验带入当前 plan。  
> 这里可以看到 `history_references` 和召回结果，说明它不是每次从零开始，而是可以复用历史交付知识。

对应要求：

```text
#5 semantic recall
```

---

### 3.5 非文章列表 Skill：证明不是单一 hardcode

屏幕操作：

```bash
sed -n '1,140p' services/skills/src/commentLikeCount.js
sed -n '1,160p' docs/reports/runs/run-l2-comment-like/verification.json
sed -n '1,140p' services/skills/src/registry.js
```

照读口播：

> 这里展示另一个 Skill：评论点赞计数。它不是文章列表阅读量的 hardcode，而是另一个独立能力。  
> 注册表里可以看到多个 Skill，说明系统通过可扩展 Skill 机制支持不同类型的 PM 需求。

对应要求：

```text
#1 6 Skill / extensibility
```

---

### 3.6 人工确认和继续

屏幕操作：

如果页面能展示 waiting / review / continue，就在 Web 上展示；如果不稳定，展示归档证据或口头说明。

照读口播：

> 对风险较高或需要 PM 确认的需求，系统支持先进入等待确认状态。PM 可以 review plan，修改输入，再 continue。  
> 这避免了 AI 在需求不清楚时直接写代码，也让人类可以在关键节点介入。

对应要求：

```text
#2 BLOCK_ON_CONFIRM / waiting / continue
```

---

## 4. 展示提交材料

屏幕操作：

```bash
sed -n '1,120p' docs/reports/submission/ai-usage.md
sed -n '1,120p' docs/reports/submission/prompt-changelog.md
sed -n '1,120p' docs/reports/submission/engineering-notes.md
sed -n '1,120p' docs/reports/submission/architecture.md
sed -n '1,120p' docs/reports/submission/security-check-report.md
```

照读口播：

> 最后是提交材料。这里整理了 AI 使用记录、prompt 变更、工程说明、架构说明和安全检查。  
> 公开仓已经做过 fresh clone 校验，GitHub secret scanning 结果为 0。真实 `.env`、API key 和 GitHub token 不会提交到公开仓。

如果已经做了低敏路径脱敏，可以加读：

> 本机路径和用户名也已经脱敏，公开材料只保留必要的项目证据。

如果还没脱敏，不要读上面那句。

---

## 5. 收尾

屏幕操作：

1. 回到浏览器 PR 草稿或首页。
2. 画面停在能看到完整链路的位置。
3. 读完后停止录屏。

照读口播：

> 总结一下，这个 Demo 覆盖了 PM 输入需求、需求结构化、方案生成、写入 `sandbox-repo`、展示 diff、lint / 单测验证，以及生成 PR 草稿。  
> 额外能力上，我展示了多轮澄清、AI Usage token 留痕、schema-driven 跨栈改动、历史方案复用、人工确认继续和多 Skill 扩展。  
> 所以它的交付对象不是一段文本，而是一套可运行、可验证、可审阅的全栈项目交付流程。

---

## 6. 录完以后要做什么

### 6.1 上传视频

操作：

1. 把录屏上传到可公开访问的位置。
2. 拿到视频 URL。
3. 确认无登录也能打开。

### 6.2 填写 video evidence

文件：

```text
/Users/xioshark/Desktop/bytedance/bytedance-implementation/docs/reports/submission/video-evidence.json
```

校验：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
npm run check:video-evidence -- --file docs/reports/submission/video-evidence.json
```

### 6.3 填写 external submission evidence

文件：

```text
/Users/xioshark/Desktop/bytedance/bytedance-implementation/docs/reports/submission/external-submission-evidence.json
```

需要写入：

- GitHub 仓库 URL
- 公开仓 commit
- fresh clone 路径和校验结果
- Demo URL：`http://49.232.191.243`
- 视频 URL
- secret scanning 结果
- 最终提交系统确认

---

## 7. 常见问题怎么回答

### 没有 GitHub token 要紧吗？

照读：

> 不要紧。GitHub token 只影响是否能自动创建远端 draft PR。比赛演示的主链路不依赖它，因为系统已经能生成本地 `pr-draft.md`、真实 diff 和验证结果。如果配置 token，就可以把这个草稿进一步推到 GitHub。

### 为什么使用 rules 模式？

照读：

> 主演示链路走真实模型（`deepseek-v4-flash`），clarify 和 plan 阶段都有非零 token 留痕。rules 模式仅作断网应急的稳定回放兜底，不作为答辩主路径。

### 是不是只改了前端？

照读：

> 当前这个示例需求明确要求“不改后端”，所以只改前端是正确行为。另一个 schema-driven 示例会展示新增字段时如何跨后端 model、controller、前端 service、mock 和 component 一起落地。

### 公开仓有没有隐私信息？

照读：

> 高危密钥没有发现，GitHub secret scanning 告警为 0，也没有提交真实 `.env`、API key 或 token。需要注意的是，本机路径这类低敏信息建议脱敏后再最终提交。

---

## 8. 最短版口播

时间不够时，只读这版，控制在 90 秒左右。

> 我演示的是一个面向 Conduit 全栈项目的 AI 交付系统。它从 PM 自然语言需求开始，生成需求卡片、方案、真实代码 diff、验证结果和 PR 草稿。  
> 现在我点击“阅读量展示”示例，它会自动填入需求并发起运行。这个需求明确说前端假数据、不改后端，所以系统把范围限制在前端文章卡片和样式文件。  
> 这里可以看到需求卡片、目标文件、`sandbox-repo` 下的真实 diff、lint / 单测验证，以及最后生成的 PR 草稿。  
> 另外我用归档 run 展示多轮澄清、LLM plan 的 token 留痕、schema-driven 跨栈改动、历史方案复用、人工确认继续和多 Skill 扩展。  
> 所以这个项目不是聊天壳，而是一个从需求到代码、验证和交付文档的端到端全栈交付流程。
