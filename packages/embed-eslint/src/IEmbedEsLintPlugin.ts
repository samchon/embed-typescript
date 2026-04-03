import { Rule } from "eslint";

/**
 * An ESLint plugin containing custom rule implementations.
 *
 * Each plugin groups related rules under a shared namespace.
 * When registering a plugin under the key `"my-plugin"`, its rules
 * become available as `"my-plugin/rule-name"` in the {@link IEmbedEsLintProps.rules} config.
 */
export interface IEmbedEsLintPlugin {
  /**
   * A record mapping rule names (without namespace prefix) to their implementations.
   */
  rules: Record<string, Rule.RuleModule>;
}
