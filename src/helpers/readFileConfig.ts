import type { FS } from "~/modules/fs"

export async function readFileConfig<T>(
  fs: FS,
  files: string[],
  parser: (filename: string, content: string) => T,
  defaultValue: T
): Promise<T> {
  for (const file of files) {
    try {
      return parser(file, (await fs.readFile(file, "utf8")) as string)
    } catch {}
  }

  return defaultValue
}
