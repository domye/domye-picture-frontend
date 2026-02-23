<template>
  <div class="reply-list-container">
    <a-spin :spinning="loading">
      <div v-if="replyList.length > 0" class="reply-list">
        <div
          v-for="(reply, index) in replyList"
          :key="reply.commentId || `reply-${index}`"
          class="reply-item"
        >
          <a-avatar :src="reply.userAvatar" :alt="String(reply.userName || '用户')" :size="28">
            {{ (reply.userName || '用户').toString().charAt(0) }}
          </a-avatar>
          <div class="reply-content-wrapper">
            <div class="reply-header">
              <span class="reply-user-name">{{ reply.userName || '未知用户' }}</span>
              <span v-if="shouldShowParent(reply)" class="reply-parent">
                回复 <span class="reply-parent-name">@{{ getParentUserName(reply) }}</span>
              </span>
              <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
            </div>
            <MentionDisplay
              class="reply-text"
              :content="reply.content || ''"
              :mentioned-users="reply.mentionedUsers"
            />
            <div class="reply-actions">
              <a-button type="text" size="small" @click="handleReply(reply)">
                <template #icon>
                  <MessageOutlined />
                </template>
                回复
              </a-button>
            </div>

            <!-- 回复的回复输入框 -->
            <div v-if="showReplyInputFor === reply.commentId" class="reply-input-container">
              <MentionInput
                :ref="(el) => setReplyRef(reply.commentId, el)"
                v-model="replyContent"
                :friends="friends || []"
                :placeholder="`回复 ${reply.userName}`"
                :maxlength="500"
                :auto-size="{ minRows: 1, maxRows: 1 }"
                @pressEnter="handleSubmitReply(reply)"
              />
              <div class="reply-input-actions">
                <a-space>
                  <a-button
                    type="primary"
                    size="small"
                    :loading="submitting"
                    :disabled="!replyContent.trim()"
                    @click="handleSubmitReply(reply)"
                  >
                    发送
                  </a-button>
                  <a-button size="small" @click="cancelReply"> 取消 </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-empty v-else-if="!loading" description="暂无回复" :image="null">
        <template #description>
          <span style="color: #999; font-size: 14px">暂无回复</span>
        </template>
      </a-empty>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more-container">
        <a-button :loading="loadingMore" size="small" @click="loadMoreReplies">
          加载更多回复
        </a-button>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { addComment, listReplyComments } from '@/api/commentController'
import type { API } from '@/api/typings'
import { MessageOutlined } from '@ant-design/icons-vue'
import { formatTime } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import MentionInput from '@/components/mention/MentionInput.vue'
import MentionDisplay from '@/components/mention/MentionDisplay.vue'

interface Props {
  commentId: number | string
  pictureId: number | string
  friends?: API.UserVO[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleteSuccess: []
  replySuccess: []
  // 传递新回复数据给父组件
  newReplyAdded: [API.CommentReplyVO]
}>()

// 回复列表
const replyList = ref<API.CommentReplyVO[]>([])
// 加载状态
const loading = ref(false)
// 加载更多状态
const loadingMore = ref(false)
// 分页信息
const current = ref(1)
const pageSize = ref(5)
const total = ref(0)
const hasMore = ref(false)

// 回复输入相关
const replyContent = ref('')
const showReplyInputFor = ref<number | null>(null)
const submitting = ref(false)

// Store refs for each reply's MentionInput
const replyInputRefs = ref<Map<string | number, InstanceType<typeof MentionInput>>>(new Map())

const setReplyRef = (replyId: string | number, el: any) => {
  if (el) replyInputRefs.value.set(replyId, el)
}

// 获取回复列表
const fetchReplyList = async (page: number = 1, append: boolean = false) => {
  if (!props.commentId || !props.pictureId) return

  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }

    const res = await listReplyComments({
      pictureId: props.pictureId,
      commentId: props.commentId,
      current: page,
      pageSize: pageSize.value,
    })

    if (res.data.code === 0 && res.data.data) {
      // 根评论的回复都在 replyPreviewList 中
      const rootComment = res.data.data.records?.[0]

      if (rootComment?.replyPreviewList) {
        if (append) {
          replyList.value = [...replyList.value, ...rootComment.replyPreviewList]
        } else {
          replyList.value = rootComment.replyPreviewList
        }

        total.value = rootComment.replyCount || 0
        current.value = page
        hasMore.value = replyList.value.length < total.value
      }
    } else {
      message.error('获取回复列表失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取回复列表失败：' + e.message)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 处理回复
const handleReply = (reply: API.CommentReplyVO) => {
  showReplyInputFor.value = reply.commentId
  replyContent.value = ''
}

// 提交回复
const handleSubmitReply = async (reply: API.CommentReplyVO) => {
  const content = replyContent.value.trim()
  if (!content) {
    message.warning('请输入回复内容')
    return
  }

  // Get mentioned users from the MentionInput ref
  const mentionInputRef = replyInputRefs.value.get(reply.commentId)
  const mentionedUsers = mentionInputRef?.getMentionedUsers() || []
  const mentionedUserIds = mentionedUsers.map((u) => u.id).filter(Boolean) as number[]

  console.log('[CommentReplyList] Submitting reply:', {
    pictureid: props.pictureId,
    parentid: reply.commentId,
    content: content,
    mentionedUsers,
    mentionedUserIds,
  })

  if (!props.pictureId) {
    message.error('图片 ID 不存在')
    return
  }

  if (!reply.commentId) {
    message.error('回复 ID 不存在')
    return
  }

  submitting.value = true
  try {
    const res = await addComment({
      pictureid: props.pictureId,
      parentid: reply.commentId,
      content: content,
      mentionedUserIds,
    })

    if (res.data.code === 0) {
      message.success('回复成功')
      replyContent.value = ''
      showReplyInputFor.value = null

      // 乐观更新：直接将新回复添加到列表末尾，保持当前分页状态
      const newReplyId = res.data.data || `temp-${Date.now()}`
      const currentUser = useLoginUserStore().loginUser

      // 构建新回复对象
      const newReply: API.CommentReplyVO = {
        commentId: newReplyId,
        userId: currentUser?.id,
        userName: currentUser?.userName || '我',
        userAvatar: currentUser?.userAvatar || '',
        content: content,
        parentId: reply.commentId,
        parentUserName: reply.userName,
        createTime: new Date().toISOString(),
      }

      // 直接追加到列表末尾
      replyList.value.push(newReply)
      total.value += 1

      emit('replySuccess')
      emit('newReplyAdded', newReply)
    } else {
      message.error('回复失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('回复失败：' + e.message)
  } finally {
    submitting.value = false
  }
}

// 取消回复
const cancelReply = () => {
  replyContent.value = ''
  showReplyInputFor.value = null
}

// 加载更多回复
const loadMoreReplies = () => {
  fetchReplyList(current.value + 1, true)
}

// 判断是否应该显示"回复 @xxx"
// 如果 parentId === commentId，说明是二级回复（直接回复根评论），不显示
// 否则是三级及以上回复，需要显示
const shouldShowParent = (reply: API.CommentReplyVO) => {
  // 如果没有 parentId，不显示
  if (!reply.parentId) {
    return false
  }

  // 如果 parentId === commentId，说明是直接回复根评论（二级回复），不显示
  // 注意：commentId 和 parentId 可能都是字符串类型，需要转成相同类型比较
  if (String(reply.parentId) === String(props.commentId)) {
    return false
  }
  return true
}

// 获取父评论的用户名
// 如果 parentUserName 存在，直接返回
// 否则从 replyList 中查找父评论的 userName
const getParentUserName = (reply: API.CommentReplyVO): string => {
  // 如果 API 返回了 parentUserName，直接使用
  if (reply.parentUserName) {
    return reply.parentUserName
  }

  // 否则从当前列表中查找父评论
  if (!reply.parentId) {
    return '未知用户'
  }

  const parentReply = replyList.value.find((r) => String(r.commentId) === String(reply.parentId))
  if (parentReply) {
    return parentReply.userName || '未知用户'
  }
  return '未知用户'
}

// 监听 commentId 变化
watch(
  () => props.commentId,
  (newId) => {
    if (newId && props.pictureId) {
      replyList.value = []
      current.value = 1
      fetchReplyList(1, false)
    }
  },
  { immediate: true },
)

// 暴露方法给父组件
defineExpose({
  refresh: () => fetchReplyList(1, false),
  // 添加新回复（乐观更新，保持当前分页状态）
  addReply: (newReply: API.CommentReplyVO) => {
    replyList.value.push(newReply)
    total.value += 1
  },
})
</script>

<style scoped>
.reply-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 8px 0;
}

.reply-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.reply-user-name {
  font-weight: 500;
  color: #333;
}

.reply-parent {
  color: #999;
}

.reply-parent-name {
  color: #1890ff;
}

.reply-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.reply-text {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.reply-actions {
  display: flex;
  gap: 8px;
}

.reply-input-container {
  margin-top: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  padding: 8px 0;
}

:deep(.ant-btn-text) {
  color: #666;
  font-size: 13px;
}

:deep(.ant-btn-text:hover) {
  color: #1890ff;
}
</style>

.reply-input-actions { margin-top: 8px; display: flex; justify-content: flex-end; }
