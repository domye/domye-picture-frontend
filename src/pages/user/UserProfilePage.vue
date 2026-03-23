<template>
  <div class="user-profile-container">
    <!-- 用户信息卡片 -->
    <a-card :loading="loading" class="user-info-card">
      <div class="user-info">
        <a-avatar :size="80" :src="userProfile.userAvatar">
          {{ userProfile.userName?.charAt(0) }}
        </a-avatar>
        <div class="user-detail">
          <h2 class="user-name">{{ userProfile.userName || '未知用户' }}</h2>
          <p class="user-profile">{{ userProfile.userProfile || '这个人很懒，什么都没写~' }}</p>
        </div>
      </div>
    </a-card>

    <!-- 用户图片列表 -->
    <a-card title="Ta 的图片" :bordered="false" style="margin-top: 16px">
      <PictureList
        :data-list="pictureList"
        :loading="loadingPictures"
      />
      <div v-if="hasMorePictures" class="load-more">
        <a-button :loading="loadingMore" @click="loadMorePictures">加载更多</a-button>
      </div>
      <a-empty
        v-if="!loadingPictures && pictureList.length === 0"
        description="暂无图片"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { getUserProfile } from '@/api/userController'
import { getUserWorks } from '@/api/pictureController'
import type { API } from '@/api/typings'
import PictureList from '@/components/picture/PictureList.vue'

const route = useRoute()

const userProfile = ref<API.UserProfileVO>({})
const loading = ref(false)

const pictureList = ref<API.PictureWorkVO[]>([])
const loadingPictures = ref(false)
const loadingMore = ref(false)
const current = ref(1)
const pageSize = 12
const total = ref(0)
const hasMorePictures = ref(false)

// 获取用户信息
const fetchUserProfile = async () => {
  const userAccount = route.params.userAccount as string
  if (!userAccount) return

  loading.value = true
  try {
    const res = await getUserProfile({ userAccount })
    if (res.data.code === 0 && res.data.data) {
      userProfile.value = res.data.data
      // 获取用户信息后再加载图片（需要通过用户账号查询）
      fetchUserPictures(1, false)
    } else {
      message.error('获取用户信息失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取用户信息失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 获取用户作品
const fetchUserPictures = async (page: number = 1, append: boolean = false) => {
  const userAccount = route.params.userAccount as string
  if (!userAccount) return

  try {
    if (page === 1) {
      loadingPictures.value = true
    } else {
      loadingMore.value = true
    }

    const res = await getUserWorks({
      userAccount,
      current: page,
      size: pageSize,
    })

    if (res.data.code === 0 && res.data.data) {
      const records = res.data.data.records || []

      if (append) {
        pictureList.value = [...pictureList.value, ...records]
      } else {
        pictureList.value = records
      }
      total.value = res.data.data.total || 0
      current.value = page
      hasMorePictures.value = pictureList.value.length < total.value
    }
  } catch (e: any) {
    message.error('获取图片列表失败：' + e.message)
  } finally {
    loadingPictures.value = false
    loadingMore.value = false
  }
}

const loadMorePictures = () => {
  fetchUserPictures(current.value + 1, true)
}

watch(
  () => route.params.userAccount,
  (newAccount) => {
    if (newAccount) {
      userProfile.value = {}
      pictureList.value = []
      current.value = 1
      fetchUserProfile()
    }
  },
)

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.user-profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-detail {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-profile {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
