import { TestValidator } from "@nestia/e2e";
import ts from "typescript";

import { TestGlobal } from "../TestGlobal";
import { EmbedESLint } from "../classes/EmbedESLint";

export const test_fountain_eslint = async () => {
  await process("ISomething", "success");
  // await process("ISomethingX", "failure");
};

const process = async (name: string, expected: "success" | "failure") => {
  const compiler: EmbedESLint = new EmbedESLint({
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
        import { ${name} } from "./api/structures/ISomething";
        const x: ${name} = {};
        console.log(x);
      `,
    "src/something.ts": `
      fetch("something");
    `,
  });
  if (result.type === "failure") console.log(result.diagnostics);
  else if (result.type === "exception") console.log(result.error);
  TestValidator.equals("result")(result.type)(expected);
};
