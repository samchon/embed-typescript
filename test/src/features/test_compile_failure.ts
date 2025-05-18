import { TestValidator } from "@nestia/e2e";
import {
  EmbedTypeScript,
  IEmbedTypeScriptResult,
} from "embed-typescript";
import ts from "typescript";
import typiaTransform from "typia/lib/transform";

import { TestGlobal } from "../TestGlobal";

export async function test_compile_failure(): Promise<void> {
  const compiler: EmbedTypeScript = new EmbedTypeScript({
    external: await TestGlobal.getExternal(),
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
