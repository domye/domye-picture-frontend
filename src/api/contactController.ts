// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 发起好友申请 POST /api/contact/apply */
export async function applyContactUsingPost(
  body: API.ContactAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/contact/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除联系人 POST /api/contact/delete */
export async function deleteContactUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/contact/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 处理好友申请 POST /api/contact/handle */
export async function handleContactRequestUsingPost(
  body: API.ContactHandleRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/contact/handle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询我的联系人列表 POST /api/contact/list */
export async function listContactsUsingPost(
  body: API.ContactQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageContactVO_>('/api/contact/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询待处理申请 POST /api/contact/pending */
export async function listPendingRequestsUsingPost(
  body: API.ContactQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageContactVO_>('/api/contact/pending', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
