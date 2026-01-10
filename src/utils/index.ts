/**
 * 格式化文件大小
 * 遵循 KISS 原则 - 简单直观的工具函数
 * @param size 文件大小（字节）
 * @returns 格式化后的字符串
 */
export const formatSize = (size?: number): string => {
  if (!size || size === 0) return '0 B'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * 工具模块统一导出
 * 遵循接口隔离原则 - 提供清晰的工具接口
 */
export { logger, wsLogger } from './logger'
export { default as PictureEditWebSocket } from './pictureEditWebSocket'
