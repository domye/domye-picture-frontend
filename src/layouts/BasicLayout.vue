<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"><GlobalHeader /></a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer>Footer</a-layout-footer>
    </a-layout>
    <a-layout-footer class="footer"> By Domye </a-layout-footer>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '../components/GlobalHeader.vue'
</script>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  margin-bottom: 16px;
  color: unset;
  background: white;
}

#basicLayout .footer {
  background: #ffffff; /* 改变背景颜色 */
  padding: 20px 16px; /* 增加内边距 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px; /* 字体大小 */
  color: #666; /* 字体颜色 */
  z-index: 1000; /* 确保在其他内容之上 */
}

#basicLayout .content {
  padding: 40px;
  margin-left: 30px;
  margin-right: 30px;
  margin-bottom: 28px;
  overflow: initial;
  background: #fff;
}

/* 添加一些额外的样式，比如阴影和圆角 */
#basicLayout .footer {
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  border-radius: 10px 10px 0 0; /* 添加圆角 */
}
</style>
