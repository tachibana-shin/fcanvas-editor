import { onBeforeUnmount } from "vue"

export function addEvent<K extends keyof GlobalEventHandlersEventMap>(
  el: {
    addEventListener: (
      name: K,
      handler: (event: GlobalEventHandlersEventMap[K]) => void
    ) => unknown
    removeEventListener: (
      name: K,
      handler: (event: GlobalEventHandlersEventMap[K]) => void
    ) => unknown
  },
  name: K,
  handler: (event: GlobalEventHandlersEventMap[K]) => void
): void {
  el.addEventListener(name, handler)
  onBeforeUnmount(() => el.removeEventListener(name, handler))
}
