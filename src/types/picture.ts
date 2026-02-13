/**
 * 图片相关类型定义
 */

import type { API } from '@/api/typings'

/**
 * 图片列表项（扩展自 API.PictureVO）
 */
export interface PictureItem extends API.PictureVO {
  /** 是否选中 */
  selected?: boolean
}

/**
 * 图片搜索参数
 */
export interface PictureSearchParams {
  /** 搜索文本 */
  searchText?: string
  /** 分类 */
  category?: string
  /** 标签列表 */
  tags?: string[]
  /** 开始时间 */
  startEditTime?: string
  /** 结束时间 */
  endEditTime?: string
  /** 空间ID */
  spaceId?: number
}

/**
 * 图片上传参数
 */
export interface PictureUploadParams {
  /** 空间ID */
  spaceId?: number | string
  /** 文件 */
  file: File
}
