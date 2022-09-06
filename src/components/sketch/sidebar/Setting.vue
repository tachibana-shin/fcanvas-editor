<template>
  <q-list padding>
    <q-item-label header>General</q-item-label>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Text size</q-item-label>
      </q-item-section>
      <q-item-section side class="w-[2.5rem] pl-0">
        <q-input type="number" dense v-model="textSize" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Autosave</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle color="blue" v-model="autoSave" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Word Wrap</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <q-toggle color="blue" v-model="wordWrap" />
      </q-item-section>
    </q-item>

    <q-separator spaced />
    <q-item-label header>Accessibility</q-item-label>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Line numbers</q-item-label>
        <q-item-label caption
          >if enabled will display the number of lines in the
          editor</q-item-label
        >
      </q-item-section>
      <q-item-section side>
        <q-toggle color="blue" v-model="showLineNumbers" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia"
import { useSettingEditorStore } from "src/stores/setting-editor"

const { textSize, autoSave, wordWrap, showLineNumbers } = storeToRefs(
  useSettingEditorStore()
)
</script>
