import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";

const SUBMISSION_ITEMS = Object.freeze([
  { id: "demo", label: "在线 Demo 链接", status: "pending_human" },
  { id: "video", label: "3-8 分钟演示视频", status: "pending_human" },
  { id: "repository", label: "公开源代码仓库链接", status: "pending_human" },
  { id: "readme", label: "README / 运行说明", path: "README.md" },
  { id: "architecture", label: "系统架构说明", path: "docs/reports/submission/architecture.md" },
  { id: "ai_usage", label: "AI 使用说明", path: "docs/reports/submission/ai-usage.md" },
  { id: "engineering_notes", label: "工程难点说明", path: "docs/reports/submission/engineering-notes.md" },
  { id: "checklist", label: "提交清单", path: "docs/reports/submission/checklist.md" },
]);

export function buildSubmissionItems(projectRoot) {
  return SUBMISSION_ITEMS.map((item) => {
    if (!item.path) return { ...item };

    const absolutePath = path.join(projectRoot, item.path);
    return {
      id: item.id,
      label: item.label,
      path: item.path,
      status: submissionFileStatus(absolutePath),
    };
  });
}

function submissionFileStatus(absolutePath) {
  if (!existsSync(absolutePath)) return "missing";
  const content = readFileSync(absolutePath, "utf8");
  return content.trim() ? "generated" : "invalid";
}
