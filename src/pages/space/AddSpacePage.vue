<template>
  <div id="addPicturePage">
    <!-- 标题 -->
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改' : '创建' }}{{ SPACE_TYPE_MAP[spaceType] }}
    </h2>

    <!-- 创建选项 -->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="formData.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>

      <!-- 提交按钮 -->
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
          提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>

  <!-- 空间级别介绍 -->
  <a-card title="空间级别介绍" id="spaceLevelCard">
    <a-typography-paragraph> 目前仅支持开通普通版 </a-typography-paragraph>
    <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
      {{ spaceLevel.text }}： 大小 {{ formatSize(spaceLevel.maxSize) }}， 数量
      {{ spaceLevel.maxCount }}
    </a-typography-paragraph>
  </a-card>
</template>

<script lang="ts" setup>
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController'
import {
  SPACE_LEVEL_ENUM,
  SPACE_TYPE_ENUM,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constants/space'
import router from '@/router'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { formatSize } from '@/utils'
const route = useRoute()

// 数据
const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})

// 空间类别
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})
const loading = ref(false)
const SPACE_LEVEL_OPTIONS = ref<string[]>([])
// 获取老数据
const oldSpace = ref<API.SpaceVO>()
const spaceLevelList = ref<API.SpaceLevel[]>([])
// 获取老数据
const getOldSpace = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      oldSpace.value = data
      formData.spaceName = data.spaceName
      formData.spaceLevel = data.spaceLevel
    }
  }
}

// 提交
const handleSubmit = async (values: any) => {
  const spaceId = oldSpace.value?.id
  loading.value = true
  let res
  // 更新
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...formData,
    })
  } else {
    // 创建
    res = await addSpaceUsingPost({
      ...formData,
      spaceType: spaceType.value,
    })
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    const path = `/space/${spaceId ?? res.data.data}`
    router.push({
      path,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

// 获取标签分类
const getSpaceLevelOptions = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
    SPACE_LEVEL_OPTIONS.value = res.data.data.map((data) => {
      return {
        value: data.value,
        label: String(data.text), // 将 label 转换为字符串
      }
    })
  } else {
    message.error('获取标签分类失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  getSpaceLevelOptions()
  getOldSpace()
})
</script>

<style>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
#spaceLevelCard {
  max-width: 720px;
  margin: 0 auto;
}
</style>
