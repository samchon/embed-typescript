import { IEmbedTypeScriptProps } from "embed-typescript";

/**
 * Configuration properties for the EmbedEsLint compiler.
 *
 * This interface extends the TypeScript compiler configuration with
 * ESLint-specific options, allowing you to define linting rules that
 * will be applied during the compilation process.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IEmbedEsLintProps extends IEmbedTypeScriptProps {
  /**
   * ESLint rules configuration.
   *
   * A record mapping ESLint rule names to their severity levels or configurations.
   * Rules are typically specified in the format "@typescript-eslint/rule-name" for
   * TypeScript-specific rules, with values like "error", "warn", or "off".
   */
  rules: Record<string, string>;
}
