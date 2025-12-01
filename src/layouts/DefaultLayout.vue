

<template>
  <div class="app-main">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
const windowHeight = window.innerHeight || document.body.clientHeight
const h = windowHeight - 64 - 44 - 60
</script>

<style scoped>

</style>
