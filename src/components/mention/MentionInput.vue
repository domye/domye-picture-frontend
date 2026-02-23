<template>
  <div class="mention-input-wrapper">
    <a-textarea
      ref="textareaRef"
      v-model:value="inputValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :auto-size="autoSize"
      show-count
      @input="handleInput"
      @keydown="handleKeydown"
      @click="handleClick"
    />

    <!-- Mention Selector Popover -->
    <div v-if="showSelector" ref="selectorRef" class="mention-selector" :style="selectorStyle">
      <div class="mention-selector-list">
        <div
          v-for="(friend, index) in filteredFriends"
          :key="friend.id"
          class="mention-selector-item"
          :class="{ active: selectedIndex === index }"
          @click="selectFriend(friend)"
          @mouseenter="selectedIndex = index"
        >
          <a-avatar :src="friend.userAvatar" :size="24" />
          <span class="friend-name">{{ friend.userName }}</span>
        </div>
        <div v-if="filteredFriends.length === 0" class="mention-selector-empty">没有找到好友</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { UserVO } from '@/api/typings'

interface Props {
  modelValue: string
  friends: UserVO[]
  placeholder?: string
  maxlength?: number
  autoSize?: { minRows?: number; maxRows?: number }
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '写下你的评论...',
  maxlength: 500,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Expose method to get mentioned users
defineExpose({
  getMentionedUsers,
})

// Ant Design Vue Textarea component instance type
interface TextareaComponentInstance {
  $el: HTMLElement
  textarea?: HTMLTextAreaElement
  focus: () => void
  blur: () => void
}

const textareaRef = ref<TextareaComponentInstance>()
const selectorRef = ref<HTMLDivElement>()
const inputValue = ref(props.modelValue)
const showSelector = ref(false)
const selectedIndex = ref(0)
const mentionStartPos = ref(-1)
const currentMentionText = ref('')

// Get the actual textarea DOM element from Ant Design Vue component
const getTextareaElement = (): HTMLTextAreaElement | null => {
  if (!textareaRef.value) return null
  // Ant Design Vue TextareaInstance has a textarea property
  const instance = textareaRef.value
  if (instance.textarea) {
    return instance.textarea
  }
  // Fallback: try to find textarea element
  const el = instance.$el
  if (el instanceof HTMLTextAreaElement) return el
  if (el?.querySelector) {
    const textarea = el.querySelector('textarea')
    if (textarea) return textarea
  }
  return null
}
const filteredFriends = computed(() => {
  if (!currentMentionText.value) {
    return props.friends.slice(0, 8)
  }
  return props.friends
    .filter((friend) =>
      friend.userName?.toLowerCase().includes(currentMentionText.value.toLowerCase()),
    )
    .slice(0, 8)
})

// Calculate selector position
const selectorStyle = computed(() => {
  const textarea = getTextareaElement()
  if (!textarea) return {}

  try {
    const text = inputValue.value.substring(0, textarea.selectionStart)
    const lines = text.split('\n')
    const currentLine = lines.length - 1
    const currentLineText = lines[currentLine]
    // Approximate character width
    const charWidth = 8.5
    const lineHeight = 24
    const computedStyle = window.getComputedStyle(textarea)
    const paddingLeft = parseFloat(computedStyle.paddingLeft)
    const paddingTop = parseFloat(computedStyle.paddingTop)
    const borderTop = parseFloat(computedStyle.borderTopWidth)
    const left = paddingLeft + currentLineText.length * charWidth
    const top = paddingTop + borderTop + currentLine * lineHeight

    return {
      position: 'absolute' as const,
      left: `${Math.min(left, 300)}px`,
      top: `${top + 30}px`,
      zIndex: 1000,
    }
  } catch {
    // Fallback position if getComputedStyle fails
    return {
      position: 'absolute' as const,
      left: '0px',
      top: '40px',
      zIndex: 1000,
    }
  }
})

// Watch for external value changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== inputValue.value) {
      inputValue.value = newVal
    }
  },
)

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// Handle input event
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  const cursorPos = target.selectionStart
  const value = target.value

  // Check if we just typed '@'
  if (
    value[cursorPos - 1] === '@' &&
    (cursorPos === 1 || /[\s\n]/.test(value[cursorPos - 2] || ''))
  ) {
    mentionStartPos.value = cursorPos - 1
    currentMentionText.value = ''
    selectedIndex.value = 0
    showSelector.value = true
    nextTick(() => {
      focusTextarea()
    })
    return
  }

  // Check if we're still typing a mention
  if (showSelector.value && mentionStartPos.value >= 0) {
    const textAfterAt = value.substring(mentionStartPos.value + 1, cursorPos)
    // Only continue if it's a valid username pattern (no spaces)
    if (/^[a-zA-Z0-9_\u4e00-\u9fa5]*$/.test(textAfterAt)) {
      currentMentionText.value = textAfterAt
      selectedIndex.value = 0
      return
    }
  }

  // Hide selector if mention is complete or invalid
  hideSelector()
}

// Handle keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!showSelector.value || filteredFriends.value.length === 0) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % filteredFriends.value.length
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value =
        (selectedIndex.value - 1 + filteredFriends.value.length) % filteredFriends.value.length
      break
    case 'Enter':
      e.preventDefault()
      selectFriend(filteredFriends.value[selectedIndex.value])
      break
    case 'Escape':
      hideSelector()
      break
  }
}

// Handle click to update selector position
const handleClick = () => {
  if (showSelector.value) {
    nextTick(() => {
      // Recalculate position on click
    })
  }
}

// Select a friend
const selectFriend = (friend: UserVO) => {
  const textarea = getTextareaElement()
  if (!textarea || mentionStartPos.value < 0) return

  const cursorPos = textarea.selectionEnd

  // Replace '@text' with '@username '
  const replacement = `@${friend.userName} `
  const beforeMention = inputValue.value.substring(0, mentionStartPos.value)
  const afterMention = inputValue.value.substring(cursorPos)

  inputValue.value = beforeMention + replacement + afterMention

  // Move cursor after the inserted text
  const newCursorPos = mentionStartPos.value + replacement.length
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    hideSelector()
  })
}

// Hide selector
const hideSelector = () => {
  showSelector.value = false
  mentionStartPos.value = -1
  currentMentionText.value = ''
  selectedIndex.value = 0
}

// Focus textarea
const focusTextarea = () => {
  const textarea = getTextareaElement()
  textarea?.focus()
}
// Extract mentioned users from text
function getMentionedUsers(): UserVO[] {
  const mentionPattern = /@([a-zA-Z0-9_\u4e00-\u9fa5]+)/g
  const matches = [...inputValue.value.matchAll(mentionPattern)]

  const mentionedUserNames = matches.map((match) => match[1])

  return props.friends.filter((friend) => mentionedUserNames.includes(friend.userName || ''))
}

// Close selector when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (
    showSelector.value &&
    selectorRef.value &&
    !selectorRef.value.contains(e.target as Node) &&
    textareaRef.value &&
    !textareaRef.value.$el.contains(e.target as Node)
  ) {
    hideSelector()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.mention-input-wrapper {
  position: relative;
  width: 100%;
}

.mention-selector {
  position: absolute;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  max-width: 280px;
  max-height: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mention-selector-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 6px 0;
}

.mention-selector-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mention-selector-item:hover,
.mention-selector-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.mention-selector-item .friend-name {
  font-size: 14px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mention-selector-empty {
  padding: 16px;
  text-align: center;
  color: #8c8c8c;
  font-size: 13px;
}

:deep(.ant-textarea) {
  font-size: 14px;
  line-height: 1.6;
}

:deep(.ant-textarea:hover),
:deep(.ant-textarea:focus) {
  border-color: #667eea;
}

:deep(.ant-textarea:focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}
</style>
