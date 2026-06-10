# Plan

```json
{
  "summary": "schemaDriver 推断目标文件，frontendGenerators 生成跨栈三件套；Skill 不手写 targetPaths。",
  "requirement_id": "REQ-ARTICLE-COVER-IMG",
  "skill_id": "article-cover-image",
  "skill_version": "1.0.0",
  "impacted_modules": [
    "frontend",
    "backend"
  ],
  "impact_matrix": {
    "level": "L2",
    "modules": [
      "frontend",
      "backend"
    ],
    "frontend_paths": [
      "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
      "frontend/src/types/Article.ts",
      "frontend/src/services/articles.js",
      "frontend/src/__mocks__/articles.js"
    ],
    "backend_paths": [
      "backend/models/Article.js",
      "backend/controllers/articles.js"
    ],
    "cross_stack": true
  },
  "history_references": [
    {
      "run_id": "run-l2-auto-cover-image",
      "goal": "为 Article 模型新增 coverImage 字段并自动同步前端类型/服务/Mock",
      "skill_id": "article-cover-image",
      "score": 0.313,
      "summary": "schemaDriver 推断目标文件，frontendGenerators 生成跨栈三件套；Skill 不手写 targetPaths。",
      "match_type": "both",
      "similarity_score": 0.494
    },
    {
      "run_id": "run-2026-05-21T05-52-07-802Z",
      "goal": "文章详情页展示正文字数统计",
      "skill_id": "article-detail-word-count",
      "score": 0.156,
      "summary": "在文章详情页基于 Article.body 展示字数统计。",
      "match_type": "both",
      "similarity_score": 0.494
    },
    {
      "run_id": "run-2026-05-21T05-52-18-277Z",
      "goal": "文章详情页展示正文字数统计",
      "skill_id": "article-detail-word-count",
      "score": 0.156,
      "summary": "在文章详情页基于 Article.body 展示字数统计。",
      "match_type": "both",
      "similarity_score": 0.494
    }
  ],
  "target_files": [
    "backend/models/Article.js",
    "backend/controllers/articles.js",
    "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
    "frontend/src/types/Article.ts",
    "frontend/src/services/articles.js",
    "frontend/src/__mocks__/articles.js",
    "frontend/src/components/ArticleEditorForm/ArticleEditorForm.jsx",
    "frontend/src/components/ArticleMeta/ArticleMeta.jsx"
  ],
  "target_files_source": "schema-driven+llm",
  "schema_resolution": {
    "model": "Article",
    "field": "coverImage",
    "type": "STRING",
    "op": "add",
    "generated_files": [
      "frontend/src/types/Article.ts",
      "frontend/src/services/articles.js",
      "frontend/src/__mocks__/articles.js"
    ],
    "already_applied": true
  },
  "sandbox_index": {
    "fileCount": 134,
    "frontendFiles": 101,
    "backendFiles": 33,
    "targets": [
      {
        "path": "backend/models/Article.js",
        "exists": true,
        "exports": [],
        "imports": []
      },
      {
        "path": "frontend/src/types/Article.ts",
        "exists": true,
        "exports": [],
        "imports": []
      },
      {
        "path": "frontend/src/services/articles.js",
        "exists": true,
        "exports": [],
        "imports": []
      },
      {
        "path": "frontend/src/__mocks__/articles.js",
        "exists": true,
        "exports": [
          "mockArticles"
        ],
        "imports": []
      }
    ]
  },
  "risks": [
    "Conduit 根仓没有 lint script 时由实现仓库 ESLint 检查本次改动文件",
    "L2 跨栈改动须保持 API 字段与前端展示一致",
    "schema-driven Skill 生成的前端类型/服务/Mock 是首版骨架，业务字段绑定需后续 Skill 或人工细化",
    "Cross-stack drift between backend model changes and frontend components if the schemaDriver's automatic generation misses any form/display updates.",
    "Database migration for the new 'coverImage' field may not be automatically created by schemaDriver, risking a schema mismatch at runtime.",
    "No validation or sanitization of the coverImage URL input, which could lead to broken images or security issues if raw URLs are rendered without checks."
  ],
  "validation_commands": [
    "npm run lint:sandbox",
    "npm test"
  ],
  "plan_mode": "llm",
  "source": "llm-driven",
  "ai_call": {
    "stage": "plan",
    "model": "mimo-v2.5-pro",
    "prompt_version": "1.0.0-llm",
    "input_summary": "requirement_card: {\"id\":\"REQ-ARTICLE-COVER-IMG\",\"goal\":\"在文章模型中新增封面图URL字段，并在新建/编辑表单中支持输入，在列表和详情页展示。\",\"level\":\"L2\",\"scope\":{\"include\":[\"为文章模型添加封面图URL字段\",\"在新建和编辑表单中添加URL输入框\",\"在文章列表页展示封面图\",\"在文章详情页展示封面图\"],\"exclude\":[\"不支持文件上传\",\"不修改其他模型\",\"不进行图片处理\"...",
    "output_summary": "Following history_reference #1 (run-l2-auto-cover-image), which used the same schema-driven skill to add a field to Article and auto-generate frontend changes, we target the same model file and core UI components (editor, meta, preview, moc...",
    "tokens_in": 1112,
    "tokens_out": 2321,
    "latency_ms": 99069,
    "cost_estimate": 0.006866,
    "status": "completed"
  },
  "reasoning": "Following history_reference #1 (run-l2-auto-cover-image), which used the same schema-driven skill to add a field to Article and auto-generate frontend changes, we target the same model file and core UI components (editor, meta, preview, mocks) to ensure coverImage is persisted, input, and displayed as required. However, the absence of a migration file in sandbox_index indicates a risk that the database column addition might be missed by the automated process.",
  "llm_impacted_modules": [
    "backend",
    "frontend"
  ]
}
```
