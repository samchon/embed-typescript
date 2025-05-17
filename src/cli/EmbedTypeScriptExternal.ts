import fs from "fs";
import path from "path";

import { EmbedTypeScriptCliUtil } from "./EmbedTypeScriptCliUtil";

export namespace EmbedTypeScriptExternal {
  export interface IProps {
    input: string;
    output: string;
  }

  export async function getProperties(): Promise<IProps> {
    const input: string | null = EmbedTypeScriptCliUtil.getArgument("input");
    const output: string | null = EmbedTypeScriptCliUtil.getArgument("output");
    if (input === null || output === null)
      EmbedTypeScriptCliUtil.halt("Wrong command detected", -1);
    else if (output.endsWith(".json") === false)
      EmbedTypeScriptCliUtil.halt("Output file must be a json file", -1);
    else if (fs.existsSync(input) === false)
      EmbedTypeScriptCliUtil.halt("Input directory not found", -1);
    else if ((await fs.promises.stat(input)).isDirectory() === false)
      EmbedTypeScriptCliUtil.halt("Input is not a directory", -1);
    else if (fs.existsSync(path.join(input, "node_modules")) === false)
      EmbedTypeScriptCliUtil.halt(
        "node_modules not found in input directory",
        -1,
      );
    else if (fs.existsSync(path.join(input, "package-lock.json")) === false)
      EmbedTypeScriptCliUtil.halt(
        "package-lock.json not found in input directory",
        -1,
      );
    return {
      input: path.resolve(input),
      output: path.resolve(output),
    };
  }

  export async function execute(props: {
    input: string;
    output: string;
  }): Promise<void> {
    const container: Record<string, string> = await getExternal(props.input);
    try {
      await fs.promises.mkdir(path.dirname(props.output), { recursive: true });
    } catch {}
    await fs.promises.writeFile(
      props.output,
      JSON.stringify(container, null, 2),
      "utf-8",
    );
  }
}

async function getExternal(input: string): Promise<Record<string, string>> {
  // GET PACKAGE-LOCK.JSON
  interface IPackageJson {
    packages: Record<string, unknown>;
  }
  const { packages }: IPackageJson = JSON.parse(
    await fs.promises.readFile(path.join(input, "package-lock.json"), "utf-8"),
  );
  const dependencies: string[] = Object.keys(packages)
    .filter((lib) => lib.startsWith("node_modules/"))
    .map((lib) => lib.substring("node_modules/".length));
  const container: Record<string, string> = {};
  for (const lib of dependencies)
    await collectPackage({
      container,
      library: lib,
      root: path.join(input, "node_modules", lib),
    });
  return container;
}

async function collectPackage(props: {
  container: Record<string, string>;
  library: string;
  root: string;
}): Promise<void> {
  async function iterate(location: string): Promise<void> {
    const directory: string[] = await fs.promises.readdir(location);
    for (const file of directory) {
      const next: string = `${location}/${file}`;
      const stats: fs.Stats = await fs.promises.stat(next);
      if (file === "node_modules" && stats.isDirectory())
        for (const nextLib of await fs.promises.readdir(next)) {
          const nextRoot: string = `${next}/${nextLib}`;
          const nextStats: fs.Stats = await fs.promises.stat(nextRoot);
          if (
            nextStats.isDirectory() &&
            fs.existsSync(`${nextRoot}/package.json`)
          )
            await collectPackage({
              container: props.container,
              library: nextLib,
              root: nextRoot,
            });
        }
      else if (stats.isDirectory()) await iterate(next);
      else if (
        file.endsWith(".d.ts") ||
        (location == props.root && file === "package.json")
      ) {
        props.container[
          `node_modules/${props.library}${next.substring(props.root.length)}`
        ] = await fs.promises.readFile(next, "utf8");
      }
    }
  }
  await iterate(props.root);
}
