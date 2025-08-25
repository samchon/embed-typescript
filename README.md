# embed-typescript

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/embed-typescript/blob/master/LICENSE)
[![Build Status](https://github.com/samchon/embed-typescript/workflows/build/badge.svg)](https://github.com/samchon/embed-typescript/actions?query=workflow%3Abuild)
[![Discord Badge](https://img.shields.io/badge/discord-samchon-d91965?style=flat&labelColor=5866f2&logo=discord&logoColor=white&link=https://discord.gg/E94XhzrUCZ)](https://discord.gg/E94XhzrUCZ)

Embed TypeScript and ESLint compilers in your NodeJS/Browser Application.

## Packages

This monorepo contains two packages that work together to provide embedded TypeScript compilation with optional ESLint integration:

| Package | NPM | Description |
|---------|-----|-------------|
| [embed-typescript](./packages/embed-typescript) | [![NPM Version](https://img.shields.io/npm/v/embed-typescript.svg)](https://www.npmjs.com/package/embed-typescript) [![NPM Downloads](https://img.shields.io/npm/dm/embed-typescript.svg)](https://www.npmjs.com/package/embed-typescript) | Core TypeScript compiler embedding |
| [embed-eslint](./packages/embed-eslint) | [![NPM Version](https://img.shields.io/npm/v/embed-eslint.svg)](https://www.npmjs.com/package/embed-eslint) [![NPM Downloads](https://img.shields.io/npm/dm/embed-eslint.svg)](https://www.npmjs.com/package/embed-eslint) | ESLint integration for embedded TypeScript |

## Overview

The embed-typescript project enables you to compile TypeScript code directly within your application at runtime, without requiring external build tools or processes. This is particularly useful for:

- **Online code editors** and playgrounds
- **Dynamic plugin systems** that accept TypeScript code
- **Code generation tools** that need to validate generated TypeScript
- **Educational platforms** for teaching TypeScript
- **Testing environments** that generate test code dynamically

## Quick Start

### Basic TypeScript Compilation

```bash
npm install typescript embed-typescript
```

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
    const greeting: string = "Hello, World!";
    console.log(greeting);
  `
});

if (result.success) {
  console.log(result.value["src/index.js"]);
  // Output: compiled JavaScript code
}
```

### With ESLint Integration

```bash
npm install typescript embed-typescript embed-eslint
```

```typescript
import { EmbedEsLint } from "embed-eslint";

const compiler = new EmbedEsLint({
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
  },
  rules: {
    "no-floating-promises": "error",
    "@typescript-eslint/no-unused-vars": "warn",
  },
});

const result = compiler.compile({
  "src/index.ts": `
    async function fetchData() {
      return { data: "test" };
    }
    
    fetchData(); // Will trigger ESLint error
  `
});

if (!result.success) {
  console.log("ESLint violations found:", result.diagnostics);
}
```

## Key Features

- **In-memory compilation**: No filesystem access required
- **Browser compatible**: Works in both NodeJS and browser environments
- **Custom transformers**: Support for TypeScript transformer plugins
- **Virtual filesystem**: Bundle external type definitions as JSON
- **ESLint integration**: Apply linting rules during compilation
- **Detailed diagnostics**: Rich error information for debugging

## Development

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/samchon/embed-typescript.git
cd embed-typescript

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Testing

```bash
# Run tests
cd test
npm test
```

### Publishing

```bash
# Publish with latest tag
pnpm package:latest

# Publish with next tag
pnpm package:next
```

## Real-World Applications

![Typia Playground](https://github.com/user-attachments/assets/2e60f5e8-a419-4f35-b9e4-71ae265d5785)

embed-typescript powers several production applications:

- [typia playground](https://typia.io/playground) - Interactive TypeScript validation playground
- [AutoBE](https://github.com/wrtnlabs/autobe) - AI-powered backend code generator
- [AutoView](https://github.com/wrtnlabs/autoview) - AI-powered frontend code generator

## Documentation

For detailed documentation and advanced usage:

- [embed-typescript documentation](./packages/embed-typescript/README.md)
- [embed-eslint documentation](./packages/embed-eslint/README.md)
- [Project guide (CLAUDE.md)](./CLAUDE.md)
- [Test examples](./test/README.md)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Jeongho Nam**
- GitHub: [@samchon](https://github.com/samchon)
- Discord: [Join our community](https://discord.gg/E94XhzrUCZ)

## Support

If you have any questions or need help, please:

- Open an [issue](https://github.com/samchon/embed-typescript/issues)
- Join our [Discord community](https://discord.gg/E94XhzrUCZ)
- Check the [documentation](./CLAUDE.md)