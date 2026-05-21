export function buildRequirement(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Requirement input is required");
  }

  if (/草稿|draft/i.test(trimmed)) {
    return draftRequirement(trimmed);
  }

  if (/字数|word count|详情页/i.test(trimmed)) {
    return wordCountRequirement(trimmed);
  }

  return readCountRequirement(trimmed);
}

function readCountRequirement(trimmed) {
  return {
    id: "REQ-L1-ARTICLE-READS",
    source_input: trimmed,
    goal: "文章列表卡片展示阅读量",
    scope: {
      include: [
        "文章列表",
        "阅读量",
        "前端展示字段",
        "Conduit frontend article preview",
      ],
      exclude: ["后端 schema", "数据库迁移", "真实阅读量统计"],
    },
    assumptions: [
      "P0 使用前端确定性假数据展示阅读量",
      "阅读量展示在 ArticlePreview 卡片的 Read more 附近",
    ],
    clarifications: [
      "阅读量来源按 P0 题面使用前端假数据",
      "本次不修改后端和数据库",
    ],
    acceptance: [
      "文章列表每张卡片显示 eye icon 和 reads 数字",
      "变更落在真实 Conduit frontend 路径",
      "运行 Conduit 真实测试脚本并记录结果",
    ],
    level: "L1",
  };
}

function draftRequirement(trimmed) {
  return {
    id: "REQ-L2-ARTICLE-DRAFT",
    source_input: trimmed,
    goal: "文章列表与 API 展示草稿状态",
    scope: {
      include: ["文章列表", "草稿", "draft", "frontend", "backend API"],
      exclude: ["复杂工作流", "邮件通知"],
    },
    assumptions: [
      "草稿字段默认 false，列表与 API 一致",
    ],
    clarifications: [
      "草稿状态在列表卡片与 Article API 响应中同时可见",
    ],
    acceptance: [
      "文章列表卡片展示 Draft 标记",
      "Article 模型与 API 返回 draft 字段",
      "diff 同时包含 frontend 与 backend 路径",
    ],
    level: "L2",
  };
}

function wordCountRequirement(trimmed) {
  return {
    id: "REQ-L1-ARTICLE-WORD-COUNT",
    source_input: trimmed,
    goal: "文章详情页展示正文字数统计",
    scope: {
      include: ["文章详情", "字数统计", "Article.body"],
      exclude: ["后端 schema", "数据库迁移"],
    },
    assumptions: [
      "字数基于 Article.body 前端计算",
    ],
    clarifications: [
      "仅在详情页展示字数，不改动后端",
    ],
    acceptance: [
      "文章详情页显示 words 计数",
      "变更落在 Conduit frontend 路径",
    ],
    level: "L1",
  };
}
