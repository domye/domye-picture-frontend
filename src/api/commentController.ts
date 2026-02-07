// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addComment POST /api/comment/add */
export async function addCommentUsingPost(
  body: API.CommentAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/comment/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listTopComments GET /api/comment/list */
export async function listTopCommentsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listTopCommentsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentListVO_>('/api/comment/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** listReplyComments GET /api/comment/reply */
export async function listReplyCommentsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listReplyCommentsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentListVO_>('/api/comment/reply', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
