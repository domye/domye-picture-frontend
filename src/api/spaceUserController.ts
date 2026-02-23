// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 添加成员到空间 POST /spaceUser/add */
export async function addSpaceUser(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/spaceUser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 从空间移除成员 POST /spaceUser/delete */
export async function deleteSpaceUser(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/spaceUser/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 编辑成员信息（设置权限） POST /spaceUser/edit */
export async function editSpaceUser(
  body: API.SpaceUserEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/spaceUser/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询某个成员在某个空间的信息 POST /spaceUser/get */
export async function getSpaceUser(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUser>('/spaceUser/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询成员信息列表 POST /spaceUser/list */
export async function listSpaceUser(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceUserVO>('/spaceUser/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询我加入的团队空间列表 POST /spaceUser/list/my */
export async function listMyTeamSpace(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO>('/spaceUser/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
