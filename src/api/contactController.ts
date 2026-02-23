// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 发起好友申请 POST /contact/apply */
export async function applyContact(body: API.ContactAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/contact/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除联系人 POST /contact/delete */
export async function deleteContact(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/contact/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 处理好友申请 POST /contact/handle */
export async function handleContactRequest(
  body: API.ContactHandleRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/contact/handle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询我的联系人列表 POST /contact/list */
export async function listContacts(
  body: API.ContactQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageContactVO>('/contact/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询待处理申请 POST /contact/pending */
export async function listPendingRequests(
  body: API.ContactQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageContactVO>('/contact/pending', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
