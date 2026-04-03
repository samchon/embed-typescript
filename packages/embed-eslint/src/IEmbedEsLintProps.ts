import { IEmbedTypeScriptProps } from "embed-typescript";
import { Linter } from "eslint";

import { IEmbedEsLintPlugin } from "./IEmbedEsLintPlugin";

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
   * Custom ESLint plugins to register.
   *
   * A record mapping plugin names to their implementations.
   * Each plugin's rules are registered with the linter under the
   * `"plugin-name/rule-name"` namespace and can then be enabled
   * via the {@link rules} option.
   *
   * @example
   * ```typescript
   * plugins: {
   *   autobe: {
   *     rules: {
   *       "no-unsafe-repo-call": myCustomRule,
   *     },
   *   },
   * },
   * rules: {
   *   "autobe/no-unsafe-repo-call": "error",
   * },
   * ```
   */
  plugins?: Record<string, IEmbedEsLintPlugin>;

  /**
   * ESLint rules configuration.
   *
   * A record mapping ESLint rule names to their severity levels or
   * structured configurations. Rules without a namespace prefix
   * (i.e. no `/` in the name) are automatically treated as
   * `@typescript-eslint` rules.
   *
   * @example
   * ```typescript
   * rules: {
   *   // Shorthand — auto-prefixed to "@typescript-eslint/no-floating-promises"
   *   "no-floating-promises": "error",
   *   // Explicit namespace
   *   "@typescript-eslint/no-unused-vars": "warn",
   *   // With options
   *   "@typescript-eslint/naming-convention": ["error", { selector: "interface", format: ["PascalCase"] }],
   *   // Custom plugin rule
   *   "autobe/no-unsafe-repo-call": "error",
   * }
   * ```
   */
  rules: Linter.RulesRecord;
}
