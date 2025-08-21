# Embed-TypeScript Development Guide

Embed-TypeScript is a TypeScript library that enables embedding the TypeScript compiler directly into Node.js and browser applications. It provides a streamlined API for compiling TypeScript code on-the-fly without requiring external build tools.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Quick Setup & Build

### Prerequisites and Environment Setup
- Install pnpm globally: `npm install -g pnpm@10`
- Node.js version 20.x is recommended (matches CI environment)
- This is a pnpm workspace with main package at root and test package in `test/`

### Install Dependencies and Build
- `pnpm install` -- installs all dependencies including workspace packages. Takes ~7 seconds.
- `pnpm run build` -- builds the main package. Takes ~2-3 seconds. NEVER CANCEL.
- Test the build worked: `ls lib/` should show compiled .js, .d.ts, and .js.map files

### Run Tests
- `cd test && pnpm start` -- runs the complete test suite. Takes ~14 seconds total. NEVER CANCEL.
- Individual test scenarios include compilation success/failure, CLI external command, transform testing
- All tests must pass before making changes

### Code Formatting and Quality
- `pnpm prettier --write src/ test/src/` -- format all TypeScript source code
- `pnpm prettier --check src/ test/src/` -- check formatting without changes  
- Formatting check takes ~1 second
- **Note:** test/src/external.json will show prettier errors but can be ignored (auto-generated file)
- **ALWAYS run prettier before committing changes**

## CLI Tool Usage

The package provides a CLI tool for collecting external type definitions:

### Basic CLI Commands
- `node lib/cli/index.js help` -- shows CLI help and available commands
- `node lib/cli/index.js external --input <directory> --output <json>` -- collect external dependencies

### External Dependencies Collection
```bash
# Example: collect type definitions from a dependencies directory
node lib/cli/index.js external \
  --input test/compiler-dependencies \
  --output /tmp/external.json
```
- Takes <1 second to generate external.json file
- Input directory must contain package-lock.json and node_modules (installed with npm, not pnpm)
- Output is a large JSON file (~7MB) containing all .d.ts files from dependencies

## Validation Scenarios

After making changes, ALWAYS test these core scenarios:

### 1. Build and Test Cycle
```bash
pnpm run build  # Must complete in 2-3 seconds
cd test && pnpm start  # Must complete in ~14 seconds, all tests passing
```

### 2. CLI External Command
```bash  
node lib/cli/index.js external \
  --input test/compiler-dependencies \
  --output /tmp/test-external.json
# Verify: ls -la /tmp/test-external.json shows ~7MB file
```

### 3. Basic Compilation Test
The core functionality compiles TypeScript to JavaScript programmatically:
- Import `EmbedTypeScript` from lib/index.js
- Create compiler instance with compilerOptions and external type definitions
- Call `compiler.compile(files)` with TypeScript source code as Record<string, string>
- Result includes compiled JavaScript and diagnostic information

### 4. Code Formatting
```bash
pnpm prettier --check src/ test/src/  # Should show no formatting issues
```

## Important Project Locations

### Main Source Code
- `src/` -- main TypeScript library source
  - `src/EmbedTypeScript.ts` -- core compiler class
  - `src/index.ts` -- main exports  
  - `src/cli/` -- CLI tool implementation
  - `src/IEmbedTypeScript*.ts` -- TypeScript interfaces

### Test Code  
- `test/src/` -- comprehensive test suite
  - `test/src/features/` -- individual test scenarios
  - `test/src/TestGlobal.ts` -- shared test utilities
  - `test/compiler-dependencies/` -- test dependency collection setup

### Build Output
- `lib/` -- compiled JavaScript, declarations, and source maps (created by `pnpm run build`)

### Configuration Files
- `tsconfig.json` -- TypeScript compiler configuration (target: ES2016, strict mode)
- `test/tsconfig.json` -- test-specific TypeScript config (uses ts-patch for transformers)
- `prettier.config.js` -- code formatting rules
- `pnpm-workspace.yaml` -- pnpm workspace configuration
- `.github/workflows/` -- CI/CD workflows (build, release, typos)

## Development Workflows

### Making Changes to Core Library
1. Edit files in `src/`  
2. Run `pnpm run build` to compile changes
3. Run `cd test && pnpm start` to validate functionality
4. Run `pnpm prettier --write src/` to format code
5. Verify build works in CI environment (Ubuntu, Node.js 20.x, pnpm 10)

### Adding or Modifying Tests
1. Add test files in `test/src/features/` with `test_` prefix
2. Use existing patterns from other test files
3. Import from `../TestGlobal` for shared utilities
4. Run `cd test && pnpm start` to execute new tests

### CLI Tool Development
1. Edit files in `src/cli/`
2. Run `pnpm run build` 
3. Test CLI with `node lib/cli/index.js [command]`
4. Validate external dependency collection still works

## CI/CD Pipeline

### GitHub Actions Workflows
- **build.yml** -- runs on pull requests, tests Ubuntu + Node.js 20.x + pnpm 10
  - Installs dependencies with `pnpm install`
  - Builds main package with `pnpm run build`  
  - Runs tests with `cd test && pnpm start`
- **typos.yml** -- spell checking using crate-ci/typos
- **release.yml** -- handles package publishing

### Requirements for PR Success  
- All tests must pass (14 seconds total runtime)
- Code must be properly formatted with prettier
- Build must complete successfully  
- TypeScript compilation must complete without errors

## Common Issues and Solutions

### "Cannot find module 'typescript'" Errors
- TypeScript is a peer dependency, install it in your project
- Tests use workspace dependency resolution automatically

### CLI External Command Failures
- Ensure input directory has package-lock.json
- Directory must be installed with npm, not pnpm or yarn  
- Verify node_modules exists in input directory

### Build Failures
- Check TypeScript version compatibility (>=5.0.0 <6.0.0)
- Ensure all dependencies are installed with `pnpm install`
- Clear lib/ directory and rebuild if needed

### Test Failures
- Individual test scenarios have specific requirements
- test_cli_external depends on compiler-dependencies setup
- test_compile_* tests require proper external type definitions

Always run the complete validation cycle after making any changes to ensure compatibility and correctness.