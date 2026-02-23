/**
 * 环境配置统一管理
 * 遵循 DRY 原则 - 避免环境配置在多处重复定义
 * 遵循 OCP 原则 - 通过扩展配置对象而非修改代码来适应新环境
 */

export const ENV = import.meta.env.MODE || 'development'

/**
 * 基础 URL 配置
 */
export const BASE_URL = {
  DEV: 'http://localhost:8123/api',
  PROD: 'https://picture.domye.top',
}

/**
 * WebSocket URL 配置
 */
export const WS_URL = {
  DEV: 'ws://localhost:8123',
  PROD: 'wss://picture.domye.top',
}

/**
 * 根据当前环境获取对应的 HTTP 基础 URL
 */
export function getBaseUrl(): string {
  return ENV === 'development' ? BASE_URL.DEV : BASE_URL.PROD
}

/**
 * 根据当前环境获取对应的 WebSocket 基础 URL
 */
export function getWsBaseUrl(): string {
  return ENV === 'development' ? WS_URL.DEV : WS_URL.PROD
}

/**
 * 是否为开发环境
 */
export const isDev = ENV === 'development'

/**
 * 是否为生产环境
 */
export const isProd = ENV === 'production'
