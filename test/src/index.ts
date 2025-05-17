import { DynamicExecutor } from "@nestia/e2e";
import chalk from "chalk";
import path from "path";
import process from "process";

async function main(): Promise<void> {
  // DO TEST
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test_",
    location: path.join(__dirname, "features"),
    parameters: () => [],
    onComplete: (exec: DynamicExecutor.IExecution) => {
      const trace = (str: string) =>
        console.log(`  - ${chalk.green(exec.name)}: ${str}`);
      if (exec.value === false) {
        trace(chalk.gray("Pass"));
      } else if (exec.error === null) {
        const elapsed: number =
          new Date(exec.completed_at).getTime() -
          new Date(exec.started_at).getTime();
        trace(`${chalk.yellow(elapsed.toLocaleString())} ms`);
      } else {
        trace(chalk.red(exec.error.name));
      }
    },
    extension: "ts",
  });

  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const exp of exceptions) {
      console.log(exp);
    }
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
    process.exit(-1);
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
