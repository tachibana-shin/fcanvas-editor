<script lang="ts" setup>import { onBeforeUnmount } from 'vue'

const log = {
  type: "console.log",
  args: '["[sandbox::shape]: draw context on sandbox"]'
}
const error = {
  type: "error",
  col: 14,
  line: 22,
  filename:
    "blob:https://9000-tachibanash-fcanvasedit-zv6vx7lxtdu.ws-us59.gitpod.io/f293e923-5a37-462e-891b-f9d79f65d243",
  message: "Uncaught SyntaxError: missing ) after argument list",
  error: {
    message: "missing ) after argument list",
    stack: "SyntaxError: missing ) after argument list"
  }
}

interface MessageEventConsole {
  type: `console.${string}`
  args: unknown
}
interface MessageEventError {
  type: "error"
  col: number
  line: number
  filename: string
  message: string
  error: {
    message: string
    stack: string
  }
}
function handlerTransportConsole({
  data
}: MessageEvent<MessageEventConsole | MessageEventError>) {
  if (!data || !data.type) return

  if (data.type === "error") {
    // nani?
    console.log(data)
  } else if (data.type.startsWith("console.")) {
    console.log(data)
  }
}
window.addEventListener("message", handlerTransportConsole)
onBeforeUnmount(() =>
  window.removeEventListener("message", handlerTransportConsole)
)
</script>
