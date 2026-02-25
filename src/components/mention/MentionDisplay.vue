<template>
  <span class="mention-display">
    <template v-for="(segment, index) in renderedSegments" :key="index">
      <router-link
        v-if="segment.type === 'mention' && segment.userId"
        :to="`/user/${segment.userId}`"
        class="mention-link"
        :class="{ 'is-ai': segment.isAI }"
      >
        @{{ segment.userName }}
      </router-link>
      <span v-else-if="segment.type === 'mention'" class="mention-link is-ai">
        @{{ segment.userName }}
      </span>
      <span v-else>{{ segment.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { API } from '@/api/typings'

// AI 助手 ID 和名称
const AI_ASSISTANT_ID = '2020004031158120450'
const AI_ASSISTANT_NAME = 'AI助手'

interface Props {
  content: string
  mentionedUsers?: API.CommentMentionVO[]
}

const props = defineProps<Props>()

interface TextSegment {
  type: 'mention' | 'text'
  text?: string
  userName?: string
  userId?: number | string
  isAI?: boolean
}

const renderedSegments = computed<TextSegment[]>(() => {
  const content = props.content || ''
  const mentionedUsers = props.mentionedUsers || []

  if (!content) {
    return []
  }

  const segments: TextSegment[] = []
  const mentionRegex = /@([^\s]+)/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionText = match[1]
    const matchIndex = match.index

    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        text: content.slice(lastIndex, matchIndex),
      })
    }

    // 检查是否是 AI 助手
    const isAIAssistant = mentionText === AI_ASSISTANT_NAME

    // 在 mentionedUsers 中查找匹配的用户
    const mentionedUser = mentionedUsers.find((user) => user.mentionedUserName === mentionText)

    if (mentionedUser && mentionedUser.mentionedUserId) {
      segments.push({
        type: 'mention',
        text: `@${mentionText}`,
        userName: mentionText,
        userId: mentionedUser.mentionedUserId,
        isAI: isAIAssistant,
      })
    } else if (isAIAssistant) {
      // AI 助手即使不在 mentionedUsers 中也显示高亮
      segments.push({
        type: 'mention',
        text: `@${mentionText}`,
        userName: AI_ASSISTANT_NAME,
        userId: AI_ASSISTANT_ID,
        isAI: true,
      })
    } else {
      segments.push({
        type: 'text',
        text: `@${mentionText}`,
      })
    }

    lastIndex = mentionRegex.lastIndex
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.slice(lastIndex),
    })
  }

  return segments
})
</script>

<style scoped>
.mention-display {
  color: #555;
  line-height: 1.6;
  word-break: break-word;
}

.mention-link {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.mention-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.mention-link.is-ai {
  background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
}

.mention-link.is-ai:hover {
  opacity: 0.8;
}
</style>
