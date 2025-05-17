export namespace EmbedTypeScriptCliUtil {
  export function getArgument(type: string): string | null {
    const from: number = process.argv.indexOf(`--${type}`) + 1;
    if (from === 0) return null;
    return process.argv[from] ?? null;
  }

  export function halt(title: string, code: number): never {
    console.log(title + "\n\n" + USAGE);
    process.exit(code);
  }
}

const USAGE = `npx embed-typescript-compiler [command] [options]

Commands:
  
  1. embed-typescript-compiler help
  2. embed-typescript-compiler external --input <directory> --output <json>
     - input: directory placed in external dependencies
       - where "node_modules" and "package-lock.json" are
       - must be installed with npm, not pnpm or yarn
     - output: json file to be generated
      - example: embed-typescript-compiler external \\
                   --input assets/dependencies \\ 
                   --output src/external.json 
`;
