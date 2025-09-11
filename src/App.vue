<template>
  <a-config-provider :theme="theme">
    <div id="app">
      <BasicLayout /></div
  ></a-config-provider>
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
// import { inject } from 'vue'
// 注入全局主题配置
const theme = {
  token: {
    colorPrimary: '#748CBC',
  },
}
</script>

<style>
#app {
}
</style>
