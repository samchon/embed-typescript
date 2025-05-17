import ts from "typescript";

export interface IEmbedTypeScriptProps {
  compilerOptions: ts.CompilerOptions;
  external: Record<string, string>;
  transformers?: (
    program: ts.Program,
    diagnostics: ts.Diagnostic[]
  ) => ts.CustomTransformers;
}
