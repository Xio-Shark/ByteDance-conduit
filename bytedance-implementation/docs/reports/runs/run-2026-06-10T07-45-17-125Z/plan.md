# Plan

```json
{
  "summary": "在文章详情页基于 Article.body 展示字数统计。",
  "requirement_id": "REQ-001",
  "skill_id": "article-detail-word-count",
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
      "frontend/src/routes/Article/Article.jsx",
      "frontend/src/styles.css"
    ],
    "backend_paths": [],
    "cross_stack": false
  },
  "history_references": [
    {
      "run_id": "run-l3-multi-turn-clarify",
      "goal": "在文章详情页正文末尾添加字数统计展示，以提升用户停留时间。",
      "skill_id": "article-detail-word-count",
      "score": 0.537,
      "summary": "在文章详情页基于 Article.body 展示字数统计。",
      "match_type": "both",
      "similarity_score": 0.481
    },
    {
      "run_id": "run-2026-05-21T05-52-07-802Z",
      "goal": "文章详情页展示正文字数统计",
      "skill_id": "article-detail-word-count",
      "score": 0.463,
      "summary": "在文章详情页基于 Article.body 展示字数统计。",
      "match_type": "both",
      "similarity_score": 0.51
    },
    {
      "run_id": "run-2026-05-21T05-52-18-277Z",
      "goal": "文章详情页展示正文字数统计",
      "skill_id": "article-detail-word-count",
      "score": 0.463,
      "summary": "在文章详情页基于 Article.body 展示字数统计。",
      "match_type": "both",
      "similarity_score": 0.51
    }
  ],
  "target_files": [
    "frontend/src/routes/Article/Article.jsx",
    "frontend/src/styles.css"
  ],
  "target_files_source": "llm-driven",
  "schema_resolution": null,
  "sandbox_index": {
    "fileCount": 134,
    "frontendFiles": 101,
    "backendFiles": 33,
    "targets": [
      {
        "path": "frontend/src/routes/Article/Article.jsx",
        "exists": true,
        "exports": [],
        "imports": [
          "markdown-to-jsx",
          "react",
          "react-router-dom",
          "../../components/ArticleMeta",
          "../../components/ArticlesButtons",
          "../../components/ArticleTags",
          "../../components/BannerContainer",
          "../../context/AuthContext"
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
    "P0 只展示前端假数据，不代表真实阅读量统计",
    "在长文章中按字符计算字数可能引起前端性能问题",
    "预计阅读时间基于300字/分钟假设，与实际用户阅读速度有偏差但不在scope内",
    "修改styles.css可能无意中影响其他组件的全局样式"
  ],
  "validation_commands": [
    "npm run lint:sandbox",
    "npm test"
  ],
  "plan_mode": "llm",
  "source": "llm-driven",
  "ai_call": {
    "stage": "plan",
    "model": "deepseek-v4-flash",
    "prompt_version": "1.0.0-llm",
    "input_summary": "requirement_card: {\"id\":\"REQ-001\",\"goal\":\"在文章详情页底部展示字数与预计阅读时间\",\"level\":\"L1\",\"scope\":{\"include\":[\"文章详情页底部区域\",\"前端计算字数并显示\",\"预计阅读时间根据字数估算（假设每分钟阅读300字）\"],\"exclude\":[\"后端存储字数或阅读时间\",\"其他页面\"]}}\n\nskill: {\"id\":\"article-detail-word-count\",\"intent\":\"在文章详...",
    "output_summary": "根据需求REQ-001，在文章详情页底部展示字数与预计阅读时间，与历史运行run-l3-multi-turn-clarify（skill=article-detail-word-count）一致，本次在其基础上扩展了阅读时间估算。技能指定了目标文件frontend/src/routes/Article/Article.jsx和frontend/src/styles.css，分别用于修改文章详情页渲染和添加样式，因此保留为target_files。前端模块是唯一受影响模块，风险...",
    "tokens_in": 1083,
    "tokens_out": 1366,
    "latency_ms": 20322,
    "cost_estimate": 0.004898,
    "status": "completed"
  },
  "reasoning": "根据需求REQ-001，在文章详情页底部展示字数与预计阅读时间，与历史运行run-l3-multi-turn-clarify（skill=article-detail-word-count）一致，本次在其基础上扩展了阅读时间估算。技能指定了目标文件frontend/src/routes/Article/Article.jsx和frontend/src/styles.css，分别用于修改文章详情页渲染和添加样式，因此保留为target_files。前端模块是唯一受影响模块，风险主要集中在性能、假设偏差以及全局样式副作用上。",
  "llm_impacted_modules": [
    "frontend"
  ]
}
```
