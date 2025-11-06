<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header fade-in"><GlobalHeader /></a-layout-header>
      <a-layout>
        <a-layout-sider
          v-if="loginUserStore.loginUser.id"
          class="sider slide-in-left"
          width="180"
          breakpoint="lg"
          collapsed-width="0"
        >
          <globalSider />
        </a-layout-sider>
        <a-layout-content class="content fade-in-delay-1">
          <router-view />
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer fade-in-delay-2"> By Domye </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import GlobalHeader from '../components/GlobalHeader.vue'
import globalSider from '../components/GlobalSider.vue'
const loginUserStore = useLoginUserStore()
</script>

<style scoped>
#basicLayout .header {
  padding: 0 20px;
  color: unset;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 16px;
  transition: all 0.3s ease;
  height: 60px;
  line-height: 40px;
  z-index: 100;
  position: relative;
}

#basicLayout .header:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

#basicLayout .footer {
  background: #ffffff;
  padding: 20px 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  color: #666;
  z-index: 1000;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
}

#basicLayout .content {
  padding: 20px;
  margin-bottom: 28px;
  overflow: initial;
  background: transparent;
  border-radius: 8px;
  margin: 0 16px 56px 16px;
  transition: all 0.3s ease;
  margin-left: 32px; /* 保持增加的距离 */
}

#basicLayout .content:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

#basicLayout .sider {
  background: transparent;
  margin-bottom: 0;
  margin-left: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: fit-content;
  padding: 0;
}

#basicLayout :deep(.ant-layout-sider-zero-width-trigger) {
  top: 60px;
  right: 10px;
  background: #748cbc;
  border-radius: 4px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
  border-radius: 8px !important;
}

/* 移动端适配 */
@media (max-width: 992px) {
  #basicLayout .content {
    margin-left: 1px; /* 在小屏幕上减小左边距 */
  }
}

@media (max-width: 768px) {
  #basicLayout .header {
    margin: 5px;
  }

  #basicLayout :deep(.ant-layout-sider-zero-width-trigger) {
    background: #748cbc;
    border-radius: 4px;
    z-index: 101;
  }
}
</style>
