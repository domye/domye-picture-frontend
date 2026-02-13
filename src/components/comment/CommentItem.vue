<template>
  <div class="comment-item">
    <!-- 评论内容 -->
    <div class="comment-main">
      <a-avatar :src="comment.userAvatar" :alt="comment.userName">
        {{ comment.userName?.charAt(0) }}
      </a-avatar>
      <div class="comment-content">
        <div class="comment-header">
          <span class="user-name">{{ comment.userName }}</span>
          <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
        </div>
        <div class="comment-text">{{ comment.content }}</div>
        <div class="comment-actions">
          <a-space>
            <a-button type="text" size="small" @click="handleReply">
              <template #icon>
                <MessageOutlined />
              </template>
              回复
            </a-button>
            <a-button v-if="showReplyToggle" type="text" size="small" @click="toggleReplyList">
              {{ showReplies ? '收起回复' : `${comment.replyCount} 条回复` }}
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 回复输入框 -->
    <div v-if="showReplyInput" class="reply-input-container">
      <a-input
        v-model:value="replyContent"
        :placeholder="`回复 ${comment.userName}`"
        :maxlength="500"
        @pressEnter="handleSubmitReply"
      >
        <template #suffix>
          <a-space>
            <a-button
              type="primary"
              size="small"
              :loading="submitting"
              :disabled="!replyContent.trim()"
              @click="handleSubmitReply"
            >
              发送
            </a-button>
            <a-button size="small" @click="cancelReply"> 取消 </a-button>
          </a-space>
        </template>
      </a-input>
    </div>

    <!-- 回复预览列表 -->
    <div
      v-if="comment.replyPreviewList && comment.replyPreviewList.length > 0"
      class="reply-preview-container"
    >
      <div
        v-if="!showReplies && comment.replyCount > comment.replyPreviewList.length"
        class="reply-preview-list"
      >
        <div
          v-for="reply in comment.replyPreviewList"
          :key="reply.commentId"
          class="reply-preview-item"
        >
          <a-avatar :src="reply.userAvatar" :alt="String(reply.userName || '用户')" :size="24">
            {{ (reply.userName || '用户').toString().charAt(0) }}
          </a-avatar>
          <div class="reply-content">
            <span class="reply-user-name">{{ reply.userName || '未知用户' }}</span>
            <span v-if="shouldShowParent(reply)" class="reply-parent">
              回复 <span class="reply-parent-name">@{{ getParentUserName(reply) }}</span>
            </span>
            <span class="reply-text">：{{ reply.content }}</span>
            <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 完整回复列表 -->
      <CommentReplyList
        ref="replyListRef"
        v-if="showReplies"
        :comment-id="comment.commentId"
        :picture-id="pictureId"
        @delete-success="handleDeleteSuccess"
        @reply-success-from-list="handleReplySuccessFromList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { addCommentUsingPost, listReplyCommentsUsingGet } from '@/api/commentController'
import type { API } from '@/api/typings'
import CommentReplyList from './CommentReplyList.vue'
import { MessageOutlined } from '@ant-design/icons-vue'
import { formatTime } from '@/utils'

interface Props {
  comment: API.CommentListVO
  pictureId: number | string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  replySuccess: []
  deleteSuccess: []
  commentUpdated: [API.CommentListVO]
}>()

// 回复内容
const replyContent = ref('')
// 显示回复输入框
const showReplyInput = ref(false)
// 显示完整回复列表
const showReplies = ref(false)
// 提交状态
const submitting = ref(false)
// 加载回复列表状态
const loadingReplies = ref(false)
// 回复列表组件引用
const replyListRef = ref<InstanceType<typeof CommentReplyList> | null>(null)

// 是否显示回复切换按钮
const showReplyToggle = computed(() => {
  return props.comment.replyCount && props.comment.replyCount > 0
})

// 判断是否应该显示"回复 @xxx"
// 如果 parentId === comment.commentId，说明是二级回复（直接回复根评论），不显示
// 否则是三级及以上回复，需要显示
const shouldShowParent = (reply: API.CommentReplyVO) => {
  // 如果没有 parentId，不显示
  if (!reply.parentId) {
    return false
  }

  // 如果 parentId === comment.commentId，说明是直接回复根评论（二级回复），不显示
  // 注意：commentId 和 parentId 可能都是字符串类型，需要转成相同类型比较
  if (String(reply.parentId) === String(props.comment.commentId)) {
    return false
  }
  return true
}

// 获取父评论的用户名
// 如果 parentUserName 存在，直接返回
// 否则从 replyPreviewList 中查找父评论的 userName
const getParentUserName = (reply: API.CommentReplyVO): string => {
  // 如果 API 返回了 parentUserName，直接使用
  if (reply.parentUserName) {
    return reply.parentUserName
  }

  // 否则从当前列表中查找父评论
  if (!reply.parentId) {
    return '未知用户'
  }

  const parentReply = props.comment.replyPreviewList?.find(
    (r) => String(r.commentId) === String(reply.parentId),
  )
  if (parentReply) {
    return parentReply.userName || '未知用户'
  }
  return '未知用户'
}

// 处理回复
const handleReply = () => {
  showReplyInput.value = true
  showReplies.value = true
  replyContent.value = ''
}

// 加载回复预览列表
const loadReplyPreviews = async () => {
  if (!props.pictureId || !props.comment.commentId) return

  try {
    loadingReplies.value = true
    const res = await listReplyCommentsUsingGet({
      pictureId: props.pictureId,
      commentId: props.comment.commentId,
      current: 1,
      pageSize: 5,
    })

    if (res.data.code === 0 && res.data.data) {
      const rootComment = res.data.data.records?.[0]
      if (rootComment) {
        const updatedComment = {
          ...props.comment,
          replyCount: rootComment.replyCount || 0,
          replyPreviewList: rootComment.replyPreviewList || [],
        }
        emit('commentUpdated', updatedComment)
      }
    }
  } catch {
  } finally {
    loadingReplies.value = false
  }
}

// 提交回复
const handleSubmitReply = async () => {
  const content = replyContent.value.trim()
  if (!content) {
    message.warning('请输入回复内容')
    return
  }

  if (!props.pictureId) {
    message.error('图片ID不存在')
    return
  }

  if (!props.comment.commentId) {
    message.error('评论ID不存在')
    return
  }

  submitting.value = true
  try {
    const res = await addCommentUsingPost({
      pictureid: props.pictureId,
      parentid: props.comment.commentId,
      content: content,
    })

    if (res.data.code === 0) {
      message.success('回复成功')
      replyContent.value = ''
      showReplyInput.value = false
      await loadReplyPreviews()
      // 刷新回复列表组件
      if (replyListRef.value) {
        await replyListRef.value.refresh()
      }
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
  showReplyInput.value = false
}

// 切换回复列表显示
const toggleReplyList = () => {
  showReplies.value = !showReplies.value
}

// 回复成功回调（从回复列表来的）
const handleReplySuccessFromList = async () => {
  await loadReplyPreviews()
  emit('replySuccess')
}

// 删除成功回调
const handleDeleteSuccess = () => {
  emit('deleteSuccess')
}
</script>

<style scoped>
.comment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  color: #555;
  line-height: 1.6;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.reply-input-container {
  margin-left: 48px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.reply-preview-container {
  margin-left: 48px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.reply-preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-preview-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.reply-content {
  flex: 1;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.reply-user-name {
  font-weight: 500;
  color: #333;
}

.reply-parent {
  color: #999;
  margin: 0 4px;
}

.reply-parent-name {
  color: #1890ff;
}

.reply-text {
  color: #555;
}

.reply-time {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

:deep(.ant-btn-text) {
  color: #666;
}

:deep(.ant-btn-text:hover) {
  color: #1890ff;
}
</style>
