export interface IEmbedTypeScriptDiagnostic {
  file: string | null;
  category: IEmbedTypeScriptDiagnostic.Category;
  code: number | string;
  start: number | undefined;
  length: number | undefined;
  messageText: string;
}
export namespace IEmbedTypeScriptDiagnostic {
  export type Category = "warning" | "error" | "suggestion" | "message";
}
