# Embed-TypeScript-Compiler

Embed TypeScript Compiler into your application.

You can embed TypeScript compiler with `embed-typescript-compiler` both into NodeJS and Browser.

## Setup

```bash
npm install typescript
npm install embed-typescript-compiler
```

## How to Use

### Compilation

```typescript
import {
  EmbedTypeScript,
  IEmbedTypeScriptResult,
} from "embed-typescript-compiler";
import ts from "typescript";
import typiaTransform from "typia/lib/transform";

import external from "./external.json";

const compiler: EmbedTypeScript = new EmbedTypeScript({
  external: external as Record<string, string>,
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    downlevelIteration: true,
    esModuleInterop: true,
    skipLibCheck: true, // essential
    strict: true,
  },
  transformers: (program, diagnostics) => ({
    before: [
      typiaTransform(
        program,
        {},
        {
          addDiagnostic: (input) => diagnostics.push(input),
        }
      ),
    ],
  }),
});
const result: IEmbedTypeScriptResult = compiler.compile({
  "src/index.ts": `
    import typia from "typia";
    console.log(typia.random<string>());
  `,
});
if (result.type === "success") console.log(result.javascript);
```

### External Dependencies

```bash
# collect dependencies with npm
mkdir compiler-dependencies
cd compiler-dependencies
npm init
npm install @types/node @samchon/openapi typia

# build src/external.json
cd ..
npx embed-typescript-compiler external \
  --input ./compiler-dependencies \
  --output ./src/external.json
```

## Utilization Cases

- [typia playground](https://typia.io/playground)
- [`AutoBE` (AI vibe coding agent of backend) compiler feedback](https://github.com/wrtnlabs/autobe)
- [`AutoView` (AI frontend code generator from type) compiler feedback](https://github.com/wrtnlabs/autoview)
