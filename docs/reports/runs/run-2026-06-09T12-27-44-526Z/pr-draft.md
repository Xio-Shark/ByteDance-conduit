# PR Draft: Popular Tags 前 5 个打标

## Requirement
给 Popular Tags 侧边栏前 5 个标签打醒目标记。

## Plan
在 Popular Tags 侧边栏为前 5 个标签增加醒目标记。

## Files Changed
- frontend/src/components/ArticlesPreview/ArticlesPreview.jsx
- frontend/src/components/CommentEditor/CommentEditor.jsx
- frontend/src/components/PopularTags/TagButton.jsx
- frontend/src/routes/Profile/Profile.jsx
- frontend/src/styles.css

## Verification
- npm run lint:sandbox: exit 0
- npm run test: exit 0

## Risks
- Conduit 根仓没有 lint script 时由实现仓库 ESLint 检查本次改动文件
- P0 只展示前端假数据，不代表真实阅读量统计

## Rollback
Revert the generated patch or discard the branch before submitting PR.

## Diff Summary
diff --git a/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx b/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx
diff --git a/frontend/src/components/CommentEditor/CommentEditor.jsx b/frontend/src/components/CommentEditor/CommentEditor.jsx
diff --git a/frontend/src/components/PopularTags/TagButton.jsx b/frontend/src/components/PopularTags/TagButton.jsx
diff --git a/frontend/src/routes/Profile/Profile.jsx b/frontend/src/routes/Profile/Profile.jsx
diff --git a/frontend/src/styles.css b/frontend/src/styles.css
