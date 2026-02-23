<template>
  <div id="addVoteActivityPage">
    <h2>创建投票活动</h2>
    <a-form :model="formData" :rules="rules" layout="vertical" @finish="handleSubmit">
      <!-- 基本信息 -->
      <a-card title="基本信息" class="form-card">
        <a-form-item label="活动标题" name="title">
          <a-input v-model:value="formData.title" placeholder="请输入活动标题" />
        </a-form-item>

        <a-form-item label="活动描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请输入活动描述" :rows="3" />
        </a-form-item>

        <a-form-item label="活动时间" name="timeRange">
          <a-range-picker
            v-model:value="formData.timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
          />
        </a-form-item>

        <a-form-item label="每人最多投票数" name="maxVotesPerUser">
          <a-input-number
            v-model:value="formData.maxVotesPerUser"
            :min="1"
            :max="10"
            style="width: 100%"
          />
        </a-form-item>
      </a-card>

      <!-- 投票选项 -->
      <a-card title="投票选项" class="form-card">
        <div v-for="(option, index) in formData.options" :key="index" class="option-item">
          <a-form-item
            :name="['options', index, 'optionText']"
            :rules="[{ required: true, message: '请输入选项内容' }]"
          >
            <a-input
              v-model:value="option.optionText"
              placeholder="请输入选项内容"
              :addon-before="`选项 ${index + 1}`"
            />
          </a-form-item>
          <a-button
            type="text"
            danger
            @click="removeOption(index)"
            v-if="formData.options.length > 2"
          >
            删除
          </a-button>
        </div>
        <a-button type="dashed" @click="addOption" style="width: 100%"> 添加选项 </a-button>
      </a-card>

      <!-- 提交按钮 -->
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" :loading="loading">
            {{ '创建' }}
          </a-button>
          <a-button @click="resetForm">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { addVoteActivities } from '@/api/voteController'

const router = useRouter()
const loading = ref(false)

// 表单数据
const formData = reactive<
  API.VoteActivityAddRequest & {
    options: Array<{ optionText: string }>
    timeRange: [dayjs.Dayjs, dayjs.Dayjs]
  }
>({
  title: '',
  description: '',
  startTime: new Date().toISOString(),
  maxVotesPerUser: 1,
  options: [{ optionText: '' }, { optionText: '' }],
  timeRange: [dayjs(), dayjs().add(1, 'day')], // 默认时间范围
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入活动标题' }],
  description: [{ required: true, message: '请输入活动描述' }],
  timeRange: [{ required: true, message: '请选择活动时间' }],
  maxVotesPerUser: [{ required: true, message: '请设置每人最多投票数' }],
}

// 添加选项
const addOption = () => {
  formData.options.push({ optionText: '' })
}

// 删除选项
const removeOption = (index: number) => {
  formData.options.splice(index, 1)
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    startTime: new Date().toISOString(),
    maxVotesPerUser: 1,
    options: [{ optionText: '' }, { optionText: '' }],
    timeRange: [dayjs(), dayjs().add(1, 'day')],
  })
}

// 处理表单提交
const handleSubmit = async () => {
  loading.value = true
  try {
    const params = {
      title: formData.title,
      description: formData.description,
      startTime: formData.timeRange[0].toISOString(),
      endTime: formData.timeRange[1].toISOString(),
      maxVotesPerUser: formData.maxVotesPerUser,
      options: formData.options.map((option) => ({
        optionText: option.optionText,
      })),
    }

    const res = await addVoteActivities(params)

    if (res.data.code === 0) {
      message.success('创建成功')
      router.push('/vote/detail/' + res.data.data.id)
    } else {
      message.error(res.data.message || '操作失败')
    }
  } catch (error) {
    message.error('操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#addVoteActivityPage {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.form-card {
  margin-bottom: 24px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.option-item .ant-form-item {
  flex: 1;
  margin-bottom: 0;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
}
</style>
