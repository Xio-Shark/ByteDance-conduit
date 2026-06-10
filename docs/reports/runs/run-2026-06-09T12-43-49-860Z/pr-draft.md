# PR Draft: 文章列表卡片展示阅读量

## Requirement
给文章列表加阅读量展示，前端假数据即可，不改后端。

## Plan
在 Conduit 文章列表卡片增加确定性阅读量展示。

## Files Changed
- backend/controllers/articles.js
- backend/models/Article.js
- frontend/src/__mocks__/articles.js
- frontend/src/components/ArticlesPreview/ArticlesPreview.jsx
- frontend/src/components/CommentEditor/CommentEditor.jsx
- frontend/src/components/PopularTags/TagButton.jsx
- frontend/src/routes/Profile/Profile.jsx
- frontend/src/services/articles.js
- frontend/src/styles.css
- frontend/src/types/Article.ts

## Verification
- npm run lint:sandbox: exit 0
- npm run test: exit 0

## Risks
- Conduit 根仓没有 lint script 时由实现仓库 ESLint 检查本次改动文件
- P0 只展示前端假数据，不代表真实阅读量统计

## Rollback
Revert the generated patch or discard the branch before submitting PR.

## Diff Summary
diff --git a/backend/controllers/articles.js b/backend/controllers/articles.js
diff --git a/backend/models/Article.js b/backend/models/Article.js
diff --git a/frontend/src/__mocks__/articles.js b/frontend/src/__mocks__/articles.js
diff --git a/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx b/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx
diff --git a/frontend/src/components/CommentEditor/CommentEditor.jsx b/frontend/src/components/CommentEditor/CommentEditor.jsx
diff --git a/frontend/src/components/PopularTags/TagButton.jsx b/frontend/src/components/PopularTags/TagButton.jsx
diff --git a/frontend/src/routes/Profile/Profile.jsx b/frontend/src/routes/Profile/Profile.jsx
diff --git a/frontend/src/services/articles.js b/frontend/src/services/articles.js
diff --git a/frontend/src/styles.css b/frontend/src/styles.css
diff --git a/frontend/src/types/Article.ts b/frontend/src/types/Article.ts
