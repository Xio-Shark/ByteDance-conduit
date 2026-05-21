import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

export async function verifyRun({ sandbox }) {
  const scripts = await sandbox.listPackageScripts();
  const checks = [
    await runLint({ sandbox, scripts }),
    await runScriptOrGap({ sandbox, scriptName: "test", scripts }),
  ];

  return {
    status: checks.every((check) => check.exitCode === 0) ? "passed" : "failed",
    checks,
  };
}

async function runLint({ sandbox, scripts }) {
  if (scripts.lint) {
    const result = await sandbox.runNpmScript("lint");
    return { ...result, source: "conduit-script" };
  }

  const result = await sandbox.runCommand("npm", ["run", "lint:sandbox"], PROJECT_ROOT);
  return { ...result, source: "implementation-lint-adapter" };
}

async function runScriptOrGap({ sandbox, scriptName, scripts }) {
  if (scripts[scriptName]) {
    return sandbox.runNpmScript(scriptName);
  }

  return {
    command: `npm run ${scriptName}`,
    exitCode: 1,
    status: "gap",
    source: "conduit-script",
    stdout: "",
    stderr: "",
    durationMs: 0,
    summary: `Conduit package.json has no ${scriptName} script`,
  };
}
