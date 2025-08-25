/**
 * Diagnostic information from TypeScript Compiler.
 *
 * Represents standardized diagnostic information (errors, warnings, etc.)
 * produced during TypeScript compilation. This interface provides a
 * simplified and consistent representation of TypeScript's internal
 * diagnostic structures.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IEmbedTypeScriptDiagnostic {
  /**
   * The filename where the diagnostic originated, or null if not file-specific.
   */
  file: string | null;

  /**
   * The severity category of the diagnostic (error, warning, suggestion, or message).
   */
  category: IEmbedTypeScriptDiagnostic.Category;

  /**
   * The error code or identifier associated with this diagnostic.
   */
  code: number | string;

  /**
   * The starting position of the issue in the source file, if available.
   */
  start: number | undefined;

  /**
   * The length of the problematic section in the source file, if available.
   */
  length: number | undefined;

  /**
   * The human-readable diagnostic message describing the issue.
   */
  messageText: string;
}
export namespace IEmbedTypeScriptDiagnostic {
  /**
   * Possible severity categories for diagnostics.
   *
   * - "warning": Issues that might cause problems but don't prevent compilation
   * - "error": Issues that prevent successful compilation
   * - "suggestion": Recommendations for code improvement
   * - "message": Informational notes without severity
   */
  export type Category = "warning" | "error" | "suggestion" | "message";
}
