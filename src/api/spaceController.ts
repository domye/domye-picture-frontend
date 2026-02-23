// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 创建空间 POST /space/add */
export async function addSpace(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addSpaceParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/space/add', {
    method: 'POST',
    params: {
      ...params,
      spaceAddRequest: undefined,
      ...params['spaceAddRequest'],
    },
    ...(options || {}),
  })
}

/** 删除空间 POST /space/delete */
export async function deleteSpace(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/space/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 编辑空间 POST /space/edit */
export async function editSpace(body: API.SpaceEditRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/space/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据id获取空间 GET /space/get */
export async function getSpaceById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpace>('/space/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 根据id获取空间封装类 GET /space/get/vo */
export async function getSpaceVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceVO>('/space/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 获取空间权限列表 GET /space/list/level */
export async function listSpaceLevel(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceLevel>('/space/list/level', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 分页获取空间列表 POST /space/list/page */
export async function listSpaceByPage(
  body: API.SpaceQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpace>('/space/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页获取空间封装类列表 POST /space/list/page/vo */
export async function listSpaceVoByPage(
  body: API.SpaceQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceVO>('/space/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 更新空间 POST /space/update */
export async function updateSpace(body: API.SpaceUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/space/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
