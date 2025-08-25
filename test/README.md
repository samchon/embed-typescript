# embed-typescript Test Suite

This directory contains comprehensive tests for the embed-typescript and embed-eslint packages.

## Overview

The test suite validates all major functionality of the embedded TypeScript compiler and ESLint integration, including:

- Basic TypeScript compilation
- Error handling and diagnostics
- Import resolution and module handling
- Path aliases and transformations
- ESLint rule enforcement
- CLI tools functionality

## Test Structure

```
test/
├── src/
│   ├── features/                    # Feature-specific tests
│   │   ├── test_compile_success.ts      # Successful compilation scenarios
│   │   ├── test_compile_failure.ts      # Compilation error handling
│   │   ├── test_compile_javascript.ts   # JavaScript file compilation
│   │   ├── test_compile_import.ts       # Module import resolution
│   │   ├── test_compile_alias.ts        # Path alias handling
│   │   ├── test_transform_success.ts    # Source transformation tests
│   │   ├── test_transform_failure.ts    # Transformation error handling
│   │   ├── test_compiler_eslint.ts      # ESLint integration tests
│   │   └── test_cli_external.ts         # CLI tool tests
│   │
│   ├── TestGlobal.ts               # Test utilities and helpers
│   ├── external.json               # External type definitions for tests
│   └── index.ts                    # Test runner entry point
│
├── compiler-dependencies/          # Test dependencies
│   └── package.json               # Dependencies for testing external imports
│
├── package.json                   # Test configuration
└── tsconfig.json                 # TypeScript configuration for tests
```

## Running Tests

### Prerequisites

Before running tests, make sure you have:

1. Built the packages:
   ```bash
   # From the root directory
   pnpm build
   ```

2. Installed test dependencies:
   ```bash
   cd test
   npm install
   ```

### Run All Tests

```bash
npm test
```

This will execute all test files in sequence and report the results.

### Run Specific Tests

To run a specific test file:

```bash
npx tsx src/features/test_compile_success.ts
```

## Test Categories

### 1. Compilation Tests

#### test_compile_success.ts
Tests successful TypeScript compilation scenarios:
- Basic TypeScript code compilation
- Type checking and inference
- Multiple file compilation
- Generated JavaScript validation

#### test_compile_failure.ts
Tests compilation error handling:
- Type errors detection
- Syntax error reporting
- Diagnostic message formatting
- Error recovery

#### test_compile_javascript.ts
Tests JavaScript file handling:
- `.js` file compilation
- Mixed TypeScript/JavaScript projects
- JavaScript with JSDoc comments

### 2. Module Resolution Tests

#### test_compile_import.ts
Tests import statement handling:
- Relative imports
- Package imports
- Type-only imports
- Dynamic imports

#### test_compile_alias.ts
Tests path alias resolution:
- TypeScript path mappings
- Alias in import statements
- Nested alias resolution

### 3. Transformation Tests

#### test_transform_success.ts
Tests source-to-source transformations:
- Custom transformer application
- AST manipulation
- Code generation

#### test_transform_failure.ts
Tests transformation error scenarios:
- Invalid transformer configuration
- Runtime transformation errors
- Error propagation

### 4. ESLint Integration Tests

#### test_compiler_eslint.ts
Tests ESLint rule enforcement:
- TypeScript-specific rules
- Type-aware linting rules
- Custom rule configuration
- Error reporting as diagnostics

### 5. CLI Tool Tests

#### test_cli_external.ts
Tests the external type definition extractor:
- Scanning node_modules
- Generating external.json
- Handling various package structures

## Writing New Tests

### Test Structure

Each test file follows this pattern:

```typescript
import { TestGlobal } from "../TestGlobal";
import { EmbedTypeScript } from "embed-typescript";

export const test_feature_name = async (): Promise<void> => {
  // Create compiler instance
  const compiler = new EmbedTypeScript({
    compilerOptions: {
      // Configure as needed
    },
  });

  // Perform compilation/testing
  const result = compiler.compile({
    "test.ts": `// Your test code here`
  });

  // Validate results
  TestGlobal.assert(
    result.success === true,
    "Compilation should succeed"
  );
};
```

### Test Utilities

The `TestGlobal` class provides helpful utilities:

```typescript
// Basic assertion
TestGlobal.assert(condition, "Error message");

// Error validation
TestGlobal.error("Expected error message", () => {
  // Code that should throw
});

// External definitions
import external from "../external.json";
```

### Adding a New Test

1. Create a new file in `src/features/` with the pattern `test_*.ts`
2. Export an async function that performs the test
3. Add the export to `src/index.ts`:
   ```typescript
   export * from "./features/test_your_feature";
   ```
4. Run the test to ensure it works

## Test Dependencies

The test suite uses several key dependencies:

- **embed-typescript**: The package being tested
- **embed-eslint**: ESLint integration being tested
- **tsx**: TypeScript execution for running tests
- **typia**: Used in transformation tests

## Debugging Tests

### Enable Verbose Output

Modify test files to log additional information:

```typescript
const result = compiler.compile({ /* ... */ });
console.log("Diagnostics:", result.diagnostics);
console.log("Output:", result.success ? result.value : null);
```

### Inspect Compilation Results

Check the full compilation output:

```typescript
if (result.success) {
  for (const [file, content] of Object.entries(result.value)) {
    console.log(`=== ${file} ===`);
    console.log(content);
  }
}
```

### Debug TypeScript Compiler

Enable TypeScript compiler tracing:

```typescript
const compiler = new EmbedTypeScript({
  compilerOptions: {
    traceResolution: true,
    extendedDiagnostics: true,
  },
});
```

## Common Issues

### External Definitions Not Found

If tests fail due to missing external definitions:

```bash
# Regenerate external.json
cd test
npx embed-typescript external --input ./compiler-dependencies --output ./src/external.json
```

### Module Resolution Failures

Ensure test dependencies are installed:

```bash
cd test/compiler-dependencies
npm install
```

### Type Checking Errors

Verify the TypeScript version matches:

```bash
npm list typescript
```

## Contributing

When adding new tests:

1. Follow the existing naming convention
2. Test both success and failure cases
3. Include clear error messages in assertions
4. Document any special setup required
5. Ensure tests are deterministic and repeatable

## License

This test suite is part of the embed-typescript project and is licensed under the MIT License.