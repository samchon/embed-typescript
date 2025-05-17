import { EmbedTypeScriptExternal } from "embed-typescript-compiler/src/cli/EmbedTypeScriptExternal";

export async function test_cli_external(): Promise<void> {
  await EmbedTypeScriptExternal.execute({
    input: `${__dirname}/../../compiler-dependencies`,
    output: `${__dirname}/../external.json`,
  });
}
