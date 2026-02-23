// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取用户活跃排行榜 GET /rank/UserActivityScore */
export async function getUserActivityScore(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserActivityScoreParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListUserActiveRankItemVO>('/rank/UserActivityScore', {
    method: 'GET',
    params: {
      ...params,
      userActivityScoreQueryRequest: undefined,
      ...params['userActivityScoreQueryRequest'],
    },
    ...(options || {}),
  })
}
