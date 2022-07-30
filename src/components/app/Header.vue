<template>
  <header className="h-[42px] w-full top-0 left-0 flex items-center px-3">
    <NavItem
      chevron
      :menu="[
        {
          icon: 'mdi-note-add-outline',
          name: 'New Project'
        },
        {
          icon: 'mdi-save-outline',
          name: 'Save',
          sub: '⌘S'
        },
        {
          icon: 'mdi-file-open-outline',
          name: 'Open'
        }
      ]"
    >
      File
    </NavItem>
    <NavItem
      chevron
      :menu="[
        {
          icon: 'mdi-note-add-outline',
          name: 'Prettier',
          sub: '⌘↑+F'
        },
        {
          icon: 'mdi-search-outline',
          name: 'Find',
          sub: '⌘F'
        },
        {
          icon: 'mdi-find-replace--outline',
          name: 'Replace',
          sub: '⌘H'
        }
      ]"
    >
      Edit
    </NavItem>
    <NavItem
      chevron
      :menu="[
        {
          icon: 'mdi-note-add-outline',
          name: 'Add File'
        },
        {
          icon: 'mdi-create-new-folder-outline',
          name: 'Add Folder'
        },
        {
          icon: 'mdi-play-arrow-outline',
          name: 'Run',
          sub: '⌘H'
        },
        {
          icon: 'mdi-stop',
          name: '⌘Enter',
          sub: '⌘↑+Enter'
        }
      ]"
    >
      Sketch
    </NavItem>
    <NavItem
      chevron
      :menu="[
        {
          icon: 'mdi-keyboard-command-key-outline',
          name: 'Keyboard Shortcuts'
        },
        {
          name: 'Reference'
        },
        {
          icon: 'mdi-info-outline',
          name: 'About'
        }
      ]"
    >
      Help
    </NavItem>

    <div className="flex-1"></div>

    <NavItem label="English" />

    <NavItem
      v-if="user"
      :chevron="false"
      :menu="[
        {
          icon: 'mdi-person',
          name: 'View Profile'
        },
        {
          icon: 'mdi-settings',
          name: 'Edit Profile'
        },
        {
          icon: 'mdi-source-outline',
          name: 'Assets'
        },
        {
          divider: true
        },
        {
          icon: 'mdi-logout-outline',
          name: 'Sign Out'
        }
      ]"
    >
      <div className="flex items-center">
        <q-avatar size="24px">
          <img :src="user.photoURL" />
        </q-avatar>
      </div>
      <template v-slot:menu-before>
        <div className="text-center mb-3 min-w-[250px]">
          <q-avatar size="80px">
            <img :src="user.photoURL" />
          </q-avatar>

          <h3 className="text-[14px] mt-2">{user.displayName}</h3>
        </div>
      </template>
    </NavItem>
    <template v-else>
      <NavItem>Login in</NavItem>
      <NavItem>Sign up</NavItem>
    </template>
  </header>
</template>

<script lang="ts" setup>
import NavItem from "./NavItem.vue"
</script>
