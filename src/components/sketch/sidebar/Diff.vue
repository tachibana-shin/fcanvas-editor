<template>
  <div class="w-full px-3" v-if="!acceptDiff">
    <small class="leading-0">
      Diff change not active. Please login and save sketch.
    </small>

    <button
      class="block w-full max-w-[250px] mt-1 mb-3 text-sm py-[3px] mx-auto bg-cyan-600"
      @click="saveSketch"
    >
      Save Sketch
    </button>
  </div>

  <div class="w-full" v-else>
    <div class="w-100 absolute top-0 left-0" v-if="loading">
      <q-linear-progress height="2px" />>
    </div>

    <div class="text-center text-sm mt-3" v-if="!diff || diff.count === 0">
      Not change
    </div>

    <template v-if="diff">
      <div
        class="block max-w-[250px] mt-1 mb-3 text-sm py-[3px] text-center bg-cyan-600 cursor-pointer"
        @click="
          ;async () => {
            loading = true
            await saveSketch()
            diff = null
            loading = false
          }
        "
      >
        Save Sketch
      </div>
      <small class="text-[14px] block border-y border-gray-600 py-1 px-3">
        Changes
      </small>
      <div class="ml-[-15px] mt-2">
        <Dir show name="/" :files="diff.diffs" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const FILE_COLOR = {
  ADDED: " text-green-500",
  MODIFIED: " text-orange-600",
  DELETED: " text-red-600"
}

const diff = ref<DiffReturn<false> | null>(null)

watch(
  () => editorStore.sketchId,
  (id) => {
    if (!id) return

    const handle = async () => {
      setLoading(true)

      try {
        setDiff(await fs.getdiff())
      } catch (err) {
        console.log(err)
      }

      setLoading(false)
    }

    fs.events.on("write", handle)
    fs.events.on("unlink", handle)

    return () => {
      fs.events.off("write", handle)
      fs.events.off("unlink", handle)
    }
  }
)
</script>
