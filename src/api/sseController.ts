// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** bindWx POST /api/wx/sse/bind/${param0} */
export async function bindWxUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.bindWxUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { sceneId: param0, ...queryParams } = params
  return request<boolean>(`/api/wx/sse/bind/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  })
}

/** connect GET /api/wx/sse/connect/${param0} */
export async function connectUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.connectUsingGETParams,
  options?: { [key: string]: any }
) {
  const { sceneId: param0, ...queryParams } = params
  return request<API.SseEmitter>(`/api/wx/sse/connect/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** updateQrStatus POST /api/wx/sse/update/${param0} */
export async function updateQrStatusUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateQrStatusUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { sceneId: param0, ...queryParams } = params
  return request<boolean>(`/api/wx/sse/update/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  })
}

/** verifyCode POST /api/wx/sse/verify/${param0} */
export async function verifyCodeUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.verifyCodeUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { sceneId: param0, ...queryParams } = params
  return request<boolean>(`/api/wx/sse/verify/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  })
}
