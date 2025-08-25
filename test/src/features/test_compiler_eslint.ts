import { TestValidator } from "@nestia/e2e";
import { EmbedEsLint } from "embed-eslint";
import ts from "typescript";

import { TestGlobal } from "../TestGlobal";

export const test_fountain_eslint = async () => {
  const compiler: EmbedEsLint = new EmbedEsLint({
    external: await TestGlobal.getExternal(),
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      downlevelIteration: true,
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      noErrorTruncation: true,
    },
    rules: {
      "no-floating-promises": "error",
    },
  });
  const result = await compiler.compile({
    "src/api/structures/ISomething.ts": "export interface ISomething {}",
    "src/main.ts": `
        import { ISomething } from "./api/structures/ISomething";
        const x: ISomething = {};
        console.log(x);
      `,
    "src/something.ts": `
      fetch("something");
    `,
  });
  TestValidator.equals("result")(result.type)("failure");
  TestValidator.predicate(
    "reseult.diagnostics"
  )(
    () => result.type === "failure" &&
      result.diagnostics.some(d => d.messageText.includes("Promises must be awaited"))
  )
};
