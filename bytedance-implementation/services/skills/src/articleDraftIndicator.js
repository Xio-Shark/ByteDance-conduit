const PREVIEW_PATH = "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx";
const ARTICLE_MODEL = "backend/models/Article.js";
const ALL_ARTICLES = "backend/controllers/articles.js";

export const articleDraftIndicatorSkill = Object.freeze({
  id: "article-draft-indicator",
  version: "1.0.0",
  intent: "在文章列表与 API 中展示草稿状态",
  appliesWhen: ["草稿", "draft", "草稿状态"],
  targetPaths: [PREVIEW_PATH, ARTICLE_MODEL, ALL_ARTICLES],
  validation: ["npm test"],
});

export async function applyArticleDraftIndicator(sandbox) {
  const preview = await sandbox.readText(PREVIEW_PATH);
  const model = await sandbox.readText(ARTICLE_MODEL);
  const controller = await sandbox.readText(ALL_ARTICLES);

  await sandbox.writeText(PREVIEW_PATH, updatePreview(preview));
  await sandbox.writeText(ARTICLE_MODEL, updateModel(model));
  await sandbox.writeText(ALL_ARTICLES, updateController(controller));

  return {
    changedFiles: [PREVIEW_PATH, ARTICLE_MODEL, ALL_ARTICLES],
    summary: "Article list and API now expose a consistent draft flag.",
  };
}

function updatePreview(source) {
  if (source.includes("article.draft")) {
    return source;
  }

  const titleAnchor = "<h1>{article.title}</h1>";
  assertIncludes(source, titleAnchor, PREVIEW_PATH);
  return source.replace(
    titleAnchor,
    `<h1>{article.title}{article.draft ? <span className="draft-badge">Draft</span> : null}</h1>`,
  );
}

function updateModel(source) {
  if (source.includes("draft: DataTypes.BOOLEAN")) {
    return source;
  }

  const bodyAnchor = "body: DataTypes.TEXT,";
  assertIncludes(source, bodyAnchor, ARTICLE_MODEL);
  return source.replace(bodyAnchor, "body: DataTypes.TEXT,\n      draft: DataTypes.BOOLEAN,");
}

function updateController(source) {
  if (source.includes("draft: false")) {
    return source;
  }

  const createAnchor = `    const article = await Article.create({
      slug: slug,
      title: title,
      description: description,
      body: body,
    });`;
  assertIncludes(source, createAnchor, ALL_ARTICLES);
  return source.replace(
    createAnchor,
    `    const article = await Article.create({
      slug: slug,
      title: title,
      description: description,
      body: body,
      draft: false,
    });`,
  );
}

function assertIncludes(source, anchor, filePath) {
  if (!source.includes(anchor)) {
    throw new Error(`Skill article-draft-indicator missing anchor in ${filePath}`);
  }
}
