<template>
  <div id="wxBindPage">
    <h2>绑定微信账号</h2>

    <div class="bind-content">
      <div v-if="loading" class="loading">
        <a-spin size="large" />
      </div>
      <img :src="qrCode" alt="微信绑定二维码" class="qr-code" />
      <p class="tip">请使用微信扫描二维码绑定</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { generateQrCodeUsingGet } from '@/api/wxQrCodeController'
import { message } from 'ant-design-vue'

const qrCode = ref('')
const sceneId = ref('')
const eventSource = ref<EventSource | null>(null)
const loading = ref(false)

// 获取绑定二维码
const getBindQrCode = async () => {
  loading.value = true
  try {
    const res = await generateQrCodeUsingGet()
    if (res.data?.code === 0 && res.data?.data) {
      const data = res.data.data
      qrCode.value = data.url
      sceneId.value = data.sceneId
    } else {
      message.error('获取二维码失败')
    }
  } catch (error) {
    message.error('获取二维码失败')
  } finally {
    loading.value = false
  }
}

// 组件卸载时清理连接
onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
  }
})

onMounted(() => {
  getBindQrCode()
})
</script>

<style scoped>
#wxBindPage {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.bind-content {
  text-align: center;
  padding: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.tip {
  margin-top: 10px;
  color: #666;
}

.error {
  color: #ff4d4f;
}
</style>
