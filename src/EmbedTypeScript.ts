import { Singleton, VariadicSingleton } from "tstl";
import ts from "typescript";

import { IEmbedTypeScriptDiagnostic } from "./IEmbedTypeScriptDiagnostic";
import { IEmbedTypeScriptProps } from "./IEmbedTypeScriptProps";
import { IEmbedTypeScriptResult } from "./IEmbedTypeScriptResult";

export class EmbedTypeScript {
  private externalDefinitions: Singleton<string[]>;

  /**
   * Initializer constructor.
   *
   * @param props Properties for embedded TypeScript compiler.
   */
  public constructor(private readonly props: IEmbedTypeScriptProps) {
    this.externalDefinitions = new Singleton(() =>
      Object.keys(this.props.external).filter((f) => f.endsWith(".d.ts")),
    );
  }

  /**
   * Compile TypeScript files.
   *
   * @param files TypeScript files to compile
   * @returns Compilation result
   */
  public compile(files: Record<string, string>): IEmbedTypeScriptResult {
    try {
      return this.processCompile(files);
    } catch (error) {
      return {
        type: "error",
        error:
          error instanceof Error
            ? {
                ...error,
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      };
    }
  }

  private processCompile(
    files: Record<string, string>,
  ): IEmbedTypeScriptResult {
    const sourceFiles = new VariadicSingleton((f: string) =>
      ts.createSourceFile(
        f,
        this.props.external[f] ?? files[f] ?? "",
        ts.ScriptTarget.ESNext,
      ),
    );
    const diagnostics: ts.Diagnostic[] = [];
    const javascript: Record<string, string> = {};
    const program: ts.Program = ts.createProgram(
      [...Object.keys(files), ...this.externalDefinitions.get()],
      this.props.compilerOptions,
      {
        fileExists: (f) => !!files[f] || !!this.props.external[f],
        readFile: (f) => files[f] ?? this.props.external[f],
        writeFile: (f, c) => (javascript[f] = c),
        getSourceFile: (f) => sourceFiles.get(f),
        getDefaultLibFileName: () =>
          "node_modules/typescript/lib/lib.es2015.d.ts",
        directoryExists: () => true,
        getCurrentDirectory: () => "",
        getDirectories: () => [],
        getNewLine: () => "\n",
        getCanonicalFileName: (f) => f,
        useCaseSensitiveFileNames: () => false,
        jsDocParsingMode: ts.JSDocParsingMode.ParseAll,
      },
    );
    program.emit(
      undefined,
      undefined,
      undefined,
      undefined,
      this.props.transformers?.(program, diagnostics) ?? undefined,
    );
    diagnostics.push(...ts.getPreEmitDiagnostics(program));
    if (diagnostics.length)
      return {
        type: "failure",
        javascript,
        diagnostics: diagnostics.map((x) => ({
          file: x.file?.fileName ?? null,
          category: getCategory(x.category),
          code: x.code,
          start: x.start,
          length: x.length,
          messageText: getMessageText(x.messageText),
        })),
      };
    return {
      type: "success",
      javascript,
    };
  }
}

function getCategory(
  value: ts.DiagnosticCategory,
): IEmbedTypeScriptDiagnostic.Category {
  if (value === ts.DiagnosticCategory.Message) return "message";
  else if (value === ts.DiagnosticCategory.Suggestion) return "suggestion";
  else if (value === ts.DiagnosticCategory.Warning) return "warning";
  return "error";
}

function getMessageText(text: string | ts.DiagnosticMessageChain): string {
  return typeof text === "string" ? text : text.messageText;
}
