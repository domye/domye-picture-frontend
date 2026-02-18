/**
 * 统一错误消息常量
 * 集中管理所有错误提示信息，便于维护和国际化
 */

// 通用错误
export const ERROR_MESSAGES = {
  // 网络错误
  NETWORK_ERROR: '网络连接异常，请检查网络设置',
  NETWORK_TIMEOUT: '请求超时，请稍后重试',
  SERVER_ERROR: '服务器错误，请稍后重试',

  // 数据获取
  FETCH_FAILED: '获取数据失败',
  FETCH_LIST_FAILED: '获取列表失败',
  FETCH_DETAIL_FAILED: '获取详情失败',

  // 操作相关
  CREATE_FAILED: '创建失败',
  UPDATE_FAILED: '更新失败',
  DELETE_FAILED: '删除失败',
  UPLOAD_FAILED: '上传失败',
  SAVE_FAILED: '保存失败',

  // 认证相关
  LOGIN_REQUIRED: '请先登录',
  LOGIN_FAILED: '登录失败',
  LOGOUT_FAILED: '退出登录失败',
  REGISTER_FAILED: '注册失败',
  SESSION_EXPIRED: '登录已过期，请重新登录',

  // 权限相关
  NO_PERMISSION: '没有权限访问',
  ADMIN_REQUIRED: '需要管理员权限',

  // 文件上传
  FILE_TOO_LARGE: '文件大小超出限制',
  FILE_TYPE_NOT_SUPPORTED: '不支持的文件格式',
  FILE_SIGNATURE_INVALID: '文件内容与扩展名不匹配',
  FILE_DIMENSION_INVALID: '图片尺寸不符合要求',
  FILE_CORRUPTED: '文件已损坏',

  // 参数错误
  INVALID_PARAMS: '参数错误',
  INVALID_ID: 'ID不存在',

  // 空状态
  NO_DATA: '暂无数据',
  NO_MORE_DATA: '没有更多数据了',
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  CREATE_SUCCESS: '创建成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  UPLOAD_SUCCESS: '上传成功',
  SAVE_SUCCESS: '保存成功',
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出登录成功',
  REGISTER_SUCCESS: '注册成功',
  OPERATION_SUCCESS: '操作成功',
} as const

/**
 * 生成带后缀的错误消息
 */
export function errorMessage(base: string, suffix?: string): string {
  return suffix ? `${base}，${suffix}` : base
}

/**
 * 从 API 响应生成错误消息
 */
export function apiErrorMessage(base: string, response?: { message?: string }): string {
  return response?.message ? `${base}，${response.message}` : base
}
