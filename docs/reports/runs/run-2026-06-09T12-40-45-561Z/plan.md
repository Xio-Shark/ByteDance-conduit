# Plan

```json
{
  "summary": "schemaDriver 推断目标文件，frontendGenerators 生成跨栈三件套；Skill 不手写 targetPaths。",
  "requirement_id": "REQ-L2-ARTICLE-COVER-IMAGE",
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
    "frontend/src/__mocks__/articles.js"
  ],
  "target_files_source": "schema-driven",
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
    "already_applied": false
  },
  "sandbox_index": {
    "fileCount": 131,
    "frontendFiles": 98,
    "backendFiles": 33,
    "targets": [
      {
        "path": "backend/models/Article.js",
        "exists": true,
        "exports": [],
        "imports": []
      }
    ]
  },
  "risks": [
    "Conduit 根仓没有 lint script 时由实现仓库 ESLint 检查本次改动文件",
    "L2 跨栈改动须保持 API 字段与前端展示一致",
    "schema-driven Skill 生成的前端类型/服务/Mock 是首版骨架，业务字段绑定需后续 Skill 或人工细化"
  ],
  "validation_commands": [
    "npm run lint:sandbox",
    "npm test"
  ],
  "plan_mode": "rules",
  "source": "rules-driven",
  "ai_call": null
}
```
