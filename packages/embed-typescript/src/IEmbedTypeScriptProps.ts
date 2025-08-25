import ts from "typescript";

/**
 * Configuration properties for the EmbedTypeScript compiler.
 *
 * This interface defines the necessary configuration options required to
 * initialize and run the embedded TypeScript compiler, including compiler
 * options, external definitions, and optional custom transformers.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IEmbedTypeScriptProps {
  /**
   * TypeScript compiler options to use during compilation.
   *
   * These are the same options that would be specified in a tsconfig.json file,
   * controlling aspects like target ECMAScript version, module system, strict mode, etc.
   */
  compilerOptions: ts.CompilerOptions;

  /**
   * External TypeScript files and definitions.
   *
   * A record mapping file paths to their content, primarily used for
   * type definition files (.d.ts) that are needed during compilation
   * but aren't part of the files being compiled.
   */
  external: Record<string, string>;

  /**
   * Optional custom transformers to apply during compilation.
   *
   * A function that receives the TypeScript program and diagnostics array
   * and returns custom transformers to modify the compilation process.
   * This allows for advanced code manipulation during the compilation.
   *
   * @param program The TypeScript program representing the current compilation context.
   * @param diagnostics An array of diagnostics produced during the compilation.
   */
  transformers?: (
    program: ts.Program,
    diagnostics: ts.Diagnostic[],
  ) => ts.CustomTransformers;
}
