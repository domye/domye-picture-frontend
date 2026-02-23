<template>
  <div id="contactManagePage">
    <a-flex justify="space-between" align="center">
      <h2>联系人管理</h2>
      <a-button type="primary" @click="showAddModal">+ 添加好友</a-button>
    </a-flex>
    <div style="margin-bottom: 16px" />

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="contacts" tab="我的联系人">
        <a-table
          :columns="contactColumns"
          :data-source="contactList"
          :loading="loadingContacts"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'contactUserInfo'">
              <a-space>
                <a-avatar :src="record.contactUser?.userAvatar" />
                <span>{{ record.contactUser?.userName }}</span>
              </a-space>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space wrap>
                <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="pending" tab="待处理申请">
        <a-table
          :columns="pendingColumns"
          :data-source="pendingList"
          :loading="loadingPending"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'contactUserInfo'">
              <a-space>
                <a-avatar :src="record.contactUser?.userAvatar" />
                <span>{{ record.contactUser?.userName }}</span>
              </a-space>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space wrap>
                <a-button type="link" @click="handleAccept(record.id)">接受</a-button>
                <a-button type="link" danger @click="handleReject(record.id)">拒绝</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 添加好友弹窗 -->
    <a-modal
      v-model:open="addModalVisible"
      title="添加好友"
      @ok="handleAddContact"
      @cancel="addModalVisible = false"
      :confirm-loading="addLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="用户ID" required>
          <a-input
            v-model:value="newContactUserId"
            placeholder="请输入用户ID"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  applyContact,
  deleteContact,
  handleContactRequest,
  listContacts,
  listPendingRequests,
} from '@/api/contactController.ts'

const activeTab = ref('contacts')
const loadingContacts = ref(false)
const loadingPending = ref(false)

// 联系人列表
const contactList = ref<API.ContactVO[]>([])
// 待处理申请列表
const pendingList = ref<API.ContactVO[]>([])

// 联系人表格列
const contactColumns = [
  {
    title: '好友',
    dataIndex: 'contactUserInfo',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 待处理申请表格列
const pendingColumns = [
  {
    title: '申请人',
    dataIndex: 'contactUserInfo',
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 获取联系人列表
const fetchContacts = async () => {
  loadingContacts.value = true
  try {
    const res = await listContacts({})
    if (res.data.code === 0 && res.data.data) {
      contactList.value = res.data.data.records ?? []
    } else {
      message.error('获取联系人列表失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取联系人列表失败')
  } finally {
    loadingContacts.value = false
  }
}

// 获取待处理申请列表
const fetchPendingRequests = async () => {
  loadingPending.value = true
  try {
    const res = await listPendingRequests({})
    if (res.data.code === 0 && res.data.data) {
      pendingList.value = res.data.data.records ?? []
    } else {
      message.error('获取待处理申请失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取待处理申请失败')
  } finally {
    loadingPending.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchContacts()
  fetchPendingRequests()
})

// 添加好友相关
const addModalVisible = ref(false)
const newContactUserId = ref('')
const addLoading = ref(false)

const showAddModal = () => {
  newContactUserId.value = ''
  addModalVisible.value = true
}

const handleAddContact = async () => {
  if (!newContactUserId.value) {
    message.warning('请输入用户ID')
    return
  }
  addLoading.value = true
  try {
    const res = await applyContact({
      contactUserId: newContactUserId.value,
    })
    if (res.data.code === 0) {
      message.success('好友申请已发送')
      addModalVisible.value = false
      newContactUserId.value = ''
    } else {
      message.error('发送申请失败，' + res.data.message)
    }
  } catch (error) {
    message.error('发送申请失败')
  } finally {
    addLoading.value = false
  }
}

// 处理申请 - 接受
const handleAccept = async (id: number) => {
  try {
    const res = await handleContactRequest({
      id,
      status: 1, // 1 = 接受
    })
    if (res.data.code === 0) {
      message.success('已接受好友申请')
      // 刷新两个列表
      fetchContacts()
      fetchPendingRequests()
    } else {
      message.error('处理失败，' + res.data.message)
    }
  } catch (error) {
    message.error('处理失败')
  }
}

// 处理申请 - 拒绝
const handleReject = async (id: number) => {
  try {
    const res = await handleContactRequest({
      id,
      status: 2, // 2 = 拒绝
    })
    if (res.data.code === 0) {
      message.success('已拒绝好友申请')
      // 刷新待处理列表
      fetchPendingRequests()
    } else {
      message.error('处理失败，' + res.data.message)
    }
  } catch (error) {
    message.error('处理失败')
  }
}

// 删除联系人
const doDelete = async (id: number) => {
  try {
    const res = await deleteContact({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      // 刷新联系人列表
      fetchContacts()
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped>
#contactManagePage {
  padding: 20px;
}
</style>
