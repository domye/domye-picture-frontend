// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取空间分类分析 POST /space/analyze/category */
export async function getSpaceCategoryAnalyze(
  body: API.SpaceCategoryAnalyzeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceCategoryAnalyzeResponse>('/space/analyze/category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取空间排名分析 POST /space/analyze/rank */
export async function getSpaceRankAnalyze(
  body: API.SpaceRankAnalyzeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpace>('/space/analyze/rank', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取空间大小分析 POST /space/analyze/size */
export async function getSpaceSizeAnalyze(
  body: API.SpaceSizeAnalyzeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceSizeAnalyzeResponse>('/space/analyze/size', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取空间标签分析 POST /space/analyze/tag */
export async function getSpaceTagAnalyze(
  body: API.SpaceTagAnalyzeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceTagAnalyzeResponse>('/space/analyze/tag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取空间使用状态 POST /space/analyze/usage */
export async function getSpaceUsageAnalyze(
  body: API.SpaceUsageAnalyzeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUsageAnalyzeResponse>('/space/analyze/usage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取空间用户分析 POST /space/analyze/user */
export async function getSpaceUserAnalyze(
  body: API.SpaceUserAnalyzeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceUserAnalyzeResponse>('/space/analyze/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
