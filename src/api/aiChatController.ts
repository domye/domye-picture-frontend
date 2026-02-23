// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** AI 对话接口 POST /ai/chat */
export async function chat(body: API.AiChatRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
