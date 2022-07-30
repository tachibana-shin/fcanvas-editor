<template>
  <div className="ml-[-15px]">
    <div className="flex items-center justify-between ml-[22px] mr-[7px] py-1">
      <h1 className="text-[12px] uppercase font-bold">FCanvas</h1>
      <div
        className="text-[1.1rem] flex items-center children:mr-1 children:cursor-pointer"
      >
        <NoteAddOutlined
          fontSize="inherit"
          @click="fileTreeRef?.createFile()"
        />
        <CreateNewFolderOutlined
          fontSize="inherit"
          @click="fileTreeRef?.createDir()"
        />
        <ReplayOutlinedIcon
          fontSize="inherit"
          @click="fileTreeRef?.reloadDir()"
        />
      </div>
    </div>

    <FileTreeNoRoot ref="fileTreeRef" filepath="/" :fs="fs" />
  </div>
</template>

<script lang="ts" setup>
const fileTreeRef = ref()
</script>