import { TestValidator } from "@nestia/e2e";
import {
  EmbedTypeScript,
  IEmbedTypeScriptResult,
} from "embed-typescript-compiler";
import ts from "typescript";
import typiaTransform from "typia/lib/transform";

export async function test_compile_failure(): Promise<void> {
  const compiler: EmbedTypeScript = new EmbedTypeScript({
    external: (await import("../external.json")).default as Record<
      string,
      string
    >,
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
    "src/index.ts": `dasFASASFDDASFAsafasD;`,
  });
  TestValidator.equals("result")(result.type)("failure");
}
