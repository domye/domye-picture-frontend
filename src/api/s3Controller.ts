// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 删除S3上的文件 DELETE /s3/delete */
export async function deleteFile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteFileParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/s3/delete', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 上传文件到S3兼容存储 POST /s3/upload */
export async function uploadFile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadFileParams,
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseS3UploadResultVO>('/s3/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
      request: undefined,
      ...params['request'],
    },
    data: body,
    ...(options || {}),
  })
}
