import { getWsBaseUrl } from '@/config/env'
import { wsLogger } from './logger'

/**
 * WebSocket 消息类型（匹配后端 PictureEditResponseMessage）
 */
export type WsMessage = {
  type: string
  message?: string
  editAction?: string
  user?: {
    id: number
    userName: string
    userAvatar: string
  }
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = unknown> = (data?: T) => void

/**
 * 事件处理器映射
 */
type EventHandlerMap = Record<string, EventHandler<unknown>[]>

/**
 * WebSocket 连接状态
 */
enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  CLOSING = 'CLOSING',
}

/**
 * 图片编辑 WebSocket 管理
 * 遵循单一职责原则 - 专注于 WebSocket 连接和事件管理
 */
export default class PictureEditWebSocket {
  private readonly pictureId: number
  private socket: WebSocket | null
  private eventHandlers: EventHandlerMap
  private state: ConnectionState

  constructor(pictureId: number) {
    this.pictureId = pictureId
    this.socket = null
    this.eventHandlers = {}
    this.state = ConnectionState.DISCONNECTED
  }

  /**
   * 初始化 WebSocket 连接
   */
  connect(): void {
    if (this.socket) {
      wsLogger.warn('WebSocket 已存在连接')
      return
    }

    this.state = ConnectionState.CONNECTING
    const url = `${getWsBaseUrl()}/api/ws/picture/edit?pictureId=${this.pictureId}`
    this.socket = new WebSocket(url)
    this.socket.binaryType = 'blob'

    this.setupEventListeners()
  }

  /**
   * 设置 WebSocket 事件监听器
   * 遵循单一职责原则 - 事件监听器逻辑集中管理
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.onopen = () => {
      this.state = ConnectionState.CONNECTED
      wsLogger.connected(this.socket!.url)
      this.triggerEvent('open')
    }

    this.socket.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data)
        wsLogger.message(message)
        // 后端消息格式: { type, message, user, editAction }
        // 将整个消息对象作为 data 传递，而不是 message.data
        this.triggerEvent(message.type, message)
      } catch (error) {
        wsLogger.error('解析消息失败', error)
      }
    }

    this.socket.onclose = (event) => {
      this.state = ConnectionState.DISCONNECTED
      wsLogger.closed(event)
      this.triggerEvent('close', event)
      this.socket = null
    }

    this.socket.onerror = (error) => {
      wsLogger.error(error)
      this.triggerEvent('error', error)
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  disconnect(): void {
    if (this.socket) {
      this.state = ConnectionState.CLOSING
      this.socket.close()
      wsLogger.log('WebSocket 连接已手动关闭')
    }
  }

  /**
   * 获取当前连接状态
   */
  getState(): ConnectionState {
    return this.state
  }

  /**
   * 发送消息到后端
   * @param message 消息对象
   */
  sendMessage(message: Record<string, unknown>): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const data = JSON.stringify(message)
      this.socket.send(data)
      wsLogger.sent(message)
    } else {
      wsLogger.notReady()
    }
  }

  /**
   * 添加自定义事件监听
   * @param type 事件类型
   * @param handler 事件处理函数
   */
  on<T = unknown>(type: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = []
    }
    // 将泛型处理器转换为非泛型处理器存储
    this.eventHandlers[type].push(handler as EventHandler<unknown>)
  }

  /**
   * 移除事件监听
   * @param type 事件类型
   * @param handler 事件处理函数
   */
  off<T = unknown>(type: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers[type]
    if (handlers) {
      this.eventHandlers[type] = handlers.filter((h) => h !== (handler as EventHandler<unknown>))
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   */
  private triggerEvent<T = unknown>(type: string, data?: T): void {
    const handlers = this.eventHandlers[type]
    if (handlers) {
      handlers.forEach((handler: EventHandler<unknown>) => handler(data))
    }
  }
}
