import assert from "node:assert/strict";
import test from "node:test";
import { verifyRun } from "./verificationAgent.js";

test("verifyRun fails when required test script is missing", async () => {
  const sandbox = createFakeSandbox({ scripts: {} });
  const verification = await verifyRun({ sandbox });
  const testCheck = verification.checks.find(
    (check) => check.command === "npm run test",
  );

  assert.equal(verification.status, "failed");
  assert.equal(testCheck.status, "gap");
  assert.equal(testCheck.source, "conduit-script");
  assert.equal(testCheck.exitCode, 1);
  assert.equal(testCheck.summary, "Conduit package.json has no test script");
});

test("verifyRun passes when lint and test commands pass", async () => {
  const sandbox = createFakeSandbox({
    scripts: { lint: "eslint .", test: "vitest" },
  });

  const verification = await verifyRun({ sandbox });

  assert.equal(verification.status, "passed");
  assert.deepEqual(
    verification.checks.map((check) => check.command),
    ["npm run lint", "npm run test"],
  );
  assert.equal(verification.checks[0].source, "conduit-script");
});

test("verifyRun marks implementation lint adapter when Conduit lint is absent", async () => {
  const sandbox = createFakeSandbox({
    scripts: { test: "vitest" },
  });

  const verification = await verifyRun({ sandbox });

  assert.equal(verification.status, "passed");
  assert.equal(verification.checks[0].command, "npm run lint:sandbox");
  assert.equal(verification.checks[0].source, "implementation-lint-adapter");
});

function createFakeSandbox({ scripts }) {
  return {
    listPackageScripts: async () => scripts,
    runNpmScript: async (scriptName) => ({
      command: `npm run ${scriptName}`,
      exitCode: 0,
      stdout: "",
      stderr: "",
      durationMs: 1,
    }),
    runCommand: async (command, args) => ({
      command: [command, ...args].join(" "),
      exitCode: 0,
      stdout: "",
      stderr: "",
      durationMs: 1,
    }),
  };
}
