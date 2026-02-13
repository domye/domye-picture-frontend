/**
 * 用户相关类型定义
 */

import type { API } from '@/api/typings'

/**
 * 用户角色枚举
 */
export enum UserRoleEnum {
  /** 普通用户 */
  USER = 'user',
  /** 管理员 */
  ADMIN = 'admin',
}

/**
 * 用户信息（扩展自 API.UserVO）
 */
export interface UserInfo extends API.UserVO {
  /** 是否已登录 */
  isLoggedIn?: boolean
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  userAccount: string
  userPassword: string
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  userAccount: string
  userPassword: string
  checkPassword: string
}

/**
 * 登录响应数据
 */
export interface LoginResult {
  token?: string
  user?: API.UserVO
}
