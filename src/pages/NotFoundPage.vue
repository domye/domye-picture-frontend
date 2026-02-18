<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <img src="https://cdn.domye.top/uploads/07/1752738903.ico" alt="Logo" class="logo" />
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <p class="error-description">请检查您输入的网址是否正确，或点击下方按钮返回首页</p>
      <a-button type="primary" size="large" @click="goHome" class="home-btn">
        <template #icon>
          <HomeOutlined />
        </template>
        返回首页
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, #748cbc 0%, #3a5f8d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  color: #333;
  margin: 16px 0 8px;
}

.error-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
}

.home-btn {
  border-radius: 20px;
  padding: 0 32px;
  height: 44px;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(116, 140, 188, 0.3);
  transition: all 0.3s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(116, 140, 188, 0.4);
}

@media (max-width: 576px) {
  .error-code {
    font-size: 80px;
  }

  .error-message {
    font-size: 18px;
  }

  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>
