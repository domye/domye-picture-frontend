// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** verify GET /api/wx/message */
export async function verifyUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.verifyUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<string>('/api/wx/message', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** receiveMessage POST /api/wx/message */
export async function receiveMessageUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.receiveMessageUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseWxMsgResVo>('/api/wx/message', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
