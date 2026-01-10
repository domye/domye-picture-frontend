/**
 * 统一日志管理工具
 * 遵循 DRY 原则 - 统一日志输出逻辑
 * 遵循 KISS 原则 - 简单直观的日志接口
 * 遵循单一职责原则 - 专注于日志功能
 */

import { isDev } from '@/config/env'

type LogLevel = 'log' | 'info' | 'warn' | 'error'

/**
 * 日志输出函数
 * 生产环境自动禁用，避免性能泄露和敏感信息暴露
 */
export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log('[LOG]', ...args)
  },

  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args)
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn('[WARN]', ...args)
  },

  error: (...args: any[]) => {
    // 错误日志在生产环境也输出
    console.error('[ERROR]', ...args)
  },
}

/**
 * WebSocket 专用日志接口
 */
interface WsLogger {
  connected: (url: string) => void
  closed: (event: CloseEvent) => void
  message: (data: unknown) => void
  sent: (data: unknown) => void
  error: (error: unknown, ...rest: any[]) => void
  warn: (...args: any[]) => void
  log: (...args: any[]) => void
  notReady: () => void
}

/**
 * WebSocket 专用日志实现
 */
export const wsLogger: WsLogger = {
  connected: (url: string) => logger.log('WebSocket 连接已建立', url),
  closed: (event: CloseEvent) => logger.log('WebSocket 连接已关闭', event.code, event.reason),
  message: (data: unknown) => logger.log('收到 WebSocket 消息', data),
  sent: (data: unknown) => logger.log('发送 WebSocket 消息', data),
  error: (error: unknown, ...rest: any[]) => logger.error(error, ...rest),
  warn: (...args: any[]) => logger.warn(...args),
  log: (...args: any[]) => logger.log(...args),
  notReady: () => logger.error('WebSocket 未连接，无法发送消息'),
}
