# Plan

```json
{
  "summary": "在 Conduit 文章列表卡片增加确定性阅读量展示。",
  "requirement_id": "REQ-L1-ARTICLE-READS",
  "skill_id": "article-list-display-field",
  "skill_version": "1.0.0",
  "impacted_modules": [
    "frontend"
  ],
  "impact_matrix": {
    "level": "L1",
    "modules": [
      "frontend"
    ],
    "frontend_paths": [
      "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
      "frontend/src/styles.css"
    ],
    "backend_paths": [],
    "cross_stack": false
  },
  "history_references": [
    {
      "run_id": "run-2026-05-20T18-14-51-263Z",
      "goal": "文章列表卡片展示阅读量",
      "skill_id": "article-list-display-field",
      "score": 1,
      "summary": "在 Conduit 文章列表卡片增加确定性阅读量展示。",
      "match_type": "both",
      "similarity_score": 0.863
    },
    {
      "run_id": "run-2026-05-20T18-16-29-913Z",
      "goal": "文章列表卡片展示阅读量",
      "skill_id": "article-list-display-field",
      "score": 1,
      "summary": "在 Conduit 文章列表卡片增加确定性阅读量展示。",
      "match_type": "both",
      "similarity_score": 0.863
    },
    {
      "run_id": "run-2026-05-20T18-28-39-030Z",
      "goal": "文章列表卡片展示阅读量",
      "skill_id": "article-list-display-field",
      "score": 1,
      "summary": "在 Conduit 文章列表卡片增加确定性阅读量展示。",
      "match_type": "both",
      "similarity_score": 0.863
    }
  ],
  "target_files": [
    "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
    "frontend/src/styles.css"
  ],
  "target_files_source": "skill-targets",
  "schema_resolution": null,
  "sandbox_index": {
    "fileCount": 134,
    "frontendFiles": 101,
    "backendFiles": 33,
    "targets": [
      {
        "path": "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
        "exists": true,
        "exports": [],
        "imports": [
          "react-router-dom",
          "react",
          "../ArticleMeta",
          "../ArticleTags",
          "../FavButton"
        ]
      },
      {
        "path": "frontend/src/styles.css",
        "exists": true,
        "exports": [],
        "imports": []
      }
    ]
  },
  "risks": [
    "Conduit 根仓没有 lint script 时由实现仓库 ESLint 检查本次改动文件",
    "P0 只展示前端假数据，不代表真实阅读量统计"
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
