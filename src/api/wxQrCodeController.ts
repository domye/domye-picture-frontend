// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** generateQrCode GET /api/wx/qr/generate */
export async function generateQrCodeUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseQrcodeVO_>('/api/wx/qr/generate', {
    method: 'GET',
    ...(options || {}),
  })
}

/** checkQrStatus GET /api/wx/qr/status/${param0} */
export async function checkQrStatusUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkQrStatusUsingGETParams,
  options?: { [key: string]: any }
) {
  const { sceneId: param0, ...queryParams } = params
  return request<API.BaseResponseQrcodeStatusVO_>(`/api/wx/qr/status/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
