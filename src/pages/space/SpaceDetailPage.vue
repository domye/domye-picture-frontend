<template>
  <PictureSearchForm :onSearch="onSearch" />
  <a-form-item label="按颜色搜索" style="margin-top: 16px">
    <color-picker format="hex" @pureColorChange="onColorChange" shape="circle" />
  </a-form-item>
  <!-- 空间信息 -->
  <div class="space-header">
    <h2>{{ space.spaceName }}（{{ SPACE_TYPE_MAP[space.spaceType] }}）</h2>
    <a-space size="middle" class="space-buttons">
      <a-button
        v-if="canUploadPicture"
        type="primary"
        :href="`/add_picture?spaceId=${id}`"
        target="_blank"
      >
        + 创建图片
      </a-button>
      <a-button
        v-if="canManageSpaceUser"
        type="primary"
        ghost
        :icon="h(TeamOutlined)"
        :href="`/spaceUserManage/${id}`"
        target="_blank"
      >
        成员管理
      </a-button>
      <a-button
        v-if="canEditPicture"
        type="primary"
        ghost
        :href="`/space_analyze?spaceId=${id}`"
        target="_blank"
      >
        空间分析
      </a-button>
      <a-tooltip :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">
        <a-progress
          type="circle"
          :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
          :size="42"
        />
      </a-tooltip>
    </a-space>
  </div>
  <!-- 图片列表 -->
  <PictureList
    :dataList="dataList"
    :loading="loading"
    :onReload="fetchData"
    showOp
    :canEdit="canEditPicture"
    :canDelete="canDeletePicture"
  />
  <a-pagination
    style="text-align: right"
    v-model:current="searchParams.current"
    v-model:pageSize="searchParams.pageSize"
    :total="total"
    :show-total="() => `图片总数 ${total} / ${space.maxCount}`"
    @change="onPageChange"
  />
</template>
<script lang="ts" setup>
import { computed, h, watch } from 'vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import { message } from 'ant-design-vue'
// import { filesize } from 'filesize'
import { onMounted, ref } from 'vue'
import { formatSize } from '@/utils'
import { BarChartOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '@/constants/space'

const props = defineProps<{
  id: string | number
}>()
const space = ref<API.SpaceVO>({})

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}
const onColorChange = async (color: string) => {
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 数据
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 分页参数
const onPageChange = (page, pageSize) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

// 监听空间id变化
watch(
  () => props.id,
  (newSpaceId) => {
    fetchSpaceDetail()
    fetchData()
  },
)

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}
// 页面加载时请求一次
onMounted(() => {
  fetchData()
  fetchSpaceDetail()
})
</script>
<style>
.space-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.space-header h2,
.space-space {
  flex: 1;
}
.space-buttons .ant-btn {
  margin-bottom: 8px;
}
@media (max-width: 768px) {
  .space-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .space-header h2,
  .space-space {
    flex: 1 1 100%;
    margin-bottom: 16px;
  }
}
</style>
