import { IPointer, Singleton, VariadicSingleton } from "tstl";
import ts from "typescript";

import { IEmbedTypeScriptDiagnostic } from "./IEmbedTypeScriptDiagnostic";
import { IEmbedTypeScriptFountain } from "./IEmbedTypeScriptFountain";
import { IEmbedTypeScriptProps } from "./IEmbedTypeScriptProps";
import { IEmbedTypeScriptResult } from "./IEmbedTypeScriptResult";
import { IEmbedTypeScriptTransformation } from "./IEmbedTypeScriptTransformation";

/**
 * Embedded TypeScript Compiler.
 *
 * `EmbedTypeScript` is a class that provides an embedded TypeScript
 * compiler functionality. It allows you to compile TypeScript code
 * directly in your application without requiring external build tools
 * or processes.
 *
 * This class encapsulates TypeScript's compiler API to provide
 * a simpler interface for compiling TypeScript code on-the-fly.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export class EmbedTypeScript {
  /**
   * Initializer constructor.
   *
   * Creates a new instance of the embedded TypeScript compiler with the
   * specified properties. Initializes the compiler environment with the
   * provided configuration options and external type definitions.
   *
   * @param props Properties for embedded TypeScript compiler, including
   *              compiler options and external definitions.
   */
  public constructor(private readonly props: IEmbedTypeScriptProps) {
    this.externalDefinitions = new Singleton(() =>
      Object.keys(this.props.external).filter((f) => f.endsWith(".d.ts")),
    );
  }

  /**
   * Compile TypeScript files.
   *
   * Processes and compiles the provided TypeScript files according to the
   * compiler configuration specified in the constructor. Handles both
   * successful compilations and compilation failures.
   *
   * If the compilation is successful, its returned type is
   * {@link IEmbedTypeScriptResult.ISuccess} with the generated JavaScript code.
   * If compilation errors occur, an {@link IEmbedTypeScriptResult.IFailure}
   * typed value will be returned with diagnostic information. If an
   * unexpected error occurs during compilation, an
   * {@link IEmbedTypeScriptResult.IException} will be returned with the
   * error details.
   *
   * @param files A record mapping file names to their TypeScript source code
   * @param fountainPointer Optional pointer to receive the fountain value
   * @returns A typed result indicating success, failure with diagnostics,
   *          or exception
   */
  public compile(
    files: Record<string, string>,
    fountainPointer?: IPointer<IEmbedTypeScriptFountain | null>,
  ): IEmbedTypeScriptResult {
    try {
      const base: IEmbedTypeScriptFountain = this.fountain(files);
      if (fountainPointer !== undefined) fountainPointer.value = base;
      base.program.emit(
        undefined,
        undefined,
        undefined,
        undefined,
        this.props.transformers?.(base.program, base.diagnostics) ?? undefined,
      );
      base.diagnostics.push(...ts.getPreEmitDiagnostics(base.program));
      if (base.diagnostics.length)
        return {
          type: "failure",
          javascript: base.javascript,
          diagnostics: base.diagnostics.map((x) => ({
            file: x.file?.fileName ?? null,
            category: EmbedTypeScript.getCategory(x.category),
            code: x.code,
            start: x.start,
            length: x.length,
            messageText: EmbedTypeScript.getMessageText(x.messageText),
          })),
        };
      return {
        type: "success",
        javascript: base.javascript,
      };
    } catch (error) {
      return this.throw(error);
    }
  }

  /**
   * Transform TypeScript files using custom transformers.
   *
   * Processes and transforms the provided TypeScript files according to the
   * transformers specified in the constructor. Unlike compilation which converts
   * TypeScript to JavaScript, this method performs source-to-source transformations
   * and returns modified TypeScript code.
   *
   * If the transformation is successful, the returned type is
   * {@link IEmbedTypeScriptTransformation.ISuccess} with the transformed TypeScript code.
   * If transformation errors occur, an {@link IEmbedTypeScriptTransformation.IFailure}
   * typed value will be returned with diagnostic information. If an
   * unexpected error occurs during transformation, an
   * {@link IEmbedTypeScriptTransformation.IException} will be returned with the
   * error details.
   *
   * @param files A record mapping file names to their TypeScript source code
   * @returns A typed result indicating success, failure with diagnostics,
   *          or exception
   */
  public transform(
    files: Record<string, string>,
  ): IEmbedTypeScriptTransformation {
    const transformers = this.props.transformers;
    if (transformers === undefined)
      throw new Error("Transformers are not defined in props.");
    try {
      const base: IEmbedTypeScriptFountain = this.fountain(files);
      const factory = transformers(base.program, base.diagnostics)
        .before?.[0] as ts.TransformerFactory<ts.SourceFile> | undefined;
      if (factory === undefined)
        throw new Error("No transformer factory provided in transformers.");

      const fileNames: string[] = Object.keys(files);
      const results: ts.TransformationResult<ts.SourceFile>[] = fileNames.map(
        (name) =>
          ts.transform(
            base.sourceFiles.get(name),
            [factory],
            base.program.getCompilerOptions(),
          ),
      );
      const printer: ts.Printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
      });
      const typescript: Record<string, string> = Object.fromEntries(
        results.map((r, i) => [
          fileNames[i],
          printer.printFile(r.transformed[0]),
        ]),
      );
      return base.diagnostics.length
        ? {
            type: "failure",
            typescript,
            diagnostics: base.diagnostics.map((x) => ({
              file: x.file?.fileName ?? null,
              category: EmbedTypeScript.getCategory(x.category),
              code: x.code,
              start: x.start,
              length: x.length,
              messageText: EmbedTypeScript.getMessageText(x.messageText),
            })),
          }
        : {
            type: "success",
            typescript,
          };
    } catch (error) {
      return this.throw(error);
    }
  }

  /**
   * Create TypeScript compiler foundation.
   *
   * Builds the foundational components required for TypeScript compilation,
   * including the TypeScript program, source files, and diagnostic collection.
   * This method sets up an in-memory TypeScript compiler environment with
   * virtual file system capabilities.
   *
   * The fountain provides access to the TypeScript compiler API primitives
   * needed for both compilation and transformation operations. It creates
   * source files from the provided file contents and external definitions,
   * initializes an empty JavaScript output container, and prepares a diagnostic
   * collection for capturing compilation issues.
   *
   * @param files A record mapping file names to their TypeScript source code
   * @returns An {@link IEmbedTypeScriptFountain} containing the TypeScript
   *          program, diagnostics array, JavaScript output container, and
   *          source file cache
   */
  public fountain(files: Record<string, string>): IEmbedTypeScriptFountain {
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
        fileExists: (f) =>
          !!files[canonical(f)] || !!this.props.external[canonical(f)],
        readFile: (f) =>
          files[canonical(f)] ?? this.props.external[canonical(f)],
        writeFile: (f, c) => (javascript[canonical(f)] = c),
        getSourceFile: (f) => sourceFiles.get(canonical(f)),
        getDefaultLibFileName: () =>
          "node_modules/typescript/lib/lib.es2015.d.ts",
        directoryExists: () => true,
        getCurrentDirectory: () => "",
        getDirectories: () => [],
        getNewLine: () => "\n",
        getCanonicalFileName: canonical,
        useCaseSensitiveFileNames: () => false,
        jsDocParsingMode: ts.JSDocParsingMode.ParseAll,
      },
    );
    return {
      program,
      diagnostics,
      javascript,
      sourceFiles,
    };
  }

  private throw(error: unknown): IEmbedTypeScriptResult.IException {
    return {
      type: "exception",
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

  private externalDefinitions: Singleton<string[]>;
}
export namespace EmbedTypeScript {
  /**
   * Convert TypeScript diagnostic category to standardized category.
   *
   * Maps TypeScript's internal {@link ts.DiagnosticCategory} enum values
   * to the simplified string-based categories used by embed-typescript.
   * This conversion provides a more convenient and type-safe way to work
   * with diagnostic severities.
   *
   * The mapping follows these rules:
   * - `ts.DiagnosticCategory.Message` → "message"
   * - `ts.DiagnosticCategory.Suggestion` → "suggestion"
   * - `ts.DiagnosticCategory.Warning` → "warning"
   * - `ts.DiagnosticCategory.Error` → "error" (default)
   *
   * @param value The TypeScript compiler's diagnostic category enum value
   * @returns A standardized category string: "message", "suggestion", "warning", or "error"
   */
  export const getCategory = (
    value: ts.DiagnosticCategory,
  ): IEmbedTypeScriptDiagnostic.Category => {
    if (value === ts.DiagnosticCategory.Message) return "message";
    else if (value === ts.DiagnosticCategory.Suggestion) return "suggestion";
    else if (value === ts.DiagnosticCategory.Warning) return "warning";
    return "error";
  };

  /**
   * Extract message text from TypeScript diagnostic.
   *
   * Converts TypeScript's diagnostic message format into a plain string.
   * TypeScript diagnostics can contain either simple strings or complex
   * message chains with nested context. This method flattens any message
   * chains into readable, newline-separated text.
   *
   * When the input is already a string, it returns it unchanged. When the
   * input is a {@link ts.DiagnosticMessageChain}, it uses TypeScript's
   * built-in flattening utility to convert the chain into a formatted string
   * with proper indentation and newline separators.
   *
   * @param text The diagnostic message text, either as a string or message chain
   * @returns A flattened string representation of the diagnostic message
   */
  export const getMessageText = (
    text: string | ts.DiagnosticMessageChain,
  ): string =>
    typeof text === "string"
      ? text
      : ts.flattenDiagnosticMessageText(text, "\n");
}

const canonical = (str: string) => str.split("\\").join("/");
