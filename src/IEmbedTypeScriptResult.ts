import { IEmbedTypeScriptDiagnostic } from "./IEmbedTypeScriptDiagnostic";

export type IEmbedTypeScriptResult =
  | IEmbedTypeScriptResult.ISuccess
  | IEmbedTypeScriptResult.IError
  | IEmbedTypeScriptResult.IFailure;
export namespace IEmbedTypeScriptResult {
  export interface ISuccess {
    type: "success";
    javascript: Record<string, string>;
  }
  export interface IError {
    type: "error";
    error: unknown;
  }
  export interface IFailure {
    type: "failure";
    diagnostics: IEmbedTypeScriptDiagnostic[];
    javascript: Record<string, string>;
  }
}
