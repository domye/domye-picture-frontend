<template>
  <a-popover
    v-model:open="visible"
    placement="bottomLeft"
    trigger="click"
    :overlay-class-name="'mention-selector-popover'"
    :overlay-style="{ padding: 0 }"
    @open-change="handleVisibleChange"
  >
    <template #content>
      <div class="mention-selector" @keydown="handleKeydown" tabindex="-1">
        <div class="mention-selector__list" role="listbox" aria-label="朋友列表">
          <div
            v-for="(friend, index) in friends"
            :key="friend.id || index"
            class="mention-selector__item"
            :class="{
              'mention-selector__item--active': index === activeIndex,
              'mention-selector__item--selected': isSelected(friend),
            }"
            role="option"
            :aria-selected="isSelected(friend)"
            @click="handleSelect(friend)"
            @mouseenter="activeIndex = index"
          >
            <a-avatar :src="friend.userAvatar" :alt="friend.userName" :size="32">
              {{ (friend.userName || '用户').toString().charAt(0) }}
            </a-avatar>
            <span class="mention-selector__item__name">{{ friend.userName || '未知用户' }}</span>
            <CheckOutlined v-if="isSelected(friend)" class="mention-selector__item__check" />
          </div>
          <div v-if="!friends || friends.length === 0" class="mention-selector__empty">
            暂无好友
          </div>
        </div>
      </div>
    </template>
    <slot>
      <a-button size="small">
        <template #icon>
          <UsergroupAddOutlined />
        </template>
        @朋友
      </a-button>
    </slot>
  </a-popover>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { API } from '@/api/typings'
import { CheckOutlined, UsergroupAddOutlined } from '@ant-design/icons-vue'

interface Props {
  friends?: API.UserVO[]
  visible?: boolean
  modelValue?: API.UserVO | null
}

const props = withDefaults(defineProps<Props>(), {
  friends: () => [],
  visible: false,
  modelValue: null,
})

const emit = defineEmits<{
  select: [user: API.UserVO]
  close: []
  'update:modelValue': [user: API.UserVO | null]
  'update:visible': [visible: boolean]
}>()

// 当前激活的索引（键盘导航）
const activeIndex = ref(0)

// 内部可见性状态
const internalVisible = ref(false)

// 计算实际可见性
const visibleState = ref(props.visible)

watch(
  () => props.visible,
  (newVal) => {
    visibleState.value = newVal
    if (newVal) {
      activeIndex.value = 0
      nextTick(() => {
        focusActiveItem()
      })
    }
  },
)

// 判断是否已选中
const isSelected = (friend: API.UserVO) => {
  if (!props.modelValue) return false
  return friend.id === props.modelValue.id
}

// 处理键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  if (!visibleState.value) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, (props.friends?.length || 0) - 1)
      focusActiveItem()
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      focusActiveItem()
      break
    case 'Enter':
      e.preventDefault()
      if (props.friends && props.friends[activeIndex.value]) {
        handleSelect(props.friends[activeIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      closeSelector()
      break
  }
}

// 聚焦到激活项
const focusActiveItem = () => {
  nextTick(() => {
    const items = document.querySelectorAll('.mention-selector__item')
    if (items[activeIndex.value]) {
      ;(items[activeIndex.value] as HTMLElement).focus()
    }
  })
}

// 处理选择
const handleSelect = (friend: API.UserVO) => {
  emit('select', friend)
  emit('update:modelValue', friend)
  closeSelector()
}

// 关闭选择器
const closeSelector = () => {
  visibleState.value = false
  emit('update:visible', false)
  emit('close')
}

// 处理可见性变化
const handleVisibleChange = (open: boolean) => {
  if (!open) {
    closeSelector()
  } else {
    activeIndex.value = 0
    nextTick(() => {
      focusActiveItem()
    })
  }
}
</script>

<style scoped>
.mention-selector {
  width: 280px;
  max-height: 360px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.mention-selector__list {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.mention-selector__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* 移动端触摸目标 >= 44px */
  outline: none;
  position: relative;
}

.mention-selector__item:hover {
  background: #f5f5f5;
}

.mention-selector__item--active {
  background: #e6f7ff;
}

.mention-selector__item--selected {
  background: #e6f7ff;
}

.mention-selector__item--active.mention-selector__item--selected {
  background: #bae7ff;
}

.mention-selector__item:focus-visible {
  box-shadow: inset 0 0 0 2px #1890ff;
}

.mention-selector__item__name {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.mention-selector__item__check {
  color: #1890ff;
  font-size: 16px;
}

.mention-selector__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: #999;
  font-size: 14px;
}

/* 自定义 popover 样式 */
:deep(.mention-selector-popover .ant-popover-inner-content) {
  padding: 0;
}

:deep(.mention-selector-popover .ant-popover-arrow) {
  display: none;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mention-selector {
    width: 100%;
    max-width: 320px;
  }

  .mention-selector__item {
    padding: 14px 16px;
    min-height: 48px;
  }
}

/* 滚动条美化 */
.mention-selector::-webkit-scrollbar {
  width: 6px;
}

.mention-selector::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.mention-selector::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.mention-selector::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
