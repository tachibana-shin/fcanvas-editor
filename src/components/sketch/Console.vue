<template>
  <div
    class="absolute bottom-0 z-40 w-full max-h-full flex flex-col flex-nowrap overflow-hidden"

  >
    <Resizable
      :default-size="{
        height: 355
      }"
      :min-height="34"
      :max-height="maxHeightConsole"
      :enable="{
        top: true,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }"
      ref="resizableRef"
      @resize:start="onResizeStart"
    >
      <div
        class="bg-dark-600 h-full w-full relative scroll-y scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-100 flex flex-col"
      >
        <div
          class="py-[7px] px-[10px] text-[12px] uppercase bg-dark-800 text-[14px] flex items-center justify-between h-[34px]"
        >
          Console

          <div class="flex items-center children:mr-1 children:cursor-pointer">
            <Icon
              :icon="
                resizableRef?.height < maxHeightConsole
                  ? 'codicon:chevron-up'
                  : 'codicon:chevron-down'
              "
              width="20"
              height="20"
              @click="
                resizableRef?.height < maxHeightConsole
                  ? fullConsole()
                  : hideConsole()
              "
            />

            <Icon
              icon="codicon:clear-all"
              width="16"
              height="16"
              @click="clear"
            />
          </div>
        </div>

        <div class="h-full flex-1 overflow-auto" ref="messageWrapperRef">
          <Console
            :data="console.value"
            :_get-list-link-async="getListLinkAsync"
            :read-link-object-async="readLinkObjectAsync"
            :call-fn-link-async="callFnLinkAsync"
            :anchor="Anchor"
          />
        </div>
      </div>
    </Resizable>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { v4 } from "uuid"
import { computed, h, onBeforeUnmount, ref } from "vue"
// eslint-disable-next-line import/order
import { Console, DataAPI } from "vue-console-feed"

// eslint-disable-next-line import/order
import type {
  _getListLink,
  callFnLink,
  Data,
  readLinkObject
} from "vue-console-feed"

import "vue-console-feed/style.css"

import { Resizable } from "vue-re-resizable"
import "vue-re-resizable/dist/style.css"

import type {
  MessageAPI,
  MessageConsoleEncode
} from "./injects/transport-console"

// eslint-disable-next-line import/order
import { debounce, useQuasar } from "quasar"

const props = defineProps<{
  iframe?: HTMLIFrameElement
  importmap?: {
    imports: Record<string, string>
  }
}>()
const $q = useQuasar()
const maxHeightConsole = computed(() => $q.screen.height - 42 - 61)

const cancelers = new Set<() => void>()
onBeforeUnmount(() => {
  cancelers.forEach((canceler) => canceler())
})

const console = new DataAPI(true)
const resizableRef = ref<typeof Resizable>()
const messageWrapperRef = ref<HTMLDivElement>()

const scrollIntoBottomConsole = debounce(() => {
  messageWrapperRef.value?.scrollTo({
    top: messageWrapperRef.value?.scrollHeight,
    behavior: "smooth"
  })
}, 70)
function handleMessage(event: MessageEvent<MessageConsoleEncode>) {
  if (event.data.type === "console") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    console[event.data.name](...(event.data.args as unknown as any[]))

    // scroll to down;
    scrollIntoBottomConsole()
  }
}
addEventListener("message", handleMessage)
cancelers.add(() => removeEventListener("message", handleMessage))

// ====== API Async ========
function createAPIAsync<R extends MessageAPI["result"]>(
  type: "getListLink" | "readLinkObject" | "callFnLink"
) {
  return (link: Data.Link) =>
    new Promise<R>((resolve) => {
      const id = v4()
      props.iframe?.contentWindow?.postMessage({
        id,
        type,
        link
      })

      const handler = (event: MessageEvent<MessageAPI>) => {
        if (event.data.id !== id || event.data.type !== type) return

        resolve(event.data.result as R)

        cancel()
        cancelers.delete(cancel)
      }
      const cancel = () => window.removeEventListener("message", handler)

      cancelers.add(cancel)
      window.addEventListener("message", handler)
    })
}

const getListLinkAsync =
  createAPIAsync<ReturnType<typeof _getListLink>>("getListLink")
const readLinkObjectAsync =
  createAPIAsync<ReturnType<typeof readLinkObject>>("readLinkObject")
const callFnLinkAsync =
  createAPIAsync<ReturnType<typeof callFnLink>>("callFnLink")

function clear() {
  console.clear()

  props.iframe?.contentWindow?.postMessage({
    type: "clearConsole"
  })
}
// ============================

// ====== console ui =====
// eslint-disable-next-line functional/no-let
let heightBackuped: number
function onResizeStart({ el }: { el: HTMLDivElement }) {
  const { height } = el.getBoundingClientRect()

  heightBackuped = height
}

function fullConsole() {
  if (heightBackuped === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    heightBackuped = resizableRef.value!.height
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  resizableRef.value!.height = maxHeightConsole.value
}
function hideConsole() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  resizableRef.value!.height = heightBackuped
}

function getRealLink(link: string) {
  const imports = props.importmap?.imports

  const locationMatcher = link.match(/:\d+:\d+$/)

  const url = link.slice(0, (locationMatcher?.index ?? -1) >>> 0)

  for (const real in imports) {
    if (imports[real] === url) {
      return real + (locationMatcher?.[0] ?? "")
    }
  }

  return link
}

function Anchor(options: { text: string; href: string }) {
  const link = getRealLink(options.href)
  return h(
    "a",
    {
      href: options.href
    },
    [link.slice(link.lastIndexOf("/") + 1)]
  )
}
</script>
