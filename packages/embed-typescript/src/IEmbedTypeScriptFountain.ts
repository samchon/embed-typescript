import { VariadicSingleton } from "tstl";
import ts from "typescript";

/**
 * TypeScript compiler foundation components.
 *
 * Represents the core components needed for TypeScript compilation
 * and transformation operations. This interface bundles together all
 * the essential TypeScript compiler API objects required to process
 * TypeScript source code.
 *
 * The fountain serves as a central container that provides access to
 * the TypeScript program instance, diagnostic collection, JavaScript
 * output storage, and source file cache. It acts as the foundation
 * upon which both compilation and transformation operations are built.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IEmbedTypeScriptFountain {
  /**
   * The TypeScript program instance.
   *
   * Core compiler API object that manages the compilation process,
   * provides type checking capabilities, and emits JavaScript output.
   * This program instance is configured with the compiler options
   * and virtual file system provided during fountain creation.
   */
  program: ts.Program;

  /**
   * Collection of compilation diagnostics.
   *
   * Accumulates all diagnostics (errors, warnings, suggestions, and messages)
   * encountered during compilation or transformation. This array is populated
   * by the TypeScript compiler as it processes source files and can be
   * examined to determine compilation success or failure.
   */
  diagnostics: ts.Diagnostic[];

  /**
   * JavaScript output storage.
   *
   * A record mapping output file names to their generated JavaScript content.
   * This object is populated during the emit phase of compilation when
   * TypeScript generates JavaScript from the source TypeScript files.
   * Keys are file paths and values are the compiled JavaScript code strings.
   */
  javascript: Record<string, string>;

  /**
   * Source file cache.
   *
   * A singleton cache that lazily creates and stores TypeScript source file
   * AST representations. This cache ensures that each source file is parsed
   * only once, improving performance when the same file is accessed multiple
   * times during compilation or transformation operations.
   *
   * The cache accepts a file path as parameter and returns the corresponding
   * parsed {@link ts.SourceFile} object.
   */
  sourceFiles: VariadicSingleton<ts.SourceFile, [file: string]>;
}
