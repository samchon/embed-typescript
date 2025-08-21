# Embed-TypeScript Development Guide for Claude

Embed-TypeScript is a TypeScript library that enables embedding the TypeScript compiler directly into Node.js and browser applications. It provides a streamlined API for compiling TypeScript code on-the-fly without requiring external build tools.

## Key Project Information

**Always reference this guide first when working with the embed-typescript codebase.**

### Essential Build & Test Commands

```bash
# Install dependencies (takes ~7 seconds)
pnpm install

# Build the project (takes ~2-3 seconds, never cancel)
pnpm run build

# Verify build worked - should show compiled .js, .d.ts, and .js.map files
ls lib/

# Run complete test suite (takes ~14 seconds total, never cancel)
cd test && pnpm start

# Format code before committing (always required)
pnpm prettier --write src/ test/src/
```

### Project Structure

```
src/                           # Main TypeScript library source
├── EmbedTypeScript.ts         # Core compiler class
├── index.ts                   # Main exports
├── cli/                       # CLI tool implementation
└── IEmbedTypeScript*.ts       # TypeScript interfaces

test/                          # Comprehensive test suite
├── src/features/              # Individual test scenarios (test_* prefix)
├── src/TestGlobal.ts          # Shared test utilities
└── compiler-dependencies/     # Test dependency collection setup

lib/                          # Compiled output (created by pnpm run build)
```

### Core Functionality

The library provides:

1. **EmbedTypeScript class** - Main compiler for TypeScript to JavaScript compilation
2. **CLI tool** - Collects external type definitions from npm packages
3. **Result interfaces** - Structured compilation results (success/failure/exception)
4. **Custom transformers** - Support for TypeScript transformer plugins

### CLI Usage

```bash
# Show help
node lib/cli/index.js help

# Collect external dependencies (must use npm-installed dependencies, not pnpm)
node lib/cli/index.js external \
  --input test/compiler-dependencies \
  --output /tmp/external.json
```

### Development Workflow

1. **Make changes** in `src/` directory
2. **Build** with `pnpm run build`
3. **Test** with `cd test && pnpm start`
4. **Format** with `pnpm prettier --write src/ test/src/`
5. **Validate** all tests pass before committing

### Common Requirements

- **Node.js 20.x** recommended (matches CI environment)
- **pnpm 10** as package manager (`npm install -g pnpm@10`)
- **TypeScript >=5.0.0 <6.0.0** as peer dependency
- **Prettier formatting** required before commits

### Testing Requirements

- All test files use `test_` prefix in `test/src/features/`
- Import shared utilities from `../TestGlobal`
- Complete test suite must pass (12-14 seconds runtime)
- Tests cover compilation success/failure, CLI commands, and transformers

### CI/CD Pipeline

- **build.yml** - Main workflow testing Ubuntu + Node.js 20.x + pnpm 10
- **typos.yml** - Spell checking
- **release.yml** - Package publishing

### Key Configuration Files

- `tsconfig.json` - Main TypeScript config (target: ES2016, strict mode)
- `test/tsconfig.json` - Test config with ts-patch for transformers
- `prettier.config.js` - Code formatting rules
- `pnpm-workspace.yaml` - Workspace configuration

### Important Notes

- Never cancel long-running build/test commands
- Always run prettier before committing changes
- Use minimal, surgical changes when modifying code
- External dependency collection requires npm (not pnpm) installation
- Tests must validate specific scenarios without breaking existing functionality

### Validation Checklist

Before any commit:

- [ ] Build completes successfully (`pnpm run build`)
- [ ] All tests pass (`cd test && pnpm start`)
- [ ] Code is properly formatted (`pnpm prettier --check src/ test/src/`)
- [ ] CLI external command works if modified CLI code
