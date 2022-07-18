export interface FS {
  readdir: (filepath: string) => Promise<string[]>
  lstat: (filepath: string) => Promise<{
    isDirectory: () => boolean
  }>
  rename: (from: string, to: string) => Promise<void>
  mkdir: (filepath: string) => Promise<void>
  writeFile: (filepath: string, contents: string) => Promise<void>
}
