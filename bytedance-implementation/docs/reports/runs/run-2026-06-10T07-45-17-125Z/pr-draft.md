# PR Draft: 在文章详情页底部展示字数与预计阅读时间

## Requirement
在文章详情页底部显示「本文共 XXX 字，预计阅读 Y 分钟」，前端基于 Article.body 计算字数

## Plan
在文章详情页基于 Article.body 展示字数统计。

## Files Changed
- backend/controllers/articles.js
- backend/models/Article.js
- frontend/src/__mocks__/articles.js
- frontend/src/components/ArticlesPreview/ArticlesPreview.jsx
- frontend/src/components/CommentEditor/CommentEditor.jsx
- frontend/src/components/PopularTags/TagButton.jsx
- frontend/src/routes/Article/Article.jsx
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
- 在长文章中按字符计算字数可能引起前端性能问题
- 预计阅读时间基于300字/分钟假设，与实际用户阅读速度有偏差但不在scope内
- 修改styles.css可能无意中影响其他组件的全局样式

## Rollback
Revert the generated patch or discard the branch before submitting PR.

## Diff Summary
diff --git a/backend/controllers/articles.js b/backend/controllers/articles.js
diff --git a/backend/models/Article.js b/backend/models/Article.js
diff --git a/frontend/src/__mocks__/articles.js b/frontend/src/__mocks__/articles.js
diff --git a/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx b/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx
diff --git a/frontend/src/components/CommentEditor/CommentEditor.jsx b/frontend/src/components/CommentEditor/CommentEditor.jsx
diff --git a/frontend/src/components/PopularTags/TagButton.jsx b/frontend/src/components/PopularTags/TagButton.jsx
diff --git a/frontend/src/routes/Article/Article.jsx b/frontend/src/routes/Article/Article.jsx
diff --git a/frontend/src/routes/Profile/Profile.jsx b/frontend/src/routes/Profile/Profile.jsx
diff --git a/frontend/src/services/articles.js b/frontend/src/services/articles.js
diff --git a/frontend/src/styles.css b/frontend/src/styles.css
diff --git a/frontend/src/types/Article.ts b/frontend/src/types/Article.ts
