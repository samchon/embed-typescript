import cp from "child_process";
import { EmbedTypeScript, IEmbedTypeScriptResult } from "embed-typescript";
import fs from "fs";
import ts from "typescript";
import typiaTransform from "typia/lib/transform";

import { TestGlobal } from "../TestGlobal";

export async function test_compile_success(): Promise<void> {
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
    "src/index.ts": `
      import typia from "typia";
      console.log(typia.random<string>());
    `,
  });
  if (result.type !== "success") throw new Error("Compilation failed.");

  const directory: string = `${TestGlobal.ROOT}/bin`;
  try {
    await fs.promises.mkdir(directory, { recursive: true });
  } catch {}
  await fs.promises.writeFile(
    `${directory}/index.js`,
    result.javascript["src/index.js"],
    "utf8",
  );
  cp.execSync(`node index.js`, {
    stdio: "ignore",
    cwd: directory,
  });
}
