// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addFilterList POST /api/filterList/add */
export async function addFilterListUsingPost(
  body: API.FilterListRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/filterList/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getFilterList GET /api/filterList/list */
export async function getFilterListUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFilterListUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListUserVO_>('/api/filterList/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** removeFilterList POST /api/filterList/remove */
export async function removeFilterListUsingPost(
  body: API.FilterListRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/filterList/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
