#!/usr/bin/env node
import { EmbedTypeScriptCliUtil } from "./EmbedTypeScriptCliUtil";
import { EmbedTypeScriptExternal } from "./EmbedTypeScriptExternal";

async function main(): Promise<void> {
  const type: string | undefined = process.argv[2];
  if (type === "help")
    EmbedTypeScriptCliUtil.halt("List of embed-typescript commands", 0);
  else if (type === "external") {
    const props: EmbedTypeScriptExternal.IProps =
      await EmbedTypeScriptExternal.getProperties();
    await EmbedTypeScriptExternal.execute(props);
  } else EmbedTypeScriptCliUtil.halt("Invalid command", -1);
}
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});
