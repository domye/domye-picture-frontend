import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

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
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @param format 格式化模式，默认 'YYYY-MM-DD HH:mm'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date?: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 智能时间显示
 * 24小时内显示相对时间（如"3小时前"）
 * 30天内显示月-日 时:分
 * 超过30天显示年-月-日 时:分
 * @param time 时间字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (time?: string | Date): string => {
  if (!time) return ''
  const date = dayjs(time)
  const now = dayjs()
  const diffHours = now.diff(date, 'hour')

  if (diffHours < 24) {
    return date.fromNow()
  } else if (diffHours < 24 * 30) {
    return date.format('MM-DD HH:mm')
  } else {
    return date.format('YYYY-MM-DD HH:mm')
  }
}

/**
 * 颜色值转换为十六进制格式
 * @param input 颜色值（支持 0x 前缀格式）
 * @returns 标准的 #RRGGBB 格式颜色值
 */
export const toHexColor = (input?: string | number): string => {
  if (!input) return '#000000'

  const colorStr = String(input)
  // 去掉 0x 前缀
  const colorValue = colorStr.startsWith('0x') ? colorStr.slice(2) : colorStr

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}

/**
 * 工具模块统一导出
 * 遵循接口隔离原则 - 提供清晰的工具接口
 */
export { logger, wsLogger } from './logger'
export { default as PictureEditWebSocket } from './pictureEditWebSocket'
