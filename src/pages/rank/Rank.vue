<template>
  <div class="ranking-table">
    <a-radio-group v-model:value="period" style="margin-bottom: 16px">
      <a-radio-button :value="1">日排行榜</a-radio-button>
      <a-radio-button :value="2">月排行榜</a-radio-button>
    </a-radio-group>
    <a-table :columns="columns" :data-source="rankList" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'rank'">
          <span>{{ record.rank }}</span>
        </template>
        <template v-if="column.key === 'user'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar || ''" />
            <span>{{ record.user?.userName || '未知用户' }}</span>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'score'">
          <span>{{ record.score }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup="">
import { onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getUserActivityScoreUsingGet } from '@/api/rankController'

// 定义表格列
const columns = [
  {
    title: '排名',
    dataIndex: 'rank',
    key: 'rank',
  },
  {
    title: '用户名',
    dataIndex: 'user',
    key: 'user',
  },
  {
    title: '活跃度',
    dataIndex: 'score',
    key: 'score',
  },
]
const rankList = ref([])

// 定义排行榜周期
const period = ref(1)
const params: API.getUserActivityScoreUsingGETParams = {
  size: 10,
  value: period.value,
}

watch(period, async (newPeriod) => {
  params.value = newPeriod
  await fetchData(newPeriod)
})

const fetchData = async (period: number) => {
  try {
    const res = await getUserActivityScoreUsingGet(params)
    if (res.data.code === 0) {
      console.log('API返回的数据:', res.data.data)
      rankList.value = res.data.data
      console.log('排行榜数据:', rankList.value)
    } else {
      message.error('获取排行榜失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取排行榜失败：' + e.message)
  }
}

// 初始化数据
onMounted(async () => {
  await fetchData(period.value)
})
</script>

<style scoped="">
.ranking-table {
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
}
</style>
