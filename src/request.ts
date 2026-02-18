import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import { getBaseUrl } from '@/config/env'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  withCredentials: true,
})

// 请求重试配置
const retryConfig = {
  maxRetries: 2,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
}

// 存储取消请求的控制器
const pendingRequests = new Map<string, AbortController>()

/**
 * 生成请求唯一标识
 */
function generateRequestKey(config: AxiosRequestConfig): string {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}`
}

/**
 * 添加请求到待处理列表
 */
function addPendingRequest(config: AxiosRequestConfig): void {
  const key = generateRequestKey(config)
  if (pendingRequests.has(key)) {
    pendingRequests.get(key)?.abort()
  }
  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.set(key, controller)
}

/**
 * 从待处理列表移除请求
 */
function removePendingRequest(config: AxiosRequestConfig): void {
  const key = generateRequestKey(config)
  pendingRequests.delete(key)
}

/**
 * 请求重试逻辑
 */
async function retryRequest(error: AxiosError, config: AxiosRequestConfig): Promise<unknown> {
  const retryCount = (config as AxiosRequestConfig & { _retryCount?: number })._retryCount || 0

  if (
    retryCount >= retryConfig.maxRetries ||
    !retryConfig.retryStatusCodes.includes(error.response?.status || 0)
  ) {
    return Promise.reject(error)
  }

  ;(config as AxiosRequestConfig & { _retryCount?: number })._retryCount = retryCount + 1

  await new Promise((resolve) => setTimeout(resolve, retryConfig.retryDelay * (retryCount + 1)))

  return myAxios(config)
}

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 添加到待处理列表，支持取消重复请求
    addPendingRequest(config)
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    // 移除已完成的请求
    removePendingRequest(response.config)

    const { data } = response
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  async function (error: AxiosError) {
    const config = error.config

    // 移除失败的请求
    if (config) {
      removePendingRequest(config)

      // 尝试重试
      if (config && !config.signal?.aborted) {
        return retryRequest(error, config)
      }
    }

    // 统一错误提示
    if (error.code === 'ERR_CANCELED') {
      // 请求被取消，不提示错误
      return Promise.reject(error)
    }

    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        message.error('登录已过期，请重新登录')
      } else if (status === 403) {
        message.error('没有权限访问')
      } else if (status === 404) {
        message.error('请求的资源不存在')
      } else if (status >= 500) {
        message.error('服务器错误，请稍后重试')
      }
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请检查网络连接')
    } else {
      message.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  },
)

/**
 * 取消所有待处理的请求
 */
export function cancelAllPendingRequests(): void {
  pendingRequests.forEach((controller) => controller.abort())
  pendingRequests.clear()
}

export default myAxios
