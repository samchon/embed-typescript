import { IEmbedTypeScriptDiagnostic } from "./IEmbedTypeScriptDiagnostic";

/**
 * Result of a TypeScript compilation operation.
 *
 * This type represents the possible outcomes of a compilation operation,
 * which can be either a successful compilation, a compilation with errors
 * or warnings, or an unexpected error during the compilation process.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type IEmbedTypeScriptResult =
  | IEmbedTypeScriptResult.ISuccess
  | IEmbedTypeScriptResult.IFailure
  | IEmbedTypeScriptResult.IException;

export namespace IEmbedTypeScriptResult {
  /**
   * Represents a successful TypeScript compilation result.
   *
   * This interface is returned when compilation completes without
   * any errors or warnings, containing the generated JavaScript code
   * for each input file.
   */
  export interface ISuccess {
    /**
     * Indicates that the compilation was successful.
     */
    type: "success";

    /**
     * The compiled JavaScript code.
     *
     * A record mapping output file paths to their generated JavaScript content.
     */
    javascript: Record<string, string>;
  }

  /**
   * Represents a TypeScript compilation that completed but had errors
   * or warnings.
   *
   * This interface is returned when the compiler encountered issues during
   * compilation, containing both diagnostic information about the problems
   * and any JavaScript that was still able to be generated despite the issues.
   */
  export interface IFailure {
    /**
     * Indicates that the compilation had errors or warnings.
     */
    type: "failure";

    /**
     * Array of diagnostic messages describing the compilation issues.
     */
    diagnostics: IEmbedTypeScriptDiagnostic[];

    /**
     * Any JavaScript that was successfully generated despite the errors.
     *
     * This may be partial or empty depending on the severity of the issues.
     */
    javascript: Record<string, string>;
  }

  /**
   * Represents an unexpected error during the compilation process.
   *
   * This interface is returned when an exception or other unexpected error
   * occurs during compilation, rather than normal compilation errors.
   */
  export interface IException {
    /**
     * Indicates that an unexpected error occurred.
     */
    type: "exception";

    /**
     * The error that was thrown during compilation.
     */
    error: unknown;
  }
}
