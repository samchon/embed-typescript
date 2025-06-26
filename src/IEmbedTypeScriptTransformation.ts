import { IEmbedTypeScriptDiagnostic } from "./IEmbedTypeScriptDiagnostic";

/**
 * Result of a TypeScript source code transformation operation.
 *
 * This type represents the possible outcomes of a TypeScript transform API operation,
 * which performs source-to-source transformations on TypeScript code. Unlike compilation
 * which converts TypeScript to JavaScript, transformation modifies TypeScript code
 * while keeping it as TypeScript (e.g., adding decorators, modifying syntax, etc.).
 *
 * The transformation can result in:
 * - Successful transformation with modified TypeScript code
 * - Transformation with errors/warnings but partial results
 * - Unexpected errors during the transformation process
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type IEmbedTypeScriptTransformation =
  | IEmbedTypeScriptTransformation.ISuccess
  | IEmbedTypeScriptTransformation.IFailure
  | IEmbedTypeScriptTransformation.IException;

export namespace IEmbedTypeScriptTransformation {
  /**
   * Represents a successful TypeScript transformation result.
   *
   * This interface is returned when the transformation completes successfully
   * without any errors or warnings. The transformation process has successfully
   * modified the input TypeScript code according to the specified transformers,
   * producing valid transformed TypeScript code.
   */
  export interface ISuccess {
    /**
     * Indicates that the transformation was successful.
     */
    type: "success";

    /**
     * The transformed TypeScript code.
     *
     * A record mapping output file paths to their transformed TypeScript content.
     * Each key represents a file path, and the corresponding value contains
     * the transformed TypeScript source code for that file.
     */
    typescript: Record<string, string>;
  }

  /**
   * Represents a TypeScript transformation that completed but encountered errors
   * or warnings during the process.
   *
   * This interface is returned when the transformer encountered issues while
   * processing the source code. Despite the problems, some transformation
   * may have been completed, resulting in partial or potentially invalid
   * TypeScript output.
   */
  export interface IFailure {
    /**
     * Indicates that the transformation had errors or warnings.
     */
    type: "failure";

    /**
     * The transformed TypeScript code that was generated despite errors.
     *
     * A record mapping output file paths to their transformed TypeScript content.
     * This may contain partially transformed code or code with transformation
     * errors. The quality and completeness of the output depends on the
     * severity and type of issues encountered during transformation.
     */
    typescript: Record<string, string>;

    /**
     * Array of diagnostic messages describing the transformation issues.
     *
     * Contains detailed information about errors, warnings, and other issues
     * that occurred during the transformation process. These diagnostics help
     * identify what went wrong and where in the source code the problems occurred.
     */
    diagnostics: IEmbedTypeScriptDiagnostic[];
  }

  /**
   * Represents an unexpected error during the transformation process.
   *
   * This interface is returned when an exception or other unexpected error
   * occurs during the transformation operation, rather than normal transformation
   * errors that would be reported as diagnostics. This typically indicates
   * system-level errors, missing dependencies, or internal transformer failures.
   */
  export interface IException {
    /**
     * Indicates that an unexpected error occurred.
     */
    type: "exception";

    /**
     * The error that was thrown during transformation.
     *
     * Contains the raw error object that caused the transformation to fail
     * unexpectedly. This could be a system error, dependency error, or
     * internal transformer error that prevented the transformation from
     * completing normally.
     */
    error: unknown;
  }
}
