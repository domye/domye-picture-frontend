# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

图片分享平台前端，基于 Vue 3 + TypeScript + Vite + Ant Design Vue。核心功能包括图片上传/编辑、瀑布流展示、评论系统、投票、空间管理。

## 常用命令

```bash
# 开发
npm run dev

# 类型检查 + 构建（推荐）
npm run build

# 仅构建（跳过类型检查）
npm run pure-build

# 类型检查
npm run type-check

# 代码规范
npm run lint      # ESLint 检查并修复
npm run format    # Prettier 格式化

# API 代码生成（需要后端服务运行）
npm run openapi
```

## 架构要点

### API 代码生成驱动

项目使用 `@umijs/openapi` 从后端 Swagger 自动生成 API 层。后端地址配置在 `openapi.config.js`。

生成后：
- `src/api/typings.d.ts` - 所有类型定义（命名空间 `API`）
- `src/api/*Controller.ts` - 各业务模块接口函数

修改或新增 API 时：
1. 先修改后端接口
2. 运行 `npm run openapi` 重新生成
3. 不要手动修改 `src/api/` 下的生成代码

### 分层结构

```
pages/          → 页面组件（路由级）
components/     → 可复用业务组件（按功能分类）
  ├── analyze/  → 分析组件（图表、统计）
  ├── comment/  → 评论组件（CommentList、CommentItem、CommentReplyList）
  ├── icons/    → 图标组件
  ├── layout/   → 布局组件（GlobalHeader、GlobalSider）
  └── picture/  → 图片组件（PictureList、PictureUpload、ImageCropper）
layouts/        → 页面布局（BasicLayout: Header + Sider + Content）
composables/    → 组合式函数（usePagination）
types/          → 类型定义（扩展 API 类型）
api/            → 接口层（自动生成）
stores/         → Pinia 状态（useLoginUserStore）
router/         → 路由配置
utils/          → 工具函数
access.ts       → 全局路由守卫（权限校验）
request.ts      → Axios 实例配置
```

### 权限控制

- `access.ts` 实现全局路由守卫
- 未登录访问需登录页面 → 跳转 `/user/login`
- 非管理员访问管理页面 → 跳转首页
- 登录用户状态由 `useLoginUserStore` 管理

### 用户状态管理

**统一使用 `useLoginUserStore`**，禁止直接访问 `localStorage`：

```typescript
// 正确方式
import { useLoginUserStore } from '@/stores/useLoginUserStore'
const loginUserStore = useLoginUserStore()
const currentUser = loginUserStore.loginUser

// 错误方式（禁止使用）
const user = JSON.parse(localStorage.getItem('loginUser'))
```

## 代码约定

### 命名

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `GlobalHeader.vue` |
| 工具/配置文件 | camelCase | `logger.ts`, `env.ts` |
| 类型（API 命名空间下） | PascalCase | `API.PictureVO` |
| 常量 | UPPER_SNAKE_CASE | `PIC_REVIEW_STATUS_ENUM` |
| 函数/变量 | camelCase | `fetchLoginUser` |

### 组件风格

- 统一使用 `<script setup lang="ts">`
- Props 使用 TypeScript interface 定义
- 样式使用 `<style scoped>` + Less

### 路径别名

`@` 映射到 `./src`

### 代码格式

- 无分号
- 单引号
- 100 字符行宽

## 环境配置

`src/config/env.ts` 管理不同环境的后端地址：
- 开发: `http://localhost:8123`
- 生产: `https://picture.domye.top`

## 日志工具

使用 `src/utils/logger.ts`，生产环境自动禁用除 error 外的日志。

## 工具函数

`src/utils/index.ts` 提供统一的工具函数：

| 函数 | 用途 | 示例 |
|------|------|------|
| `formatSize(size)` | 格式化文件大小 | `formatSize(1024)` → `'1.00 KB'` |
| `formatDate(date, format?)` | 格式化日期 | `formatDate('2024-01-01')` → `'2024-01-01 00:00'` |
| `formatTime(time)` | 智能时间显示 | 24h内: `'3小时前'`，30天内: `'01-15 10:30'`，其他: `'2024-01-15 10:30'` |
| `toHexColor(input)` | 颜色值转十六进制 | `toHexColor('0xFF5733')` → `'#ff5733'` |

## Composables

`src/composables/` 提供可复用的组合式函数：

### usePagination

通用分页逻辑封装：

```typescript
import { usePagination } from '@/composables'

const { dataList, loading, hasMore, loadMore, refresh } = usePagination({
  defaultPageSize: 10,
  fetchFn: async (page, pageSize) => {
    const res = await getListApi({ current: page, pageSize })
    return { records: res.data.records, total: res.data.total }
  },
  immediate: true,
})
```

## 类型定义

`src/types/` 提供扩展的类型定义：

- `common.ts` - 通用类型（分页、响应）
- `comment.ts` - 评论相关类型
- `picture.ts` - 图片相关类型
- `user.ts` - 用户相关类型

使用示例：

```typescript
import type { PageResponse, CommentItem } from '@/types'
```

## Node 版本

要求 Node.js `^20.19.0 || >=22.12.0`
