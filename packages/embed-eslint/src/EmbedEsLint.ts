import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import * as tsParser from "@typescript-eslint/parser";
import {
  EmbedTypeScript,
  IEmbedTypeScriptDiagnostic,
  IEmbedTypeScriptFountain,
  IEmbedTypeScriptResult,
} from "embed-typescript";
import { Linter } from "eslint";
import { IPointer } from "tstl";
import ts from "typescript";

import { IEmbedEsLintProps } from "./IEmbedEsLintProps";

export class EmbedEsLint {
  private readonly tsc: EmbedTypeScript;
  private readonly linter: Linter;

  public constructor(private readonly props: IEmbedEsLintProps) {
    this.tsc = new EmbedTypeScript(props);
    this.linter = new Linter({ configType: "eslintrc" });

    this.linter.defineParser("@typescript-eslint/parser", tsParser);
    Object.entries(tsEslintPlugin.rules || {}).forEach(([ruleName, rule]) => {
      this.linter.defineRule(`@typescript-eslint/${ruleName}`, rule as any);
    });
  }

  public compile(files: Record<string, string>): IEmbedTypeScriptResult {
    const ptr: IPointer<IEmbedTypeScriptFountain | null> = { value: null };
    const result: IEmbedTypeScriptResult = this.tsc.compile(files, ptr);
    if (ptr.value === null) throw new Error("Failed to get fountain.");
    else if (result.type === "exception") return result;

    const diagnostics: IEmbedTypeScriptDiagnostic[] = [];
    for (const [key, value] of Object.entries(files)) {
      try {
        diagnostics.push(...this.compileFile(key, value, ptr.value.program));
      } catch {}
    }
    if (result.type === "failure")
      return {
        ...result,
        diagnostics: [...result.diagnostics, ...diagnostics],
      };
    else if (result.type === "success" && diagnostics.length !== 0)
      return {
        type: "failure",
        diagnostics,
        javascript: result.javascript,
      };
    return result;
  }

  /**
   * @internal
   */
  private compileFile(
    fileName: string,
    sourceCode: string,
    program: ts.Program,
  ): IEmbedTypeScriptDiagnostic[] {
    const eslintConfig = {
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      parserOptions: {
        programs: [program],
        tsconfigRootDir: ".",
        disallowAutomaticSingleRunInference: true,
      },
      rules: Object.fromEntries(
        Object.entries(this.props.rules).map(([key, value]) => [
          key.startsWith("@typescript-eslint/")
            ? key
            : `@typescript-eslint/${key}`,
          value,
        ]),
      ),
    };

    const messages: Linter.LintMessage[] = this.linter.verify(
      sourceCode,
      eslintConfig as any,
      { filename: fileName },
    );

    return messages.map((msg) => transformMessage(msg, fileName, sourceCode));
  }
}

/**
 * @internal
 */
const transformMessage = (
  message: Linter.LintMessage,
  fileName: string,
  sourceCode: string,
): IEmbedTypeScriptDiagnostic => {
  const start = getPositionFromLineColumn(
    sourceCode,
    message.line,
    message.column,
  );
  const end =
    message.endLine && message.endColumn
      ? getPositionFromLineColumn(
          sourceCode,
          message.endLine,
          message.endColumn,
        )
      : start + 1;

  return {
    category: message.severity === 2 ? "error" : "warning",
    code: message.ruleId || message.messageId || "eslint",
    file: {
      fileName,
      text: sourceCode,
      getLineAndCharacterOfPosition: (pos: number) => {
        const lines = sourceCode.split("\n");
        let currentPos = 0;
        for (let i = 0; i < lines.length; i++) {
          if (currentPos + lines[i].length >= pos) {
            return { line: i, character: pos - currentPos };
          }
          currentPos += lines[i].length + 1; // +1 for newline
        }
        return { line: 0, character: 0 };
      },
    } as any,
    start,
    length: end - start,
    messageText: message.message,
  };
};

/**
 * @internal
 */
const getPositionFromLineColumn = (
  sourceCode: string,
  line: number,
  column: number,
): number => {
  const lines = sourceCode.split("\n");
  let position = 0;

  // line은 1-based, 배열은 0-based이므로 line-1까지 반복
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    position += lines[i].length + 1; // +1 for newline character
  }

  // column도 1-based이므로 column-1을 더함
  return position + column - 1;
};
