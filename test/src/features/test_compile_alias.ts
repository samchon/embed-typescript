import { TestValidator } from "@nestia/e2e";
import { EmbedTypeScript, IEmbedTypeScriptResult } from "embed-typescript";
import ts from "typescript";

import { TestGlobal } from "../TestGlobal";

export async function test_compile_alias(): Promise<void> {
  const alias: string = "@ORGANIZATION/PROJECT-api";
  const compiler: EmbedTypeScript = new EmbedTypeScript({
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
      baseUrl: "./",
      paths: {
        [alias]: ["./src/api"],
        [`${alias}/lib/*`]: ["./src/api/*"],
      },
    },
  });
  const result: IEmbedTypeScriptResult = compiler.compile({
    "src/api/structures/ISomething.ts": "export interface ISomething {}",
    "src/main.ts": `
        import { ISomethingX } from "@ORGANIZATION/PROJECT-api/lib/structures/ISomething";
        const x: ISomethingX = {};
        console.log(x);
      `,
  });
  TestValidator.equals("result")(result.type)("failure");
}
