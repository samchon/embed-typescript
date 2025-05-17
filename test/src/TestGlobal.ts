import cp from "child_process";
import fs from "fs";
import path from "path";
import { Singleton } from "tstl";

import { EmbedTypeScriptExternal } from "../../src/cli/EmbedTypeScriptExternal";

export namespace TestGlobal {
  export const ROOT = path.resolve(`${__dirname}/..`);

  export function getExternal(): Promise<Record<string, string>> {
    return external.get();
  }
}

const external = new Singleton(async () => {
  cp.execSync("npm install", {
    stdio: "ignore",
    cwd: path.join(TestGlobal.ROOT, 'compiler-dependencies'),
  });
  await EmbedTypeScriptExternal.execute({
    input: path.join(TestGlobal.ROOT, 'compiler-dependencies'),
    output: path.join(TestGlobal.ROOT, 'src', 'external.json'),
  });
  return JSON.parse(
    await fs.promises.readFile(path.join(TestGlobal.ROOT, 'src', 'external.json'), "utf-8"),
  );
});
