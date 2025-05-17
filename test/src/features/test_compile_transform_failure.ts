import { TestValidator } from "@nestia/e2e";
import {
  EmbedTypeScript,
  IEmbedTypeScriptResult,
} from "embed-typescript-compiler";
import ts from "typescript";
import typiaTransform from "typia/lib/transform";

export async function test_compile_transform_failure(): Promise<void> {
  const compiler: EmbedTypeScript = new EmbedTypeScript({
    external: await import("../external.json" as any),
    compilerOptions: {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.CommonJS,
      downlevelIteration: true,
      skipLibCheck: true,
      strict: true,
    },
    transformers: (program, diagnostics) => ({
      before: [
        typiaTransform(
          program,
          {},
          {
            addDiagnostic: (input) => diagnostics.push(input),
          },
        ),
      ],
    }),
  });
  const result: IEmbedTypeScriptResult = compiler.compile({
    "src/index.ts": `
      import typia from "typia";
      console.log(typia.llm.parameters<string, "chatgpt">());
    `,
  });
  TestValidator.equals("result")(result.type)("failure");
}
