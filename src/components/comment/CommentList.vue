<template>
  <div class="comment-list-container">
    <!-- 评论输入框 -->
    <a-card class="comment-input-card" :bordered="false">
      <MentionInput
        v-model="commentContent"
        :friends="friendList"
        placeholder="写下你的评论..."
        :auto-size="{ minRows: 3, maxRows: 6 }"
        :maxlength="500"
        ref="mentionInputRef"
      />
      <div class="input-actions">
        <a-button
          type="primary"
          :loading="submitting"
          :disabled="!commentContent.trim()"
          @click="handleSubmitComment"
        >
          发表评论
        </a-button>
      </div>
    </a-card>

    <!-- 评论列表 -->
    <div class="comments-container">
      <a-spin :spinning="loading">
        <div v-if="commentList.length > 0" class="comment-items">
          <CommentItem
            v-for="comment in commentList"
            :key="comment.commentId"
            :comment="comment"
            :picture-id="pictureId"
            :friends="friendList"
            @reply-success="handleReplySuccess"
            @delete-success="handleDeleteSuccess"
            @comment-updated="handleCommentUpdated"
          />
        </div>

        <!-- 空状态 -->
        <a-empty v-else-if="!loading" description="暂无评论，快来抢沙发吧~" />

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more-container">
          <a-button :loading="loadingMore" @click="loadMoreComments"> 加载更多评论 </a-button>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { addComment, listTopComments, getFriends } from '@/api/commentController'
import type { API } from '@/api/typings'
import CommentItem from './CommentItem.vue'
import MentionInput from '@/components/mention/MentionInput.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()

// 获取好友列表
const fetchFriendList = async () => {
  try {
    const res = await getFriends()
    if (res.data.code === 0 && res.data.data) {
      friendList.value = res.data.data || []
    }
  } catch (e: any) {
    console.error('获取好友列表失败:', e)
  }
}

interface Props {
  pictureId: number | string
}

const props = defineProps<Props>()

// 评论内容
const commentContent = ref('')
// 好友列表
const friendList = ref<API.UserVO[]>([])
// MentionInput ref
const mentionInputRef = ref<InstanceType<typeof MentionInput>>()
// 评论列表
const commentList = ref<API.CommentListVO[]>([])
// 加载状态
const loading = ref(false)
// 提交状态
const submitting = ref(false)
// 分页信息
const current = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(false)
const loadingMore = ref(false)

// 获取评论列表
const fetchCommentList = async (page: number = 1, append: boolean = false) => {
  if (!props.pictureId) return

  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }

    const res = await listTopComments({
      pictureId: props.pictureId,
      current: page,
      pageSize: pageSize.value,
      previewSize: 5,
    })
    if (res.data.code === 0 && res.data.data) {
      const { records, total: totalCount, current: currentPage } = res.data.data
      // 确保 records 是数组
      const newRecords = Array.isArray(records) ? records : []
      if (append) {
        commentList.value = [...commentList.value, ...newRecords]
      } else {
        commentList.value = newRecords
      }

      total.value = Number(totalCount)
      current.value = Number(currentPage)
      hasMore.value = commentList.value.length < Number(totalCount)
    } else {
      message.error('获取评论列表失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取评论列表失败：' + e.message)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 发表评论
const handleSubmitComment = async () => {
  const content = commentContent.value.trim()
  if (!content) {
    message.warning('请输入评论内容')
    return
  }

  if (!props.pictureId) {
    message.error('图片 ID 不存在')
    return
  }

  submitting.value = true
  try {
    // 获取@的用户
    const mentionedUsers = mentionInputRef.value?.getMentionedUsers() || []
    const mentionedUserIds = mentionedUsers.map((user) => user.id).filter(Boolean) as number[]

    console.log('[CommentList] Submitting comment:', {
      pictureid: props.pictureId,
      content: content,
      mentionedUsers,
      mentionedUserIds,
    })

    const res = await addComment({
      pictureid: props.pictureId,
      content: content,
      mentionedUserIds,
    })

    if (res.data.code === 0) {
      message.success('发表成功')

      const newCommentId = res.data.data

      await fetchCommentList(1, false)

      // 乐观更新（如果刷新后还是没有显示）
      if (commentList.value.length === 0) {
        const currentUser = loginUserStore.loginUser
        const tempComment: API.CommentListVO = {
          commentId: newCommentId,
          userId: currentUser?.id || 0,
          userName: currentUser?.userName || '我',
          userAvatar: currentUser?.userAvatar || '',
          content: content,
          replyCount: 0,
          createTime: new Date().toISOString(),
          replyPreviewList: [],
        }
        commentList.value.unshift(tempComment)
      }

      commentContent.value = ''
    } else {
      message.error('发表失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('发表失败：' + e.message)
  } finally {
    submitting.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  fetchCommentList(current.value + 1, true)
}

// 回复成功回调
const handleReplySuccess = () => {
  // 不再刷新整个评论列表，通过 commentUpdated 事件局部更新
}

// 删除成功回调
const handleDeleteSuccess = () => {
  // 如果当前页只有 1 条数据且不是第一页，则回到上一页
  let pageToLoad = current.value
  if (commentList.value.length === 1 && current.value > 1) {
    pageToLoad = current.value - 1
  }
  fetchCommentList(pageToLoad, false)
}

// 评论更新回调（用于更新回复数和回复预览列表）
const handleCommentUpdated = (updatedComment: API.CommentListVO) => {
  const index = commentList.value.findIndex(
    (comment) => comment.commentId === updatedComment.commentId,
  )
  if (index !== -1) {
    // 使用 splice 确保 Vue 响应式更新
    commentList.value.splice(index, 1, updatedComment)
  }
}

// 监听 pictureId 变化
watch(
  () => props.pictureId,
  (newId) => {
    if (newId) {
      commentList.value = []
      current.value = 1
      fetchCommentList(1, false)
    }
  },
  { immediate: true },
)

// 获取好友列表
onMounted(() => {
  fetchFriendList()
})
</script>

<style scoped>
.comment-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-input-card {
  background: #fafafa;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comments-container {
  min-height: 200px;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

:deep(.ant-empty) {
  padding: 40px 0;
}
</style>
