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
        <MentionDisplay
          class="comment-text"
          :content="comment.content"
          :mentioned-users="comment.mentionedUsers"
        />
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
      <MentionInput
        v-model="replyContent"
        :friends="friends || []"
        :placeholder="`回复 ${comment.userName}`"
        :maxlength="500"
        :auto-size="{ minRows: 1, maxRows: 1 }"
        ref="replyMentionRef"
      />
      <div class="reply-actions">
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
      </div>
    </div>

    <!-- 回复预览列表（未展开时显示） -->
    <div
      v-if="!showReplies && comment.replyPreviewList && comment.replyPreviewList.length > 0"
      class="reply-preview-container"
    >
      <div class="reply-preview-list">
        <div
          v-for="(reply, index) in comment.replyPreviewList"
          :key="reply.commentId || `preview-${index}`"
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
    </div>

    <!-- 完整回复列表（展开时显示） -->
    <div v-if="showReplies" class="reply-preview-container">
      <CommentReplyList
        ref="replyListRef"
        :comment-id="comment.commentId"
        :picture-id="pictureId"
        :friends="friends"
        @delete-success="handleDeleteSuccess"
        @new-reply-added="handleNewReplyAdded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { addComment, listReplyComments } from '@/api/commentController'
import type { API } from '@/api/typings'
import CommentReplyList from './CommentReplyList.vue'
import MentionInput from '@/components/mention/MentionInput.vue'
import MentionDisplay from '@/components/mention/MentionDisplay.vue'
import { MessageOutlined } from '@ant-design/icons-vue'
import { formatTime } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

interface Props {
  comment: API.CommentListVO
  pictureId: number | string
  friends?: API.UserVO[]
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
// MentionInput ref for reply
const replyMentionRef = ref<InstanceType<typeof MentionInput> | null>(null)

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
    const res = await listReplyComments({
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
    message.error('图片 ID 不存在')
    return
  }

  if (!props.comment.commentId) {
    message.error('评论 ID 不存在')
    return
  }

  submitting.value = true
  try {
    // 获取@的用户
    const mentionedUsers = replyMentionRef.value?.getMentionedUsers() || []
    const mentionedUserIds = mentionedUsers.map((user) => user.id).filter(Boolean) as number[]

    console.log('[CommentItem] Submitting reply:', {
      pictureid: props.pictureId,
      parentid: props.comment.commentId,
      content: content,
      mentionedUsers,
      mentionedUserIds,
    })

    const res = await addComment({
      pictureid: props.pictureId,
      parentid: props.comment.commentId,
      content: content,
      mentionedUserIds,
    })

    if (res.data.code === 0) {
      message.success('回复成功')
      const newReplyId = res.data.data || `temp-${Date.now()}`
      const currentUser = useLoginUserStore().loginUser

      // 构建新回复对象
      const newReply: API.CommentReplyVO = {
        commentId: newReplyId,
        userId: currentUser?.id,
        userName: currentUser?.userName || '我',
        userAvatar: currentUser?.userAvatar || '',
        content: content,
        parentId: props.comment.commentId,
        createTime: new Date().toISOString(),
      }

      replyContent.value = ''
      showReplyInput.value = false

      // 创建更新后的评论对象（不直接修改 props）
      const updatedReplyPreviewList = [...(props.comment.replyPreviewList || []), newReply]
      const updatedComment: API.CommentListVO = {
        ...props.comment,
        replyPreviewList: updatedReplyPreviewList,
        replyCount: (props.comment.replyCount || 0) + 1,
      }

      // 如果回复列表已展开，使用乐观更新添加新回复
      if (replyListRef.value && showReplies.value) {
        replyListRef.value.addReply(newReply)
      }

      // 通知父组件更新
      emit('commentUpdated', updatedComment)
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

// 回复成功回调（从回复列表来的，带有新回复数据）
const handleNewReplyAdded = (newReply: API.CommentReplyVO) => {
  // 创建更新后的评论对象（不直接修改 props）
  const updatedReplyPreviewList = [...(props.comment.replyPreviewList || []), newReply]
  const updatedComment: API.CommentListVO = {
    ...props.comment,
    replyPreviewList: updatedReplyPreviewList,
    replyCount: (props.comment.replyCount || 0) + 1,
  }

  // 通知父组件更新
  emit('commentUpdated', updatedComment)
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

.reply-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
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
