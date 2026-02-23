// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /filterList/add */
export async function addFilterList(body: API.FilterListRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/filterList/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /filterList/list */
export async function getFilterList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFilterListParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListUserVO>('/filterList/list', {
    method: 'GET',
    params: {
      ...params,
      request: undefined,
      ...params['request'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /filterList/remove */
export async function removeFilterList(
  body: API.FilterListRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/filterList/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
