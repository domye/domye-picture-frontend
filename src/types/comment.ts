/**
 * 评论相关类型定义
 */

import type { API } from '@/api/typings'

/**
 * 评论列表项（扩展自 API.CommentListVO）
 */
export interface CommentItem extends API.CommentListVO {
  /** 是否正在编辑 */
  isEditing?: boolean
}

/**
 * 评论回复项（扩展自 API.CommentReplyVO）
 */
export interface CommentReplyItem extends API.CommentReplyVO {
  /** 是否正在编辑 */
  isEditing?: boolean
}

/**
 * 发表评论请求参数
 */
export interface AddCommentParams {
  pictureId: number | string
  content: string
  parentId?: number | string
  mentionedUserIds?: number[]
}
