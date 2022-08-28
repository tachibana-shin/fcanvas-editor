<template>
  <div class="absolute bottom-0 z-40 w-full flex flex-col flex-nowrap">
    <Resizable
      :default-size="{
        width: '100%',
        height: '355px'
      }"
      :min-height="36"
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
        class="bg-dark-600 h-full w-full flex-1 relative scroll-y scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-100 flex flex-col"
      >
        <div
          class="py-[7px] text-[12px] uppercase bg-dark-800 text-[14px] flex items-center justify-between mx-[10px]"
        >
          Console

          <div class="flex items-center children:mr-1 children:cursor-pointer">
            <Icon
              v-if="resizableRef?.height > 0"
              icon="codicon:chevron-up"
              width="20"
              height="20"
              @click="fullConsole"
            />
            <Icon
              v-else
              icon="codicon:chevron-down"
              width="16"
              height="16"
              @click="hideConsole"
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
          <template v-for="(item, index) in consoleMessages" :key="index">
            <ConsoleTable
              v-if="(item  as unknown as MessageConsoleTable).name === 'table'"
              :data="(item as unknown as MessageConsoleTable).args.table"
              :data-value="(item as unknown as MessageConsoleTable).args.value"
              :_get-list-link-async="getListLinkAsync"
              :read-link-object-async="readLinkObjectAsync"
              :call-fn-link-async="callFnLinkAsync"
            />
            <ConsoleItem
              v-else
              v-for="(message, indexMess) in item.args"
              :key="index + '_' + indexMess"
              :data="message"
              :type="(item.name as Methods)"
              :_get-list-link-async="getListLinkAsync"
              :read-link-object-async="readLinkObjectAsync"
              :call-fn-link-async="callFnLinkAsync"
            />
          </template>
        </div>
      </div>
    </Resizable>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { v4 } from "uuid"
import { onBeforeUnmount, reactive, ref } from "vue"
// eslint-disable-next-line import/order
import { ConsoleItem, ConsoleTable } from "vue-console-feed"

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

import { MessageConsoleTable, Methods } from "./injects/transport-console"
import type {
  MessageAPI,
  MessageConsoleEncode
} from "./injects/transport-console"

// eslint-disable-next-line import/order
import { debounce } from "quasar"

const props = defineProps<{
  iframe?: HTMLIFrameElement
}>()

const cancelers = new Set<() => void>()
onBeforeUnmount(() => {
  cancelers.forEach((canceler) => canceler())
})

const consoleMessages = reactive<Omit<MessageConsoleEncode, "type">[]>([])

const messageWrapperRef = ref<HTMLDivElement>()
const resizableRef = ref<typeof Resizable>()

const scrollIntoBottomConsole = debounce(() => {
  messageWrapperRef.value?.scrollTo({
    top: messageWrapperRef.value?.scrollHeight,
    behavior: "smooth"
  })
}, 70)
function handleMessage(event: MessageEvent<MessageConsoleEncode>) {
  if (event.data.type === "console") {
    consoleMessages.push(event.data)

    // scroll to down;
    scrollIntoBottomConsole()
  }
}
addEventListener("message", handleMessage)
cancelers.add(() => removeEventListener("message", handleMessage))

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
  consoleMessages.splice(0)

  props.iframe?.contentWindow?.postMessage({
    type: "clearConsole"
  })
}

// ====== console ui =====
// eslint-disable-next-line functional/no-let
let heightBackuped: number
function onResizeStart({ el }: { el: HTMLDivElement }) {
  const { height } = el.getBoundingClientRect()

  heightBackuped = height

  console.log({ heightBackuped })
}

function fullConsole() {
  if (heightBackuped === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    heightBackuped = resizableRef.value!.height
  }

  console.log({ heightBackuped })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  resizableRef.value!.height = 0
}
function hideConsole() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  resizableRef.value!.height = heightBackuped
}
</script>
