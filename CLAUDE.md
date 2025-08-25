# embed-typescript Project Guide

## Project Overview

embed-typescript is a library that allows you to embed the TypeScript compiler in NodeJS and browser applications. You can compile and execute TypeScript code directly at runtime, with ESLint integration support.

## Key Features

- **In-memory compilation**: Compile TypeScript in memory without filesystem access
- **Browser support**: Works in both NodeJS and browser environments
- **ESLint integration**: Apply ESLint rules during TypeScript compilation
- **Custom transformers**: Support for transformer plugins like typia
- **Virtual filesystem**: Embed external definition files (.d.ts) as JSON

## Project Structure

```
embed-typescript/
├── packages/
│   ├── embed-typescript/     # Core TypeScript compiler package
│   │   ├── src/
│   │   │   ├── EmbedTypeScript.ts              # Main compiler class
│   │   │   ├── IEmbedTypeScriptProps.ts        # Compiler configuration interface
│   │   │   ├── IEmbedTypeScriptResult.ts       # Compilation result type
│   │   │   ├── IEmbedTypeScriptTransformation.ts # Transformation result type
│   │   │   ├── IEmbedTypeScriptDiagnostic.ts   # Diagnostic information type
│   │   │   ├── IEmbedTypeScriptFountain.ts     # Compiler components
│   │   │   └── cli/
│   │   │       ├── EmbedTypeScriptCliUtil.ts   # CLI utilities
│   │   │       └── EmbedTypeScriptExternal.ts  # External definition extractor
│   │   └── package.json
│   │
│   └── embed-eslint/        # ESLint integration package
│       ├── src/
│       │   ├── EmbedEsLint.ts              # ESLint integration class
│       │   └── IEmbedEsLintProps.ts        # ESLint configuration interface
│       └── package.json
│
├── test/                    # Test code
│   └── src/
│       └── features/       # Feature tests
│           ├── test_compile_success.ts      # Compilation success test
│           ├── test_compile_failure.ts      # Compilation failure test
│           ├── test_compile_javascript.ts   # JS file compilation test
│           ├── test_compile_import.ts       # Import handling test
│           ├── test_compile_alias.ts        # Path alias test
│           ├── test_transform_success.ts    # Transformation success test
│           ├── test_transform_failure.ts    # Transformation failure test
│           ├── test_compiler_eslint.ts      # ESLint integration test
│           └── test_cli_external.ts         # CLI test
│
├── deploy/                  # Deployment scripts
│   └── versions.js         # Version management script
│
├── package.json            # Root package configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── prettier.config.js      # Code formatting configuration
```

## Core Components

### EmbedTypeScript Class

The main compiler class providing the following functionality:

- `compile()`: Compile TypeScript to JavaScript
- `transform()`: Transform TypeScript source code (source-to-source)
- `fountain()`: Create compiler-based components

### Key Interfaces

- **IEmbedTypeScriptProps**: Compiler configuration
  - `compilerOptions`: TypeScript compiler options
  - `external`: External definition file map
  - `transformers`: Custom transformer factory

- **IEmbedTypeScriptResult**: Compilation result (success/failure/exception)
- **IEmbedTypeScriptTransformation**: Transformation result
- **IEmbedTypeScriptDiagnostic**: Diagnostic information

### EmbedEsLint Class

Extends EmbedTypeScript to add ESLint functionality:

- Passes TypeScript program context to ESLint
- Converts ESLint rule violations to TypeScript diagnostics
- Performs compilation and linting in a single pass

## Usage Examples

### Basic Compilation

```typescript
import { EmbedTypeScript } from "embed-typescript";
import ts from "typescript";

const compiler = new EmbedTypeScript({
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    strict: true,
  },
});

const result = compiler.compile({
  "src/index.ts": `
    interface User {
      id: number;
      name: string;
    }
    
    const user: User = { id: 1, name: "Alice" };
    console.log(user);
  `
});

if (result.success) {
  console.log(result.value["src/index.js"]);
}
```

### ESLint Integration

```typescript
import { EmbedEsLint } from "embed-eslint";

const compiler = new EmbedEsLint({
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
  },
  rules: {
    "no-floating-promises": "error",
    "no-unused-vars": "warn",
  },
});

const result = compiler.compile({
  "src/index.ts": `
    async function fetchData() {
      return { data: "test" };
    }
    
    fetchData(); // ESLint error: floating promise
  `
});
```

### Using External Definitions

```typescript
// 1. Extract external definitions (CLI)
// $ npx embed-typescript external

// 2. Use extracted definitions
import external from "./external.json";

const compiler = new EmbedTypeScript({
  external,
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
  },
});
```

## Development Guide

### Build Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter embed-typescript build

# Development mode (watch)
pnpm --filter embed-typescript dev
```

### Running Tests

```bash
# Navigate to test directory
cd test

# Run tests
npm test
```

### Package Deployment

```bash
# Update version and deploy with latest tag
pnpm package:latest

# Deploy with next tag
pnpm package:next
```

## Main Dependencies

- **typescript**: 5.0.0 or higher (peer dependency)
- **tstl**: TypeScript STL utility library
- **@typescript-eslint/parser**: ESLint TypeScript parser (embed-eslint)
- **@typescript-eslint/eslint-plugin**: TypeScript ESLint rules (embed-eslint)

## Use Cases

1. **Online code editors**: Real-time TypeScript compilation in the browser
2. **Plugin systems**: Load and execute TypeScript plugins at runtime
3. **Code generators**: Dynamically generate and validate TypeScript code
4. **Educational tools**: Build TypeScript learning environments
5. **Test environments**: Generate and execute dynamic test code

## Important Notes

- External module resolution is limited in browser environments
- Be mindful of memory usage when compiling large codebases
- Pre-compiled code is recommended for production environments

## Troubleshooting

### Cannot Find External Module

```bash
# Generate external.json
npx embed-typescript external
```

### Out of Memory

Disable unnecessary features in compiler options:

```typescript
{
  skipLibCheck: true,
  skipDefaultLibCheck: true,
}
```

### ESLint Rules Not Applied

Ensure ESLint and TypeScript configurations are compatible.

## Contributing Guide

1. Create an issue first to discuss changes
2. Follow existing code style
3. Add or update tests
4. Ensure all tests pass before creating a PR