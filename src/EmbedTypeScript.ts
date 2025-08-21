import { Singleton, VariadicSingleton } from "tstl";
import ts from "typescript";

import { IEmbedTypeScriptDiagnostic } from "./IEmbedTypeScriptDiagnostic";
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
   * @returns A typed result indicating success, failure with diagnostics,
   *          or exception
   */
  public compile(files: Record<string, string>): IEmbedTypeScriptResult {
    try {
      const { program, diagnostics, javascript } = this.prepare(files);
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
      const { program, diagnostics, sourceFiles } = this.prepare(files);
      const factory = transformers(program, diagnostics).before?.[0] as
        | ts.TransformerFactory<ts.SourceFile>
        | undefined;
      if (factory === undefined)
        throw new Error("No transformer factory provided in transformers.");

      const fileNames: string[] = Object.keys(files);
      const results: ts.TransformationResult<ts.SourceFile>[] = fileNames.map(
        (name) =>
          ts.transform(
            sourceFiles.get(name),
            [factory],
            program.getCompilerOptions(),
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
      return diagnostics.length
        ? {
            type: "failure",
            typescript,
            diagnostics: diagnostics.map((x) => ({
              file: x.file?.fileName ?? null,
              category: getCategory(x.category),
              code: x.code,
              start: x.start,
              length: x.length,
              messageText: getMessageText(x.messageText),
            })),
          }
        : {
            type: "success",
            typescript,
          };
    } catch (error) {
      return this.throw(
        error,
      );
    }
  }

  private prepare(files: Record<string, string>): ICompilerAsset {
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

function getCategory(
  value: ts.DiagnosticCategory,
): IEmbedTypeScriptDiagnostic.Category {
  if (value === ts.DiagnosticCategory.Message) return "message";
  else if (value === ts.DiagnosticCategory.Suggestion) return "suggestion";
  else if (value === ts.DiagnosticCategory.Warning) return "warning";
  return "error";
}

function getMessageText(text: string | ts.DiagnosticMessageChain): string {
  return typeof text === "string"
    ? text
    : ts.flattenDiagnosticMessageText(text, "\n");
}

interface ICompilerAsset {
  program: ts.Program;
  diagnostics: ts.Diagnostic[];
  javascript: Record<string, string>;
  sourceFiles: VariadicSingleton<ts.SourceFile, [file: string]>;
}
