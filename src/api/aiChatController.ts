// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取用户会话列表 获取当前用户的所有聊天会话 GET /ai/chat/sessions */
export async function getUserSessions(options?: { [key: string]: any }) {
  return request<API.BaseResponseListChatSession>('/ai/chat/sessions', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 创建新会话 创建一个新的聊天会话 POST /ai/chat/sessions */
export async function createSession(
  body: API.CreateSessionRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseChatSession>('/ai/chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除会话 删除指定的聊天会话及其历史消息 DELETE /ai/chat/sessions/${param0} */
export async function deleteSession(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteSessionParams,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean>(`/ai/chat/sessions/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取会话消息 获取指定会话的所有聊天消息 GET /ai/chat/sessions/${param0}/messages */
export async function getSessionMessages(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSessionMessagesParams,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseListChatMessage>(`/ai/chat/sessions/${param0}/messages`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 清除会话消息 清除指定会话的历史消息，保留会话 DELETE /ai/chat/sessions/${param0}/messages */
export async function clearSessionMessages(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.clearSessionMessagesParams,
  options?: { [key: string]: any }
) {
  const { sessionId: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean>(`/ai/chat/sessions/${param0}/messages`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** SSE 流式聊天 通过 SSE 返回流式 AI 响应 POST /ai/chat/stream */
export async function streamChat(body: API.ChatStreamRequest, options?: { [key: string]: any }) {
  return request<API.SseEmitter>('/ai/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
