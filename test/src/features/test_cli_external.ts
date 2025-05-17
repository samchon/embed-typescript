import { TestGlobal } from "../TestGlobal";

export async function test_cli_external(): Promise<void> {
  await TestGlobal.getExternal();
}
