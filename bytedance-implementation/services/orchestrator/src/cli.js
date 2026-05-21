import "dotenv/config";
import { P0_INPUT } from "../../../libs/types/src/stages.js";
import { runP0Delivery } from "./orchestrator.js";

const input = process.argv.slice(2).join(" ");

runP0Delivery({ input: input || P0_INPUT })
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
