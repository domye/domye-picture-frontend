// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /comment/add */
export async function addComment(body: API.CommentAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/comment/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取好友列表 (用于@选择器) GET /comment/friends */
export async function getFriends(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject>('/comment/friends', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /comment/list */
export async function listTopComments(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listTopCommentsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentListVO>('/comment/list', {
    method: 'GET',
    params: {
      ...params,
      request: undefined,
      ...params['request'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /comment/reply */
export async function listReplyComments(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listReplyCommentsParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentListVO>('/comment/reply', {
    method: 'GET',
    params: {
      ...params,
      request: undefined,
      ...params['request'],
    },
    ...(options || {}),
  })
}
