<template>
  <div class="vote-detail-container">
    <a-row :gutter="[16, 16]">
      <!-- 投票信息区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="投票活动" :loading="loading" class="vote-info-card">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="活动标题">
              {{ voteActivity.title || '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="活动描述">
              <div>{{ voteActivity.description || '-' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="活动状态">
              <a-tag v-if="voteActivity.status === 1" color="green">进行中</a-tag>
              <a-tag v-else-if="voteActivity.status === 2" color="red">已结束</a-tag>
              <a-tag v-else color="default">未开始</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="开始时间">
              {{ formatDate(voteActivity.startTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="结束时间">
              {{ formatDate(voteActivity.endTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="总投票数">
              {{ voteActivity.totalVotes || 0 }}票
            </a-descriptions-item>
          </a-descriptions>

          <!-- 投票选项 -->
          <a-divider>投票选项</a-divider>
          <a-radio-group
            v-model:value="selectedOption"
            @change="handleVote"
            :disabled="voteActivity.status !== 1 || hasVoted"
          >
            <div class="vote-options">
              <div v-for="(option, index) in voteActivity.options" :key="index" class="vote-option">
                <a-radio :value="option.id">
                  <span>{{ option.optionText }}</span>
                  <span class="vote-count">({{ option.voteCount || 0 }}票)</span>
                </a-radio>
                <a-progress
                  :percent="getVotePercent(Number(option.voteCount))"
                  :show-info="false"
                  :stroke-color="hasVoted ? '#52c41a' : '#1890ff'"
                />
              </div>
            </div>
          </a-radio-group>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  getVoteActivitiesUsingGet,
  addVoteRecordUsingPost,
  endVoteActivitiesUsingPost,
} from '@/api/voteController'
import type { API } from '@/api/typings'
import dayjs from 'dayjs'
import router from '@/router'

const props = defineProps<{
  id: string | number
}>()

const voteActivity = ref<API.VoteActivityDetailVO>({})
const loading = ref(false)
const selectedOption = ref<string>()
const hasVoted = ref(false)

// 获取投票详情
const fetchVoteDetail = async () => {
  if (!props.id) return

  loading.value = true
  try {
    const res = await getVoteActivitiesUsingGet({ id: props.id })
    if (res.data.code === 0 && res.data.data) {
      voteActivity.value = res.data.data
      hasVoted.value = res.data.data.hasVoted || false
    } else {
      message.error('获取投票详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取投票详情失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 处理投票
const handleVote = async () => {
  if (!selectedOption.value) {
    message.warning('请选择一个选项')
    return
  }

  try {
    const res = await addVoteRecordUsingPost({
      activityId: props.id,
      optionId: selectedOption.value,
    })
    if (res.data.code === 0) {
      message.success('投票成功')
      hasVoted.value = true
      fetchVoteDetail() // 刷新数据
    } else {
      message.error('投票失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('投票失败：' + e.message)
  }
}

// 计算投票百分比
const getVotePercent = (voteCount: number) => {
  if (!voteActivity.value.options) return 0
  const totalVotes = voteActivity.value.options.reduce(
    (sum, opt) => sum + Number(opt.voteCount || 0),
    0,
  )
  return totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
}

// 结束投票
const doEnd = async () => {
  try {
    const res = await endVoteActivitiesUsingPost({ activityId: props.id })
    if (res.data.code === 0) {
      message.success('已结束投票')
      fetchVoteDetail()
    } else {
      message.error('结束投票失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('结束投票失败：' + e.message)
  }
}

// 删除活动
const doDelete = async () => {
  // TODO: 实现删除功能
}

// 格式化日期
const formatDate = (date?: string): string => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 监听ID变化
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      fetchVoteDetail()
    }
  },
)

onMounted(() => {
  fetchVoteDetail()
})
</script>

<style scoped>
.vote-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.vote-info-card {
  height: 100%;
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vote-option {
  padding: 8px;
  border-radius: 4px;
  background-color: #fafafa;
}

.vote-count {
  margin-left: 8px;
  color: #666;
}

.action-card {
  height: 100%;
}

@media (max-width: 768px) {
  .vote-detail-container {
    padding: 8px;
  }
}
</style>
