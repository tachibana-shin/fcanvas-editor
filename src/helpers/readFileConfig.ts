import type { FS } from "src/modules/fs"

export async function readFileConfig<T>(
  fs: FS,
  files: string[],
  parser: (filename: string, content: string) => T,
  defaultValue: T
): Promise<T> {
  for (const file of files) {
    try {
      return parser(file, (await fs.readFile(file)) as string) ?? defaultValue
    } catch {}
  }

  return defaultValue
}
