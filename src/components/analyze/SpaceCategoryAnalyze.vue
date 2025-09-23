<template>
  <div class="space-category-analyze">
    <a-card :title="cardTitle" :body-style="{ padding: '12px' }">
      <div class="chart-container">
        <v-chart
          :option="options"
          :style="chartStyle"
          :loading="loading"
          :autoresize="true"
          @click="handleChartClick"
        />
      </div>
      <div class="chart-legend" v-if="showLegend">
        <div v-for="item in legendData" :key="item.name" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
          <span class="legend-text">{{ item.name }}</span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'
import { useWindowSize } from '@vueuse/core'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value < 768)

// 图表数据
const dataList = ref<API.SpaceCategoryAnalyzeResponse>([])
// 加载状态
const loading = ref(true)
// 点击的图表项
const activeIndex = ref(-1)

// 卡片标题
const cardTitle = computed(() => {
  return isMobile.value ? '分类分析' : '空间图片分类分析'
})

// 图表样式
const chartStyle = computed(() => {
  return {
    height: isMobile.value ? '240px' : '320px',
    width: '100%',
  }
})

// 是否显示独立图例
const showLegend = computed(() => isMobile.value)

// 图例数据
const legendData = computed(() => {
  return [
    { name: '图片数量', color: '#5470C6' },
    { name: '图片总大小(MB)', color: '#91CC75' },
  ]
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpaceCategoryAnalyzeUsingPost({
      queryAll: props.queryAll,
      queryPublic: props.queryPublic,
      spaceId: props.spaceId,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + (res.data.message || '未知错误'))
    }
  } catch (e) {
    message.error('请求失败，请检查网络')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 处理图表点击事件
const handleChartClick = (params: any) => {
  if (params.componentType === 'series') {
    activeIndex.value = params.dataIndex
  }
}

// 图表选项
const options = computed(() => {
  const categories = dataList.value.map((item) => item.category || '未分类')
  const countData = dataList.value.map((item) => item.count || 0)
  const sizeData = dataList.value.map((item) =>
    item.totalSize ? (item.totalSize / (1024 * 1024)).toFixed(2) : 0,
  ) // 转为 MB

  return {
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: any) => {
        const count = params[0].value
        const size = params[1].value
        return `
          <div style="font-weight:bold;margin-bottom:8px">${params[0].axisValue}</div>
          <div>图片数量: ${count}</div>
          <div>总大小: ${size} MB</div>
        `
      },
    },
    legend: {
      data: ['图片数量', '图片总大小'],
      top: isMobile.value ? 'top' : 'bottom',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: isMobile.value ? 10 : 12,
      },
    },
    grid: {
      top: isMobile.value ? 30 : 50,
      bottom: isMobile.value ? 60 : 80,
      left: isMobile.value ? 40 : 60,
      right: isMobile.value ? 40 : 80,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: isMobile.value ? 30 : 0,
        fontSize: isMobile.value ? 10 : 12,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        nameTextStyle: {
          fontSize: isMobile.value ? 10 : 12,
        },
        axisLine: { show: true, lineStyle: { color: '#5470C6' } },
        axisLabel: {
          fontSize: isMobile.value ? 10 : 12,
        },
      },
      {
        type: 'value',
        name: '图片总大小 (MB)',
        nameTextStyle: {
          fontSize: isMobile.value ? 10 : 12,
        },
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#91CC75' } },
        axisLabel: {
          fontSize: isMobile.value ? 10 : 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(145, 204, 117, 0.3)',
            type: 'dashed',
          },
        },
      },
    ],
    series: [
      {
        name: '图片数量',
        type: 'bar',
        data: countData,
        yAxisIndex: 0,
        itemStyle: {
          color: '#5470C6',
          opacity: ({ dataIndex }: any) => (dataIndex === activeIndex.value ? 1 : 0.7),
        },
        barWidth: isMobile.value ? '20%' : '30%',
      },
      {
        name: '图片总大小',
        type: 'bar',
        data: sizeData,
        yAxisIndex: 1,
        itemStyle: {
          color: '#91CC75',
          opacity: ({ dataIndex }: any) => (dataIndex === activeIndex.value ? 1 : 0.7),
        },
        barWidth: isMobile.value ? '20%' : '30%',
      },
    ],
    animationDuration: 800,
  }
})

// 监听变量，参数改变时触发数据的重新加载
watchEffect(() => {
  fetchData()
})

// 添加窗口大小变化监听
onMounted(() => {
  window.addEventListener('orientationchange', fetchData)
})

onBeforeUnmount(() => {
  window.removeEventListener('orientationchange', fetchData)
})
</script>

<style scoped>
.space-category-analyze {
  width: 100%;
  height: 100%;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
}

.legend-text {
  color: rgba(0, 0, 0, 0.65);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .chart-legend {
    gap: 8px;
  }

  .legend-item {
    font-size: 10px;
  }

  .legend-color {
    width: 10px;
    height: 10px;
  }
}
</style>
