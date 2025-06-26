import { TestValidator } from "@nestia/e2e";
import { EmbedTypeScript, IEmbedTypeScriptResult } from "embed-typescript";
import ts from "typescript";

import { TestGlobal } from "../TestGlobal";

export async function test_compile_import(): Promise<void> {
  const compiler: EmbedTypeScript = new EmbedTypeScript({
    external: await TestGlobal.getExternal(),
    compilerOptions: {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.CommonJS,
      downlevelIteration: true,
      skipLibCheck: true,
      strict: true,
    },
  });
  const result: IEmbedTypeScriptResult = compiler.compile({
    "src/api/structures/ISomething.ts": "export interface ISomething {}",
    "src/main.ts": `
      import { ISomethingX } from "./api/structures/ISomething";
      const x: ISomethingX = {};
      console.log(x);
    `,
  });
  TestValidator.equals("result")(result.type)("failure");
}
