<template>
  <div class="comment-list-container">
    <!-- 评论输入框 -->
    <a-card class="comment-input-card" :bordered="false">
      <a-textarea
        v-model:value="commentContent"
        placeholder="写下你的评论..."
        :auto-size="{ minRows: 3, maxRows: 6 }"
        :maxlength="500"
        show-count
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
            @reply-success="handleReplySuccess"
            @delete-success="handleDeleteSuccess"
          />
        </div>

        <!-- 空状态 -->
        <a-empty
          v-else-if="!loading"
          description="暂无评论，快来抢沙发吧~"
        />

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more-container">
          <a-button :loading="loadingMore" @click="loadMoreComments">
            加载更多评论
          </a-button>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { addCommentUsingPost, listTopCommentsUsingGet } from '@/api/commentController'
import type { API } from '@/api/typings'
import CommentItem from './CommentItem.vue'

interface Props {
  pictureId: number
}

const props = defineProps<Props>()

// 评论内容
const commentContent = ref('')
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

    const res = await listTopCommentsUsingGet({
      pictureId: props.pictureId,
      current: page,
      pageSize: pageSize.value,
      previewSize: 5,
    })

    if (res.data.code === 0 && res.data.data) {
      const { records, total: totalCount, current: currentPage } = res.data.data

      if (append) {
        commentList.value = [...commentList.value, ...records]
      } else {
        commentList.value = records
      }

      total.value = totalCount
      current.value = currentPage
      hasMore.value = commentList.value.length < totalCount
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
    message.error('图片ID不存在')
    return
  }

  submitting.value = true
  try {
    const res = await addCommentUsingPost({
      pictureid: props.pictureId,
      content: content,
    })

    if (res.data.code === 0) {
      message.success('发表成功')
      commentContent.value = ''
      // 刷新评论列表
      await fetchCommentList(1, false)
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
  // 刷新评论列表
  fetchCommentList(1, false)
}

// 删除成功回调
const handleDeleteSuccess = () => {
  // 刷新评论列表
  fetchCommentList(1, false)
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
  { immediate: true }
)

onMounted(() => {
  if (props.pictureId) {
    fetchCommentList(1, false)
  }
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
