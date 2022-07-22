// eslint-disable-next-line functional/functional-parameters
export function splice<T>(array: T[], index: number, ...itemsAdd: T[]): T[] {
  return [...array.slice(0, index), ...itemsAdd, ...array.slice(index + 1)]
}
