const PREVIEW_PATH = "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx";
const STYLE_PATH = "frontend/src/styles.css";
const READING_COUNT_BASE = 128;
const READING_COUNT_RANGE = 872;

export const articleListDisplayFieldSkill = Object.freeze({
  id: "article-list-display-field",
  version: "1.0.0",
  intent: "在文章列表卡片增加展示字段",
  appliesWhen: ["文章列表", "阅读量", "展示字段", "front-end display"],
  targetPaths: [PREVIEW_PATH, STYLE_PATH],
  validation: ["npm test"],
});

export async function applyArticleListDisplayField(sandbox) {
  const preview = await sandbox.readText(PREVIEW_PATH);
  const styles = await sandbox.readText(STYLE_PATH);

  await sandbox.writeText(PREVIEW_PATH, updatePreview(preview));
  await sandbox.writeText(STYLE_PATH, updateStyles(styles));

  return {
    changedFiles: [PREVIEW_PATH, STYLE_PATH],
    summary: "Article list cards now show a deterministic front-end read count.",
  };
}

function updatePreview(source) {
  if (source.includes("getReadingCount(article)")) {
    return source;
  }

  const componentAnchor = "function ArticlesPreview({ articles, loading, updateArticles }) {";
  const readMoreAnchor = /^(\s*)<span>Read more\.\.\.<\/span>$/m;
  assertIncludes(source, componentAnchor, PREVIEW_PATH);
  assertMatches(source, readMoreAnchor, PREVIEW_PATH);

  const withHelper = source.replace(
    componentAnchor,
    `${buildHelper()}\nfunction ArticlesPreview({ articles, loading, updateArticles }) {`,
  );

  return withHelper.replace(readMoreAnchor, buildReadMoreLine);
}

function updateStyles(source) {
  if (source.includes(".article-preview .reading-count")) {
    return source;
  }

  const styleAnchor = ".article-preview .preview-link ul {";
  assertIncludes(source, styleAnchor, STYLE_PATH);

  return source.replace(
    styleAnchor,
    `${buildReadingCountStyles()}\n.article-preview .preview-link ul {`,
  );
}

function assertIncludes(source, anchor, filePath) {
  if (!source.includes(anchor)) {
    throw new Error(`Skill article-list-display-field missing anchor in ${filePath}: ${anchor}`);
  }
}

function assertMatches(source, anchor, filePath) {
  if (!anchor.test(source)) {
    throw new Error(`Skill article-list-display-field missing anchor in ${filePath}: ${anchor}`);
  }
}

function buildReadMoreLine(match, indent) {
  const nestedIndent = `${indent}  `;
  return [
    `${indent}<span>Read more...</span>`,
    `${indent}<span className="reading-count">`,
    `${nestedIndent}<i className="ion-eye"></i> {getReadingCount(article)} reads`,
    `${indent}</span>`,
  ].join("\n");
}

function buildHelper() {
  return `const READING_COUNT_BASE = ${READING_COUNT_BASE};\nconst READING_COUNT_RANGE = ${READING_COUNT_RANGE};\n\nfunction getReadingCount(article) {\n  const seed = article.slug ?? article.title;\n  if (typeof seed !== "string" || seed.trim() === "") {\n    throw new Error("Article slug or title is required to calculate reading count");\n  }\n  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);\n  return READING_COUNT_BASE + (total % READING_COUNT_RANGE);\n}\n`;
}

function buildReadingCountStyles() {
  return `.article-preview .reading-count {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  margin-left: 0.75rem;\n  color: var(--text-light);\n  font-size: 0.8rem;\n  font-weight: 300;\n}\n\n.article-preview .reading-count .ion-eye {\n  font-size: 0.9rem;\n}`;
}
