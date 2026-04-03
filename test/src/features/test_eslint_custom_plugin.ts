import { TestValidator } from "@nestia/e2e";
import { EmbedEsLint } from "embed-eslint";
import { IEmbedTypeScriptResult } from "embed-typescript";
import { Rule } from "eslint";
import ts from "typescript";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";

const noConsoleLog: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      forbidden: "console.log is not allowed.",
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === "Identifier" &&
          node.object.name === "console" &&
          node.property.type === "Identifier" &&
          node.property.name === "log"
        ) {
          context.report({ node, messageId: "forbidden" });
        }
      },
    };
  },
};

export const test_eslint_custom_plugin = async () => {
  const compiler: EmbedEsLint = new EmbedEsLint({
    external: await TestGlobal.getExternal(),
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
    },
    plugins: {
      custom: {
        rules: {
          "no-console-log": noConsoleLog,
        },
      },
    },
    rules: {
      "custom/no-console-log": "error",
    },
  });

  // Should fail: code contains console.log
  const failure: IEmbedTypeScriptResult = compiler.compile({
    "src/index.ts": `console.log("hello");`,
  });
  typia.assert(failure);
  TestValidator.equals("failure")(failure.type)("failure");
  TestValidator.predicate("has custom rule diagnostic")(
    () =>
      failure.type === "failure" &&
      failure.diagnostics.some(
        (d) =>
          d.code === "custom/no-console-log" &&
          d.messageText === "console.log is not allowed.",
      ),
  );

  // Should succeed: code does not contain console.log
  const success: IEmbedTypeScriptResult = compiler.compile({
    "src/index.ts": `const x: number = 1; export { x };`,
  });
  typia.assert(success);
  TestValidator.equals("success")(success.type)("success");
};
