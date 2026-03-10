// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取信息流 获取关注流、推荐流或最新流 POST /feed/list */
export async function getFeed(body: API.FeedQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseFeedVO>('/feed/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
