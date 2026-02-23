// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 创建投票活动 POST /vote/activity/create */
export async function addVoteActivities(
  body: API.VoteActivityAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/vote/activity/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除投票 POST /vote/activity/delete */
export async function deleteVoteActivities(
  body: API.VoteActivityDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vote/activity/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取投票活动详情 GET /vote/activity/detail/${param0} */
export async function getVoteActivities(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getVoteActivitiesParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseVoteActivityDetailVO>(`/vote/activity/detail/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 结束投票 POST /vote/activity/end */
export async function endVoteActivities(
  body: API.VoteEndRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vote/activity/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页获取列表（仅管理员可用） POST /vote/activity/list/page */
export async function listVoteActivitiesByPage(
  body: API.VoteActivityQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageVoteActivity>('/vote/activity/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页获取脱敏后的信息 POST /vote/activity/list/page/vo */
export async function listVoteActivitiesVoByPage(
  body: API.VoteActivityQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageVoteActivityVO>('/vote/activity/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 提交投票 POST /vote/activity/vote */
export async function addVoteRecord(body: API.VoteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/vote/activity/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
