import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

export async function createEvidenceWriter(runId) {
  const runDir = path.join(PROJECT_ROOT, "docs/reports/runs", runId);
  await mkdir(runDir, { recursive: true });

  return {
    runDir,
    writeJson(name, data) {
      return writeFile(
        path.join(runDir, name),
        `${JSON.stringify(data, null, 2)}\n`,
        "utf8",
      );
    },
    writeText(name, data) {
      return writeFile(path.join(runDir, name), data, "utf8");
    },
  };
}

export function markdownFromObject(title, data) {
  return `# ${title}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
}
