/**
 * 通用类型定义
 * 用于扩展和组合 API 自动生成类型
 */

/**
 * 分页请求参数
 */
export interface PageRequest {
  current?: number
  pageSize?: number
}

/**
 * 分页响应数据
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  current?: number
  size?: number
  pages?: number
}

/**
 * 通用响应结果
 */
export interface Result<T = unknown> {
  code: number
  data?: T
  message?: string
}

/**
 * 状态枚举
 */
export enum StatusEnum {
  /** 待处理 */
  PENDING = 0,
  /** 进行中 */
  ACTIVE = 1,
  /** 已完成/已结束 */
  COMPLETED = 2,
  /** 已拒绝/已删除 */
  REJECTED = 3,
}
