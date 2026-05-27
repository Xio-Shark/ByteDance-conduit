const ARTICLE_PATH = "frontend/src/routes/Article/Article.jsx";
const STYLE_PATH = "frontend/src/styles.css";

export const articleDetailWordCountSkill = Object.freeze({
  id: "article-detail-word-count",
  version: "1.0.0",
  intent: "在文章详情页展示正文字数",
  appliesWhen: ["字数", "字数统计", "word count", "详情页"],
  targetPaths: [ARTICLE_PATH, STYLE_PATH],
  validation: ["npm run lint:sandbox", "npm test"],
});

export async function applyArticleDetailWordCount(sandbox) {
  const articlePage = await sandbox.readText(ARTICLE_PATH);
  const styles = await sandbox.readText(STYLE_PATH);

  await sandbox.writeText(ARTICLE_PATH, updateArticlePage(articlePage));
  await sandbox.writeText(STYLE_PATH, updateStyles(styles));

  return {
    changedFiles: [ARTICLE_PATH, STYLE_PATH],
    summary: "Article detail page now shows a deterministic word count for Article.body.",
  };
}

function updateArticlePage(source) {
  if (source.includes("getWordCount(body)")) {
    return source;
  }

  const importAnchor = 'import getArticle from "../../services/getArticle";';
  const bodyAnchor = "{body && <Markdown options={{ forceBlock: true }}>{body}</Markdown>}";
  assertIncludes(source, importAnchor, ARTICLE_PATH);
  assertIncludes(source, bodyAnchor, ARTICLE_PATH);

  const withHelper = source.replace(
    importAnchor,
    `${importAnchor}\n\nfunction getWordCount(text) {\n  if (typeof text !== "string" || !text.trim()) return 0;\n  return text.trim().split(/\\s+/).length;\n}`,
  );

  return withHelper.replace(
    bodyAnchor,
    `{body ? (\n              <>\n                <Markdown options={{ forceBlock: true }}>{body}</Markdown>\n                <p className="article-word-count">{getWordCount(body)} words</p>\n              </>\n            ) : null}`,
  );
}

function updateStyles(source) {
  if (source.includes(".article-word-count")) {
    return source;
  }

  const anchor = ".article-page .banner {";
  assertIncludes(source, anchor, STYLE_PATH);
  return source.replace(
    anchor,
    `.article-word-count {\n  margin-top: 1rem;\n  color: var(--text-light);\n  font-size: 0.85rem;\n}\n\n.article-page .banner {`,
  );
}

function assertIncludes(source, anchor, filePath) {
  if (!source.includes(anchor)) {
    throw new Error(`Skill article-detail-word-count missing anchor in ${filePath}`);
  }
}
