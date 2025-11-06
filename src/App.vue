<template>
  <a-config-provider :theme="theme">
    <div id="app">
      <BasicLayout />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
// 注入全局主题配置
const theme = {
  token: {
    colorPrimary: '#748CBC',
    colorInfo: '#748CBC',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorLink: '#748CBC',
    borderRadius: 6,
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  },
  components: {
    Button: {
      borderRadius: 6,
      colorPrimary: '#748CBC',
      colorPrimaryHover: '#5a73a7',
      colorPrimaryActive: '#3a5f8d',
    },
    Card: {
      borderRadius: 8,
      colorBorderSecondary: 'rgba(116, 140, 188, 0.3)',
    },
    Menu: {
      borderRadius: 8,
      colorItemBg: '#ffffff',
      colorItemBgHover: '#f0f5ff',
      colorItemBgSelected: '#e6f7ff',
      colorItemTextSelected: '#3a5f8d',
    },
    Layout: {
      colorBgHeader: '#ffffff',
      colorBgBody: 'transparent',
      colorBgTrigger: '#f0f5ff',
    },
    Input: {
      borderRadius: 6,
      colorBorder: '#d9e3f0',
      colorPrimary: '#748CBC',
    },
    Pagination: {
      itemActiveBg: '#748CBC',
      colorItemText: '#3a5f8d',
      colorItemTextActive: '#ffffff',
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  margin: 0;
}

/* 全局动画类 */
.ant-message {
  animation: fadeIn 0.3s ease-out;
}

.ant-notification {
  animation: slideInRight 0.3s ease-out;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #748cbc 0%, #3a5f8d 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3a5f8d;
}
</style>