<template>
  <q-header class="h-[42px] bg-transparent">
    <q-toolbar class="min-h-0 h-full">
      <NavItem chevron :menu="fileMenu"> File </NavItem>
      <NavItem chevron :menu="editMenu"> Edit </NavItem>
      <NavItem chevron :menu="sketchMenu"> Sketch </NavItem>
      <NavItem chevron :menu="helpMenu"> Help </NavItem>

      <q-space />

      <NavItem label="English" class="mr-3" />

      <NavItem v-if="user">
        <div class="flex items-center">
          <q-avatar size="24px">
            <img :src="user.photoURL" v-if="user.photoURL" />
            <Icon
              icon="carbon:user-avatar-filled"
              v-else
              class="w-[24px] h-[24px]"
            />
          </q-avatar>
        </div>

        <Menu :menu="userMenu">
          <template v-slot:before-menu>
            <div class="text-center my-3 min-w-[250px]">
              <q-avatar size="80px">
                <img :src="user.photoURL" v-if="user.photoURL" />
                <Icon
                  icon="carbon:user-avatar-filled"
                  v-else
                  class="w-[80px] h-[80px]"
                />
              </q-avatar>

              <h3 class="text-[14px] mt-2">{{ user.displayName }}</h3>
            </div>
          </template>
        </Menu>
      </NavItem>

      <template v-else>
        <NavItem to="/sign-in">Login in</NavItem>
        <small class="mx-1 text-gray-300">or</small>
        <NavItem to="/sign-up">Sign up</NavItem>
      </template>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
import { getAuth } from "@firebase/auth"
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { useQuasar } from "quasar"
import { app } from "src/modules/firebase"
import { useAuthStore } from "src/stores/auth"
import { useEditorStore } from "src/stores/editor"
import { useRouter } from "vue-router"

import Menu from "../ui/Menu.vue"

import NavItem from "./NavItem.vue"

const { user } = storeToRefs(useAuthStore())
const $q = useQuasar()
const editorStore = useEditorStore()
const router = useRouter()

const auth = getAuth(app)

const fileMenu = [
  {
    icon: "material-symbols:note-add-outline",
    name: "New Project"
  },
  {
    icon: "material-symbols:save-outline",
    name: "Save",
    sub: "⌘S",
    onClick: () => editorStore.saveSketch(router)
  },
  {
    icon: "material-symbols:folder-open-outline",
    name: "Open"
  }
]
const editMenu = [
  {
    icon: "cib:prettier",
    name: "Prettier",
    sub: "⌘↑+F"
  },
  {
    icon: "material-symbols:search",
    name: "Find",
    sub: "⌘F"
  },
  {
    icon: "material-symbols:find-replace",
    name: "Replace",
    sub: "⌘H"
  }
]
const sketchMenu = [
  {
    icon: "eva:file-add-outline",
    name: "Add File"
  },
  {
    icon: "material-symbols:create-new-folder-outline",
    name: "Add Folder"
  },
  {
    icon: "ic:round-play-arrow",
    name: "Run",
    sub: "⌘H"
  },
  {
    icon: "ic:round-stop",
    name: "⌘Enter",
    sub: "⌘↑+Enter"
  }
]
const helpMenu = [
  {
    icon: "material-symbols:keyboard-command-key",
    name: "Keyboard Shortcuts"
  },
  {
    icon: "carbon:code-reference",
    name: "Reference"
  },
  {
    icon: "material-symbols:info-outline",
    name: "About"
  }
]
const userMenu = [
  {
    icon: "material-symbols:person",
    name: "View Profile"
  },
  {
    icon: "material-symbols:settings-outline",
    name: "Edit Profile"
  },
  {
    icon: "ic:outline-source",
    name: "Assets"
  },
  {
    divider: true
  },
  {
    icon: "material-symbols:logout-rounded",
    name: "Sign Out",
    async onClick() {
      await auth.signOut()

      $q.notify("Sign out successfully")
    }
  }
]
</script>
