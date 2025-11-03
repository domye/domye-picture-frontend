<template>
  <div id="spaceAnalyzePage">
    <h2 class="analyze-title">
      空间图库分析 -
      <span v-if="queryAll" class="title-span">全部空间</span>
      <span v-else-if="queryPublic" class="title-span">公共图库</span>
      <span v-else class="title-span">
        <a :href="`/space/${spaceId}`" target="_blank" class="space-link">空间 id：{{ spaceId }}</a>
      </span>
    </h2>

    <div class="spacer"></div>

    <a-row :gutter="[16, 16]" class="analyze-row">
      <!-- 空间使用分析 -->
      <a-col :xs="24" :md="12">
        <div class="analyze-card">
          <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </div>
      </a-col>
      <!-- 空间分类分析 -->
      <a-col :xs="24" :md="12">
        <div class="analyze-card">
          <SpaceCategoryAnalyze
            :spaceId="spaceId"
            :queryAll="queryAll"
            :queryPublic="queryPublic"
          />
        </div>
      </a-col>
      <!-- 标签分析 -->
      <a-col :xs="24" :md="12">
        <div class="analyze-card">
          <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </div>
      </a-col>
      <!-- 图片大小分段分析 -->
      <a-col :xs="24" :md="12">
        <div class="analyze-card">
          <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </div>
      </a-col>
      <!-- 用户上传行为分析 -->
      <a-col :xs="24" :md="12">
        <div class="analyze-card">
          <SpaceUserAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </div>
      </a-col>
      <!-- 空间使用排行分析 -->
      <a-col :xs="24" :md="12" v-if="isAdmin">
        <div class="analyze-card">
          <SpaceRankAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const route = useRoute()

// 空间 id
const spaceId = computed(() => {
  return route.query?.spaceId as string
})

// 是否查询所有空间
const queryAll = computed(() => {
  return !!route.query?.queryAll
})

// 是否查询公共空间
const queryPublic = computed(() => {
  return !!route.query?.queryPublic
})

// 判断用户是否为管理员
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})

// 添加触摸反馈效果
onMounted(() => {
  const cards = document.querySelectorAll('.analyze-card')
  cards.forEach((card) => {
    card.addEventListener('touchstart', () => {
      card.style.transform = 'scale(0.98)'
      card.style.opacity = '0.9'
    })
    card.addEventListener('touchend', () => {
      card.style.transform = 'scale(1)'
      card.style.opacity = '1'
    })
  })
})
</script>

<style scoped>
#spaceAnalyzePage {
  /* padding: 12px; */
  margin-bottom: 16px;
  box-sizing: border-box;
}

.analyze-title {
  font-size: 1.2rem;
  margin-bottom: 12px;
  word-break: break-word;
  line-height: 1.5;
  color: #333;
}

.title-span {
  display: inline-block;
  margin-top: 4px;
  font-weight: normal;
}

.space-link {
  word-break: break-all;
  color: #1890ff;
  text-decoration: none;
}

.spacer {
  height: 16px;
}

.analyze-row {
  display: flex;
  flex-direction: column;
}

.analyze-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 12px;
  margin-bottom: 16px;
  height: 100%;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 响应式设计 - 平板及以上 */
@media (min-width: 768px) {
  #spaceAnalyzePage {
    padding: 16px;
    max-width: 1400px;
    margin: 0 auto 24px;
  }

  .analyze-title {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }

  .title-span {
    display: inline;
    margin-top: 0;
  }

  .analyze-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .analyze-card {
    padding: 16px;
    margin-bottom: 0;
  }

  .spacer {
    height: 24px;
  }
}

/* 响应式设计 - 桌面大屏幕 */
@media (min-width: 992px) {
  #spaceAnalyzePage {
    padding: 24px;
  }

  .analyze-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}
</style>
