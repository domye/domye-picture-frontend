<template>
  <span class="mention-display">
    <template v-for="(segment, index) in renderedSegments" :key="index">
      <router-link
        v-if="segment.type === 'mention'"
        :to="`/user/${segment.userId}`"
        class="mention-link"
      >
        @{{ segment.userName }}
      </router-link>
      <span v-else>{{ segment.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { API } from '@/api/typings'

interface Props {
  content: string
  mentionedUsers?: API.CommentMentionVO[]
}

const props = defineProps<Props>()

interface TextSegment {
  type: 'mention' | 'text'
  text?: string
  userName?: string
  userId?: number
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

    const mentionedUser = mentionedUsers.find((user) => user.mentionedUserName === mentionText)

    if (mentionedUser && mentionedUser.mentionedUserId) {
      segments.push({
        type: 'mention',
        text: `@${mentionText}`,
        userName: mentionText,
        userId: mentionedUser.mentionedUserId,
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
</style>
