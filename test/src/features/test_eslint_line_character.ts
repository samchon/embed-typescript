import { TestValidator } from "@nestia/e2e";
import { EmbedEsLint } from "embed-eslint";
import { IEmbedTypeScriptResult } from "embed-typescript";
import ts from "typescript";

import { TestGlobal } from "../TestGlobal";

export const test_eslint_line_character = async (): Promise<void> => {
  const compiler: EmbedEsLint = new EmbedEsLint({
    external: await TestGlobal.getExternal(),
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
    },
    rules: {
      "no-floating-promises": "error",
    },
  });
  // Line 1: async function getData(): Promise<number> { return 1; }
  // Line 2: getData();
  //          ^ no-floating-promises (line 2, character 1)
  const source = [
    "async function getData(): Promise<number> { return 1; }",
    "getData();",
  ].join("\n");
  const result: IEmbedTypeScriptResult = compiler.compile({
    "src/index.ts": source,
  });
  TestValidator.equals("result.type")(result.type)("failure");
  if (result.type !== "failure") return;

  const diagnostic = result.diagnostics.find(
    (d) => d.messageText.includes("Promises must be awaited"),
  );
  TestValidator.predicate("diagnostic exists")(() => diagnostic !== undefined);
  TestValidator.equals("line")(diagnostic!.line)(2);
  TestValidator.equals("character")(diagnostic!.character)(1);
};
