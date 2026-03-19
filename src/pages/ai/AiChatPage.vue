<template>
  <div id="aiChatPage">
    <!-- 左侧会话列表 -->
    <div class="session-panel">
      <div class="session-header">
        <h3>AI 助手</h3>
        <a-button type="primary" @click="handleCreateSession" :loading="creating">
          <template #icon><PlusOutlined /></template>
          新对话
        </a-button>
      </div>

      <!-- 空间选择 -->
      <div class="space-selector" v-if="currentSession">
        <span class="label">当前空间：</span>
        <a-select
          v-model:value="selectedSpaceId"
          placeholder="选择空间以搜索图片"
          allowClear
          style="width: 100%"
          @change="handleSpaceChange"
        >
          <a-select-option v-for="space in spaceList" :key="space.id" :value="space.id">
            {{ space.spaceName }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 会话列表 -->
      <div class="session-list">
        <div
          v-for="session in sessionList"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSession?.id === session.id }"
          @click="handleSelectSession(session)"
        >
          <div class="session-info">
            <div class="session-title">{{ session.title || '新对话' }}</div>
            <div class="session-meta">
              <span>{{ session.messageCount || 0 }} 条消息</span>
            </div>
          </div>
          <a-popconfirm
            title="确定删除这个对话吗？"
            @confirm="handleDeleteSession(session.id)"
            placement="right"
          >
            <a-button type="text" danger size="small" @click.stop>
              <DeleteOutlined />
            </a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-panel">
      <!-- 欢迎界面 -->
      <div v-if="!currentSession" class="welcome-container">
        <RobotOutlined class="welcome-icon" />
        <h2>AI 图片助手</h2>
        <p>我可以帮你搜索图片、回答关于图片的问题</p>
        <a-button type="primary" size="large" @click="handleCreateSession" :loading="creating">
          开始对话
        </a-button>
      </div>

      <!-- 聊天界面 -->
      <template v-else>
        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <div v-for="msg in messageList" :key="msg.id" class="message-item" :class="msg.role">
            <div class="message-avatar">
              <a-avatar v-if="msg.role === 'user'" :style="{ backgroundColor: '#748cbc' }">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <a-avatar v-else :style="{ backgroundColor: '#52c41a' }">
                <template #icon><RobotOutlined /></template>
              </a-avatar>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
              <div class="message-time">{{ formatTime(msg.createTime) }}</div>
            </div>
          </div>

          <!-- AI 正在输入 -->
          <div v-if="streaming" class="message-item assistant streaming">
            <div class="message-avatar">
              <a-avatar :style="{ backgroundColor: '#52c41a' }">
                <template #icon><RobotOutlined /></template>
              </a-avatar>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(streamingContent)"></div>
              <span class="typing-indicator"></span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <a-textarea
            v-model:value="inputMessage"
            placeholder="输入消息，按 Enter 发送，Shift+Enter 换行"
            :auto-size="{ minRows: 1, maxRows: 4 }"
            @keydown="handleKeydown"
            :disabled="streaming"
          />
          <a-button
            type="primary"
            @click="handleSendMessage"
            :loading="streaming"
            :disabled="!inputMessage.trim() || streaming"
          >
            <template #icon><SendOutlined /></template>
            发送
          </a-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  RobotOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
} from '@ant-design/icons-vue'
import {
  getUserSessions,
  createSession,
  deleteSession,
  getSessionMessages,
  clearSessionMessages,
} from '@/api/aiChatController'
import { listMyTeamSpace } from '@/api/spaceUserController'
import { getBaseUrl } from '@/config/env'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

// 状态
const sessionList = ref<API.ChatSession[]>([])
const currentSession = ref<API.ChatSession | null>(null)
const messageList = ref<API.ChatMessage[]>([])
const inputMessage = ref('')
const streaming = ref(false)
const streamingContent = ref('')
const creating = ref(false)
const messageListRef = ref<HTMLElement | null>(null)
const spaceList = ref<API.SpaceVO[]>([])
const selectedSpaceId = ref<number | undefined>(undefined)

const loginUserStore = useLoginUserStore()

// SSE 相关

// 加载会话列表
const fetchSessionList = async () => {
  try {
    const res = await getUserSessions()
    if (res.data.code === 0 && res.data.data) {
      sessionList.value = res.data.data
    }
  } catch (error) {
    console.error('获取会话列表失败', error)
  }
}

// 加载空间列表
const fetchSpaceList = async () => {
  try {
    const res = await listMyTeamSpace()
    if (res.data.code === 0 && res.data.data) {
      // 从 SpaceUserVO 中提取 space
      spaceList.value = res.data.data.map((item) => item.space).filter(Boolean) as API.SpaceVO[]
    }
  } catch (error) {
    console.error('获取空间列表失败', error)
  }
}

// 创建新会话
const handleCreateSession = async () => {
  creating.value = true
  try {
    const res = await createSession({
      spaceId: selectedSpaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      sessionList.value.unshift(res.data.data)
      currentSession.value = res.data.data
      messageList.value = []
      message.success('创建新对话成功')
    } else {
      message.error('创建对话失败：' + res.data.message)
    }
  } catch (error) {
    message.error('创建对话失败')
  } finally {
    creating.value = false
  }
}

// 选择会话
const handleSelectSession = async (session: API.ChatSession) => {
  currentSession.value = session
  selectedSpaceId.value = session.spaceId
  await fetchMessages(session.id!)
}

// 获取会话消息
const fetchMessages = async (sessionId: string) => {
  try {
    const res = await getSessionMessages({ sessionId })
    if (res.data.code === 0 && res.data.data) {
      messageList.value = res.data.data
      scrollToBottom()
    }
  } catch (error) {
    console.error('获取消息失败', error)
  }
}

// 删除会话
const handleDeleteSession = async (sessionId: string) => {
  try {
    const res = await deleteSession({ sessionId })
    if (res.data.code === 0) {
      sessionList.value = sessionList.value.filter((s) => s.id !== sessionId)
      if (currentSession.value?.id === sessionId) {
        currentSession.value = null
        messageList.value = []
      }
      message.success('删除成功')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 发送消息 (SSE 流式)
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || !currentSession.value || streaming.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息到列表
  const tempUserMsg: API.ChatMessage = {
    id: 'temp-' + Date.now(),
    sessionId: currentSession.value.id,
    role: 'user',
    content: userMessage,
    createTime: new Date().toISOString(),
  }
  messageList.value.push(tempUserMsg)
  scrollToBottom()

  // 开始 SSE 流式请求
  streaming.value = true
  streamingContent.value = ''

  try {
    await sendSSEMessage(userMessage)
  } catch (error) {
    message.error('发送消息失败')
    streaming.value = false
  }
}

// SSE 流式发送
const sendSSEMessage = async (content: string) => {
  if (!currentSession.value) return

  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/ai/chat/stream`

  // 使用 fetch 发送 POST 请求并处理 SSE 响应
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      sessionId: currentSession.value.id,
      message: content,
      spaceId: selectedSpaceId.value,
    }),
  })

  if (!response.ok) {
    throw new Error('请求失败')
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法读取响应')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim()
        if (data === '[DONE]') {
          streaming.value = false
          // 刷新消息列表
          await fetchMessages(currentSession.value.id!)
          return
        }

        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            streamingContent.value += parsed.content
            scrollToBottom()
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }

  streaming.value = false
  await fetchMessages(currentSession.value.id!)
}

// 空间变化
const handleSpaceChange = () => {
  // 空间变化时可以选择创建新会话或继续当前会话
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 格式化消息 (支持简单的 markdown)
const formatMessage = (content: string | undefined) => {
  if (!content) return ''
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm')
}

// 页面加载
onMounted(() => {
  if (loginUserStore.loginUser.id) {
    fetchSessionList()
    fetchSpaceList()
  }
})

// 监听登录状态
watch(
  () => loginUserStore.loginUser.id,
  (newId) => {
    if (newId) {
      fetchSessionList()
      fetchSpaceList()
    }
  },
)
</script>

<style scoped>
#aiChatPage {
  display: flex;
  height: calc(100vh - 140px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧会话面板 */
.session-panel {
  width: 200px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.session-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.space-selector {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.space-selector .label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.session-item:hover {
  background: #e6f7ff;
}

.session-item.active {
  background: #e6f7ff;
  border-left: 3px solid #748cbc;
}

.session-info {
  flex: 1;
  overflow: hidden;
}

.session-title {
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 右侧聊天面板 */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background: #fff; */
}

/* 欢迎界面 */
.welcome-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.welcome-icon {
  font-size: 64px;
  color: #52c41a;
  margin-bottom: 16px;
}

.welcome-container h2 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.welcome-container p {
  margin: 0 0 24px 0;
  color: #999;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-item.user .message-content {
  background: #748cbc;
  color: white;
}

.message-item.assistant .message-content {
  background: white;
}

.message-text {
  word-break: break-word;
  line-height: 1.6;
}

.message-item.user .message-text code {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 4px;
  border-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 打字指示器 */
.typing-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #52c41a;
  border-radius: 50%;
  margin-left: 4px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.input-area :deep(.ant-input) {
  flex: 1;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  #aiChatPage {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 140px);
  }

  .session-panel {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }

  .session-list {
    display: flex;
    overflow-x: auto;
    padding: 8px;
  }

  .session-item {
    flex-shrink: 0;
    min-width: 150px;
  }

  .message-content {
    max-width: 85%;
  }
}
</style>
