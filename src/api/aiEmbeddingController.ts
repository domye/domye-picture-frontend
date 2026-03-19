// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 检查图片索引状态 检查指定图片是否已建立向量索引 GET /ai/embedding/check/${param0} */
export async function checkEmbedding(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkEmbeddingParams,
  options?: { [key: string]: any }
) {
  const { pictureId: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean>(`/ai/embedding/check/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 同步图片元数据到向量索引 将图片的元数据同步到 PgVector 向量存储，用于 RAG 检索 POST /ai/embedding/sync */
export async function syncEmbeddings(
  body: API.SyncEmbeddingRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSyncEmbeddingResult>('/ai/embedding/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
