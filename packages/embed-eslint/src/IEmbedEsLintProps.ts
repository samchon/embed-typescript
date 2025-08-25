import { IEmbedTypeScriptProps } from "embed-typescript";

export interface IEmbedEsLintProps extends IEmbedTypeScriptProps {
  rules: Record<string, string>;
}
