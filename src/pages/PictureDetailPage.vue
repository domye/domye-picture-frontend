<template>
  <div class="picture-detail-container">
    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览" :loading="loading" class="picture-preview-card">
          <div class="image-container">
            <a-image
              :style="{ maxHeight: imageMaxHeight }"
              :src="picture.url"
              :alt="picture.name || '图片'"
              :preview="{
                maskClosable: true,
              }"
            />
          </div>
        </a-card>
      </a-col>

      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息" :loading="loading" class="picture-info-card">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar
                  :size="24"
                  :src="picture.user?.userAvatar"
                  :alt="picture.user?.userName || '用户'"
                />
                <div>{{ picture.user?.userName || '未知' }}</div>
              </a-space>
            </a-descriptions-item>

            <a-descriptions-item label="名称">
              {{ picture.name || '未命名' }}
            </a-descriptions-item>

            <a-descriptions-item label="简介">
              <div class="text-ellipsis">{{ picture.introduction || '-' }}</div>
            </a-descriptions-item>

            <a-descriptions-item label="分类">
              <a-tag color="blue">{{ picture.category || '默认' }}</a-tag>
            </a-descriptions-item>

            <a-descriptions-item label="标签">
              <div class="tags-container">
                <a-tag
                  v-for="tag in picture.tags"
                  :key="tag"
                  color="processing"
                  class="picture-tag"
                >
                  {{ tag }}
                </a-tag>
                <span v-if="!picture.tags || picture.tags.length === 0">-</span>
              </div>
            </a-descriptions-item>

            <a-descriptions-item label="格式">
              {{ picture.picFormat || '-' }}
            </a-descriptions-item>

            <a-descriptions-item label="尺寸">
              <span v-if="picture.picWidth && picture.picHeight">
                {{ picture.picWidth }} × {{ picture.picHeight }}
              </span>
              <span v-else>-</span>
            </a-descriptions-item>

            <a-descriptions-item label="宽高比">
              {{ picture.picScale || '-' }}
            </a-descriptions-item>

            <a-descriptions-item label="大小">
              {{ formatFileSize(picture.picSize) }}
            </a-descriptions-item>

            <a-descriptions-item label="上传时间">
              {{ formatDate(picture.createTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="主色调">
              <a-space>
                {{ picture.picColor ?? '-' }}
                <div
                  v-if="picture.picColor"
                  :style="{
                    backgroundColor: toHexColor(picture.picColor),
                    width: '16px',
                    height: '16px',
                  }"
                />
              </a-space>
            </a-descriptions-item>
          </a-descriptions>

          <div class="action-buttons" v-if="!loading">
            <a-space style="width: 100%; display: flex; justify-content: center">
              <a-button v-if="canEdit" type="default" @click="doEdit">
                编辑
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
              <a-button v-if="canEdit" danger @click="doDelete">
                删除
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>

              <a-button type="primary" block @click="handleDownload"> 下载图片 </a-button>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import type { API } from '@/api/typings'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import router from '@/router'
const loginUserStore = useLoginUserStore()
// 是否具有编辑权限
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  // 未登录不可编辑
  if (!loginUser.id) {
    return false
  }
  // 仅本人或管理员可编辑
  const user = picture.value.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
}) // 编辑
const doEdit = () => {
  router.push('/add_picture?id=' + picture.value.id)
}
// 删除
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
}
const props = defineProps<{
  id: string | number
}>()

const picture = ref<API.PictureVO>({})
const loading = ref(false)

// 计算图片最大高度，根据窗口大小动态调整
const imageMaxHeight = computed(() => {
  return window.innerHeight > 800 ? '600px' : '400px'
})

function toHexColor(input) {
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}
// 获取图片详情
const fetchPictureDetail = async () => {
  if (!props.id) return

  loading.value = true
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 格式化日期
const formatDate = (date?: string): string => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 下载图片
const handleDownload = () => {
  if (!picture.value.url) {
    message.warning('图片地址不存在')
    return
  }

  const link = document.createElement('a')
  link.href = picture.value.url
  link.download = picture.value.name || 'image'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 监听ID变化，重新获取数据
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      fetchPictureDetail()
    }
  },
)

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
.picture-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.picture-preview-card {
  height: 100%;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  min-height: 300px;
}

.picture-info-card {
  height: 100%;
}

.text-ellipsis {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.picture-tag {
  margin-bottom: 4px;
}

.action-buttons {
  margin-top: 16px;
  padding-top: 16px;

  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .picture-detail-container {
    padding: 8px;
  }

  .image-container {
    min-height: 200px;
  }
}
</style>
