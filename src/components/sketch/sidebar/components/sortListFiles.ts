import sortArray from "sort-array"

interface Info {
  filepath: string
  isDir: boolean
}

export function sortListFiles(list: Info[]) {
  const dirs: Info[] = []
  const files: Info[] = []

  list.forEach((inf) => {
    if (inf.isDir) dirs.push(inf)
    else files.push(inf)
  })

  return [
    ...sortArray(dirs, {
      by: "filepath",
      order: "asc"
    }),
    ...sortArray(files, {
      by: "filepath",
      order: "asc"
    })
  ]
}
