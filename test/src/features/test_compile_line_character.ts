import { TestValidator } from "@nestia/e2e";
import { EmbedTypeScript, IEmbedTypeScriptResult } from "embed-typescript";
import ts from "typescript";

import { TestGlobal } from "../TestGlobal";

export async function test_compile_line_character(): Promise<void> {
  const compiler: EmbedTypeScript = new EmbedTypeScript({
    external: await TestGlobal.getExternal(),
    compilerOptions: {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      skipLibCheck: true,
    },
  });
  // Line 1: const a: number = 1;
  // Line 2: const b: string = "world";
  // Line 3: const c: number = "hello";
  //               ^ TS2322 (line 3, character 7)
  const source = [
    "const a: number = 1;",
    'const b: string = "world";',
    'const c: number = "hello";',
  ].join("\n");
  const result: IEmbedTypeScriptResult = compiler.compile({
    "src/index.ts": source,
  });
  TestValidator.equals("result.type")(result.type)("failure");
  if (result.type !== "failure") return;

  const diagnostic = result.diagnostics.find(
    (d) => d.file === "src/index.ts" && d.code === 2322,
  );
  TestValidator.predicate("diagnostic exists")(() => diagnostic !== undefined);
  TestValidator.equals("line")(diagnostic!.line)(3);
  TestValidator.equals("character")(diagnostic!.character)(7);
}
