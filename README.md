# Embed-TypeScript-Compiler

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/embed-typescript-compiler/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/embed-typescript-compiler.svg)](https://www.npmjs.com/package/embed-typescript-compiler)
[![NPM Downloads](https://img.shields.io/npm/dm/embed-typescript-compiler.svg)](https://www.npmjs.com/package/embed-typescript-compiler)
[![Build Status](https://github.com/samchon/embed-typescript-compiler/workflows/build/badge.svg)](https://github.com/samchon/embed-typescript-compiler/actions?query=workflow%3Abuild)
[![Discord Badge](https://img.shields.io/badge/discord-samchon-d91965?style=flat&labelColor=5866f2&logo=discord&logoColor=white&link=https://discord.gg/E94XhzrUCZ)](https://discord.gg/E94XhzrUCZ)

A powerful library that enables embedding the TypeScript compiler directly into your applications, supporting both Node.js and browser environments.

`embed-typescript-compiler` provides a streamlined API to compile TypeScript code on-the-fly without requiring external build tools or processes. This makes it ideal for applications that need to dynamically compile TypeScript code, such as playgrounds, code editors, or automated code generation tools.

## Features

- Compile TypeScript code programmatically in any JavaScript environment
- Support for custom transformers during compilation
- Detailed diagnostic information for compilation errors
- Collection of external type definitions for dependency handling
- Command-line tool for gathering type definitions from npm packages

## Installation

```bash
npm install typescript
npm install embed-typescript-compiler
```

Note: TypeScript is a peer dependency that must be installed separately.

## Usage Guide

### Basic Compilation

The following example demonstrates how to create an embedded TypeScript compiler instance and compile some code:

```typescript
import {
  EmbedTypeScript,
  IEmbedTypeScriptResult,
} from "embed-typescript-compiler";
import ts from "typescript";
import typiaTransform from "typia/lib/transform";

import external from "./external.json";

// Create a compiler instance with custom configuration
const compiler: EmbedTypeScript = new EmbedTypeScript({
  // External type definitions (collected from npm packages)
  external: external as Record<string, string>,
  
  // TypeScript compiler options
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    downlevelIteration: true,
    esModuleInterop: true,
    skipLibCheck: true, // essential
    strict: true,
  },
  
  // Optional custom transformers (e.g., typia for runtime type validation)
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

// Compile TypeScript code
const result: IEmbedTypeScriptResult = compiler.compile({
  "src/index.ts": `
    import typia from "typia";
    console.log(typia.random<string>());
  `,
});

// Handle compilation result
if (result.type === "success") {
  // Access the compiled JavaScript
  console.log(result.javascript);
} else if (result.type === "failure") {
  // Handle compilation errors with detailed diagnostics
  console.error("Compilation failed:", result.diagnostics);
}
```

### Handling External Dependencies

To include type definitions from npm packages, you can use the included CLI tool to collect them:

```bash
# 1. Create a directory for dependencies and install required packages
mkdir compiler-dependencies
cd compiler-dependencies
npm init
npm install @types/node @samchon/openapi typia

# 2. Use the CLI tool to extract type definitions into a JSON file
cd ..
npx embed-typescript-compiler external \
  --input ./compiler-dependencies \
  --output ./src/external.json
```

The generated `external.json` file contains all the TypeScript definition files (`.d.ts`) from the installed packages, which can then be used with the `EmbedTypeScript` constructor as shown in the compilation example.

### Working with Compilation Results

The `compile` method returns an `IEmbedTypeScriptResult` which can be one of three types:

1. **Success** - Compilation completed without errors:
   ```typescript
   if (result.type === "success") {
     // Access the compiled JavaScript files
     const files = result.javascript; // Record<string, string>
     
     // Example: Execute the compiled code
     for (const [filename, code] of Object.entries(files)) {
       console.log(`Compiled ${filename}:`, code);
     }
   }
   ```

2. **Failure** - Compilation completed but with errors or warnings:
   ```typescript
   if (result.type === "failure") {
     // Handle compilation diagnostics
     for (const diagnostic of result.diagnostics) {
       console.error(`${diagnostic.file}: ${diagnostic.messageText}`);
     }
     
     // Note: Some JavaScript might still be generated despite errors
     console.log("Partial output:", result.javascript);
   }
   ```

3. **Exception** - An unexpected error occurred during compilation:
   ```typescript
   if (result.type === "exception") {
     console.error("Compilation process error:", result.error);
   }
   ```

## Real-World Applications

![Typia Playground](https://github.com/user-attachments/assets/2e60f5e8-a419-4f35-b9e4-71ae265d5785)

`embed-typescript-compiler` is used in several production applications:

- [`typia` playground](https://typia.io/playground) - TypeScript type to runtime function
- [`AutoBE`](https://github.com/wrtnlabs/autobe) - AI viral coding agent of backend server with compiler feedback
- [`AutoView`](https://github.com/wrtnlabs/autoview) - AI frontend code generator with compiler feedback
