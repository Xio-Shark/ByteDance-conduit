import "dotenv/config";
import { runP0Delivery } from "./orchestrator.js";
import { PROJECT_ROOT } from "./deliveryConfig.js";

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.error("Requirement input is required.");
  process.exit(1);
}

runP0Delivery({ input, projectRoot: PROJECT_ROOT })
  .then((result) => {
    console.log(JSON.stringify({
      runId: result.runId,
      status: result.status,
      stage: result.stage,
      evidenceDir: result.evidenceDir,
    }, null, 2));
    if (result.status !== "passed") {
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
