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

/**
 * Embedded TypeScript Compiler with ESLint Integration.
 *
 * `EmbedEsLint` extends the functionality of the embedded TypeScript
 * compiler by integrating ESLint linting capabilities. It provides
 * real-time code quality checking alongside TypeScript compilation,
 * converting ESLint violations into TypeScript diagnostic format for
 * unified error reporting.
 *
 * This class combines TypeScript compilation with ESLint rule checking,
 * allowing you to catch both type errors and code style issues in a
 * single compilation pass.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export class EmbedEsLint {
  private readonly tsc: EmbedTypeScript;
  private readonly linter: Linter;

  /**
   * Initializer constructor.
   *
   * Creates a new instance of the embedded TypeScript compiler with ESLint
   * integration. Initializes both the TypeScript compiler and ESLint linter
   * with the provided configuration, including TypeScript compiler options,
   * external definitions, and ESLint rules.
   *
   * @param props Properties for embedded TypeScript compiler with ESLint,
   *              including compiler options, external definitions, and ESLint rules.
   */
  public constructor(private readonly props: IEmbedEsLintProps) {
    this.tsc = new EmbedTypeScript(props);

    this.linter = new Linter({ configType: "eslintrc" });
    this.linter.defineParser("@typescript-eslint/parser", tsParser);
    Object.entries(tsEslintPlugin.rules || {}).forEach(([ruleName, rule]) => {
      this.linter.defineRule(`@typescript-eslint/${ruleName}`, rule as any);
    });
  }

  /**
   * Compile TypeScript files with ESLint validation.
   *
   * Performs TypeScript compilation followed by ESLint linting on the provided
   * files. This method first compiles the TypeScript code, then runs ESLint
   * validation on each file, converting any ESLint rule violations into
   * TypeScript diagnostic format for unified error reporting.
   *
   * If the compilation is successful and no ESLint violations are found,
   * returns {@link IEmbedTypeScriptResult.ISuccess} with the generated JavaScript.
   * If TypeScript compilation errors or ESLint violations occur, returns
   * {@link IEmbedTypeScriptResult.IFailure} with combined diagnostics.
   * If an exception occurs during processing, returns
   * {@link IEmbedTypeScriptResult.IException} with error details.
   *
   * @param files A record mapping file paths to their TypeScript source code content.
   * @returns The compilation result containing either generated JavaScript code,
   *          diagnostic information, or exception details.
   */
  public compile(files: Record<string, string>): IEmbedTypeScriptResult {
    const ptr: IPointer<IEmbedTypeScriptFountain | null> = { value: null };
    const result: IEmbedTypeScriptResult = this.tsc.compile(files, ptr);
    if (ptr.value === null) throw new Error("Failed to get fountain.");
    else if (result.type === "exception") return result;

    const diagnostics: IEmbedTypeScriptDiagnostic[] = [];
    for (const [key, value] of Object.entries(files))
      try {
        diagnostics.push(...this.compileFile(key, value, ptr.value.program));
      } catch {}
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
    file: fileName,
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
