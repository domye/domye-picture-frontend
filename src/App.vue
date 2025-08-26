<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import { healthUsingGet } from './api/mainController'
import BasicLayout from './layouts/BasicLayout.vue'
</script>

<style>
#app {
}
</style>
