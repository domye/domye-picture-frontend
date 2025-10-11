// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addActivityScore POST /api/rank/addActivityScore */
export async function addActivityScoreUsingPost(
  body: API.UserActivityScoreAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/rank/addActivityScore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取用户活跃排行榜 GET /api/rank/UserActivityScore */
export async function getUserActivityScoreUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserActivityScoreUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListUserActiveRankItemVO_>('/api/rank/UserActivityScore', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
