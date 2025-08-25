import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import * as tsParser from "@typescript-eslint/parser";
import {
  EmbedTypeScript,
  IEmbedTypeScriptDiagnostic,
  IEmbedTypeScriptFountain,
  IEmbedTypeScriptProps,
  IEmbedTypeScriptResult,
} from "embed-typescript";
import { Linter } from "eslint";
import { IPointer } from "tstl";
import ts from "typescript";

export class EmbedESLint {
  private readonly tsc: EmbedTypeScript;

  public constructor(private readonly props: EmbedESLint.IProps) {
    this.tsc = new EmbedTypeScript(props);
  }

  public compile(files: Record<string, string>): IEmbedTypeScriptResult {
    // Normalize file paths to use forward slashes
    const normalizedFiles: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      const normalizedKey = key.split("\\").join("/");
      normalizedFiles[normalizedKey] = value;
    }

    const ptr: IPointer<IEmbedTypeScriptFountain | null> = {
      value: null,
    };
    const result: IEmbedTypeScriptResult = this.tsc.compile(
      normalizedFiles,
      ptr,
    );
    if (ptr.value === null)
      // unreachable code
      throw new Error("Faileld to get fountain.");
    else if (result.type !== "exception")
      try {
        const diagnostics: IEmbedTypeScriptDiagnostic[] = [];
        for (const [key, value] of Object.entries(normalizedFiles))
          diagnostics.push(...this.compileFile(key, value, ptr.value.program));
        if (result.type === "failure")
          return {
            ...result,
            diagnostics: [...result.diagnostics, ...diagnostics],
          };
        else if (result.type === "success" && diagnostics.length !== 0)
          return {
            ...result,
            diagnostics,
            type: "failure",
          };
      } catch (error) {
        return {
          type: "exception",
          error,
        };
      }
    return result;
  }

  private compileFile(
    fileName: string,
    sourceCode: string,
    program: ts.Program,
  ): IEmbedTypeScriptDiagnostic[] {
    const linter: Linter = new Linter({
      configType: "flat",
    });
    const config: Linter.Config[] = [
      {
        languageOptions: {
          parser: tsParser,
          parserOptions: {
            programs: [program],
          },
        },
        plugins: {
          "@typescript-eslint": tsEslintPlugin as any,
        },
        rules: Object.fromEntries(
          Object.entries(this.props.rules).map(([key, value]) => [
            `@typescript-eslint/${key}`,
            value,
          ]),
        ),
      },
    ];
    const report: Linter.FixReport = linter.verifyAndFix(
      sourceCode,
      config,
      fileName,
    );
    return report.messages.map((msg) =>
      transformMessage(msg, fileName, sourceCode),
    );
  }
}
export namespace EmbedESLint {
  export interface IProps extends IEmbedTypeScriptProps {
    rules: Record<string, any>;
  }
}

const transformMessage = (
  message: Linter.LintMessage,
  fileName: string,
  sourceCode: string,
): IEmbedTypeScriptDiagnostic => ({
  category: message.severity === 2 ? "error" : "warning",
  code: message.messageId ?? "eslint",
  file: {
    fileName,
    text: sourceCode,
    getLineAndCharacterOfPosition: () => ({
      line: message.line - 1,
      character: message.column - 1,
    }),
  } as any,
  start: 0, // ESLint doesn't provide exact positions
  length: 0,
  messageText: message.message,
});
