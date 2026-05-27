const TAG_BUTTON_PATH = "frontend/src/components/PopularTags/TagButton.jsx";
const STYLE_PATH = "frontend/src/styles.css";
const TOP_TAG_COUNT = 5;

export const popularTagsTopFiveSkill = Object.freeze({
  id: "popular-tags-top-five",
  version: "1.0.0",
  intent: "为 Popular Tags 侧边栏前 5 个标签增加醒目标记",
  appliesWhen: ["Popular Tags", "热门标签", "前5", "前 5", "打标", "tag"],
  targetPaths: [TAG_BUTTON_PATH, STYLE_PATH],
  validation: ["npm run lint:sandbox", "npm test"],
});

export async function applyPopularTagsTopFive(sandbox) {
  const tagButton = await sandbox.readText(TAG_BUTTON_PATH);
  const styles = await sandbox.readText(STYLE_PATH);

  await sandbox.writeText(TAG_BUTTON_PATH, updateTagButton(tagButton));
  await sandbox.writeText(STYLE_PATH, updateStyles(styles));

  return {
    changedFiles: [TAG_BUTTON_PATH, STYLE_PATH],
    summary: `Popular Tags now highlight the first ${TOP_TAG_COUNT} tags with a featured badge.`,
  };
}

function updateTagButton(source) {
  if (source.includes("tag-top-five")) {
    return source;
  }

  const mapAnchor = "return tagsList.slice(0, 50).map((name) => (";
  const buttonAnchor = `<button className="tag-pill tag-default" key={name} onClick={handleClick}>
      {name}
    </button>`;
  assertIncludes(source, mapAnchor, TAG_BUTTON_PATH);
  assertIncludes(source, buttonAnchor, TAG_BUTTON_PATH);

  return source
    .replace(mapAnchor, "return tagsList.slice(0, 50).map((name, index) => (")
    .replace(
      buttonAnchor,
      `<button
      className={\`tag-pill tag-default\${index < ${TOP_TAG_COUNT} ? " tag-top-five" : ""}\`}
      key={name}
      onClick={handleClick}
    >
      {index < ${TOP_TAG_COUNT} ? <span className="tag-rank">Top {index + 1}</span> : null}
      {name}
    </button>`,
    );
}

function updateStyles(source) {
  if (source.includes(".tag-top-five")) {
    return source;
  }

  const anchor = ".tag-pill {";
  assertIncludes(source, anchor, STYLE_PATH);

  return source.replace(
    anchor,
    `${buildTopTagStyles()}\n.tag-pill {`,
  );
}

function buildTopTagStyles() {
  return `.tag-top-five {
  border-color: var(--themeColor);
  background: rgba(60, 137, 255, 0.12);
  font-weight: 600;
}

.tag-top-five .tag-rank {
  display: inline-block;
  margin-right: 0.35rem;
  padding: 0.05rem 0.35rem;
  border-radius: 0.25rem;
  background: var(--themeColor);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}`;
}

function assertIncludes(source, anchor, filePath) {
  if (!source.includes(anchor)) {
    throw new Error(`Skill popular-tags-top-five missing anchor in ${filePath}: ${anchor}`);
  }
}
