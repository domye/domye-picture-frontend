// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 创建投票活动 POST /api/vote/activity/create */
export async function addVoteActivitiesUsingPost(
  body: API.VoteActivityAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/vote/activity/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除投票 POST /api/vote/activity/delete */
export async function deleteVoteActivitiesUsingPost(
  body: API.VoteActivityDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/vote/activity/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取投票活动详情 GET /api/vote/activity/detail/${param0} */
export async function getVoteActivitiesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getVoteActivitiesUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseVoteActivityDetailVO_>(`/api/vote/activity/detail/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 结束投票 POST /api/vote/activity/end */
export async function endVoteActivitiesUsingPost(
  body: API.VoteEndRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/vote/activity/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页获取列表（仅管理员可用） POST /api/vote/activity/list/page */
export async function listVoteActivitiesByPageUsingPost(
  body: API.VoteActivityQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageVoteActivity_>('/api/vote/activity/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页获取脱敏后的信息 POST /api/vote/activity/list/page/vo */
export async function listVoteActivitiesVoByPageUsingPost(
  body: API.VoteActivityQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageVoteActivityVO_>('/api/vote/activity/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 提交投票 POST /api/vote/activity/vote */
export async function addVoteRecordUsingPost(
  body: API.VoteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/vote/activity/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
