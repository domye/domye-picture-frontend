# 评论@好友功能 - 前端接口文档

## 功能概述

在评论系统中新增@好友功能，用户可以在评论内容中@自己的好友，被@的用户信息会在评论列表中返回，供前端高亮显示。

### 核心功能
- 评论中@好友（仅限已添加的好友）
- 评论列表展示@的用户信息
- 获取好友列表供@选择器使用

---

## API 接口

### 1. 获取好友列表

**用途**: 在评论输入框输入@时，弹出好友选择器

```
GET /comment/friends
```

**请求头**:
```
Cookie: SESSION=<用户登录session>
```

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 2,
      "userName": "张三",
      "userAvatar": "https://example.com/avatar/2.jpg"
    },
    {
      "id": 3,
      "userName": "李四",
      "userAvatar": "https://example.com/avatar/3.jpg"
    }
  ]
}
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| userName | String | 用户名 |
| userAvatar | String | 用户头像URL |

---

### 2. 发布评论（功能增强）

**用途**: 发布包含@的评论

```
POST /comment/add
```

**请求头**:
```
Content-Type: application/json
Cookie: SESSION=<用户登录session>
```

**请求体**:
```json
{
  "pictureid": 1,
  "content": "@张三 这张照片拍得真不错！@李四 你觉得呢？",
  "parentid": null
}
```

**响应**:
```json
{
  "code": 0,
  "data": 12345,
  "message": "ok"
}
```

**重要说明**:
- @格式: `@用户名`，用户名后需要有空格或标点符号结束
- 仅能@已添加的好友，@非好友会被自动忽略
- 单条评论最多@10人，超出部分会被截断
- 支持中文用户名

---

### 3. 获取评论列表（响应增强）

**用途**: 获取图片的评论列表，包含@用户信息

```
GET /comment/list?pictureId=1&current=1&pageSize=10
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pictureId | Long | 是 | 图片ID |
| current | Integer | 否 | 当前页码，默认1 |
| pageSize | Integer | 否 | 每页条数，默认10 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "commentId": 1,
        "userId": 1,
        "userName": "王五",
        "userAvatar": "https://example.com/avatar/1.jpg",
        "content": "@张三 这张照片拍得真不错！@李四 你觉得呢？",
        "replyCount": 2,
        "createTime": "2026-02-23T15:30:00",
        "mentionedUsers": [
          {
            "mentionedUserId": 2,
            "mentionedUserName": "张三",
            "mentionedUserAvatar": "https://example.com/avatar/2.jpg"
          },
          {
            "mentionedUserId": 3,
            "mentionedUserName": "李四",
            "mentionedUserAvatar": "https://example.com/avatar/3.jpg"
          }
        ],
        "replyPreviewList": []
      }
    ],
    "total": 100,
    "current": 1,
    "size": 10
  }
}
```

**新增字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| mentionedUsers | Array | 被@的用户列表 |
| mentionedUsers[].mentionedUserId | Long | 被@用户ID |
| mentionedUsers[].mentionedUserName | String | 被@用户名 |
| mentionedUsers[].mentionedUserAvatar | String | 被@用户头像URL |

---

### 4. 获取楼中楼回复（响应增强）

**用途**: 获取评论的回复列表，同样包含@信息

```
GET /comment/reply?pictureId=1&commentId=1&current=1&pageSize=10
```

**响应结构**: 与评论列表相同，每个回复也包含 `mentionedUsers` 字段

---

## 前端实现建议

### 1. @选择器组件

**交互流程**:
1. 用户在评论输入框输入 `@`
2. 弹出好友选择器浮层
3. 调用 `/comment/friends` 获取好友列表
4. 支持搜索过滤好友
5. 选择好友后插入 `@用户名 ` 到输入框

**Vue 示例**:
```vue
<template>
  <div class="comment-input">
    <textarea 
      v-model="content" 
      @input="handleInput"
      placeholder="发表评论，@好友会有提示"
    />
    
    <!-- 好友选择器 -->
    <div v-if="showMentionPicker" class="mention-picker">
      <input v-model="searchKeyword" placeholder="搜索好友" />
      <div v-for="friend in filteredFriends" :key="friend.id" 
           class="friend-item" @click="selectFriend(friend)">
        <img :src="friend.userAvatar" class="avatar" />
        <span>{{ friend.userName }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      content: '',
      showMentionPicker: false,
      friends: [],
      searchKeyword: '',
      cursorPosition: 0
    }
  },
  computed: {
    filteredFriends() {
      if (!this.searchKeyword) return this.friends;
      return this.friends.filter(f => 
        f.userName.includes(this.searchKeyword)
      );
    }
  },
  methods: {
    async handleInput(e) {
      const value = e.target.value;
      const pos = e.target.selectionStart;
      
      // 检测是否输入了@
      const beforeCursor = value.substring(0, pos);
      const atMatch = beforeCursor.match(/@([^@\s]*)$/);
      
      if (atMatch) {
        this.showMentionPicker = true;
        this.searchKeyword = atMatch[1] || '';
        this.cursorPosition = pos;
        
        // 首次加载好友列表
        if (this.friends.length === 0) {
          const res = await fetch('/comment/friends', {
            credentials: 'include'
          });
          const data = await res.json();
          this.friends = data.data;
        }
      } else {
        this.showMentionPicker = false;
      }
    },
    
    selectFriend(friend) {
      // 找到@的位置并替换
      const beforeAt = this.content.substring(0, this.cursorPosition);
      const atIndex = beforeAt.lastIndexOf('@');
      
      // 替换为 @用户名 (注意后面加空格)
      const userName = friend.userName;
      this.content = 
        this.content.substring(0, atIndex) + 
        '@' + userName + ' ' + 
        this.content.substring(this.cursorPosition);
      
      this.showMentionPicker = false;
      this.searchKeyword = '';
    }
  }
}
</script>

<style scoped>
.mention-picker {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
}

.friend-item:hover {
  background: #f5f5f5;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>
```

### 2. 评论内容高亮显示

**功能**: 将评论内容中的@用户名高亮显示，可点击跳转到用户主页

**Vue 示例**:
```vue
<template>
  <div class="comment-content" v-html="renderedContent"></div>
</template>

<script>
export default {
  props: {
    content: String,
    mentionedUsers: Array
  },
  computed: {
    renderedContent() {
      if (!this.content) return '';
      
      let result = this.escapeHtml(this.content);
      
      // 高亮所有被@的用户
      if (this.mentionedUsers && this.mentionedUsers.length > 0) {
        this.mentionedUsers.forEach(user => {
          const regex = new RegExp(`@${this.escapeRegExp(user.mentionedUserName)}`, 'g');
          result = result.replace(regex, 
            `<a class="mention" href="/user/${user.mentionedUserId}">@${user.mentionedUserName}</a>`
          );
        });
      }
      
      // 高亮未被识别的@（可选）
      result = result.replace(/@([\w\u4e00-\u9fa5]+)/g, (match, name) => {
        if (result.includes(`>${name}</a>`)) return match; // 已处理
        return `<span class="mention-invalid">@${name}</span>`;
      });
      
      return result;
    }
  },
  methods: {
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
}
</script>

<style scoped>
.comment-content {
  line-height: 1.6;
}

.comment-content :deep(.mention) {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
}

.comment-content :deep(.mention:hover) {
  text-decoration: underline;
}

.comment-content :deep(.mention-invalid) {
  color: #999;
}
</style>
```

### 3. 完整评论组件示例

```vue
<template>
  <div class="comment">
    <img :src="comment.userAvatar" class="avatar" />
    <div class="comment-body">
      <div class="header">
        <span class="username">{{ comment.userName }}</span>
        <span class="time">{{ formatTime(comment.createTime) }}</span>
      </div>
      <!-- 使用高亮组件渲染内容 -->
      <CommentContent 
        :content="comment.content" 
        :mentionedUsers="comment.mentionedUsers" 
      />
      <div class="actions">
        <span @click="handleReply">回复</span>
        <span @click="handleLike">点赞 ({{ comment.likeCount || 0 }})</span>
      </div>
    </div>
  </div>
</template>

<script>
import CommentContent from './CommentContent.vue';

export default {
  components: { CommentContent },
  props: {
    comment: Object
  },
  methods: {
    formatTime(time) {
      // 时间格式化逻辑
      return new Date(time).toLocaleString();
    },
    handleReply() {
      this.$emit('reply', this.comment);
    },
    handleLike() {
      this.$emit('like', this.comment);
    }
  }
}
</script>
```

---

## 数据结构

### CommentListVO

```typescript
interface CommentListVO {
  commentId: number;          // 评论ID
  userId: number;             // 评论者ID
  userName: string;           // 评论者名称
  userAvatar: string;         // 评论者头像
  content: string;            // 评论内容
  replyCount: number;         // 回复数
  createTime: string;         // 创建时间
  mentionedUsers: MentionedUser[];  // @的用户列表
  replyPreviewList: CommentReplyVO[]; // 回复预览
}

interface MentionedUser {
  mentionedUserId: number;    // 被@用户ID
  mentionedUserName: string;  // 被@用户名
  mentionedUserAvatar: string; // 被@用户头像
}

interface CommentReplyVO {
  commentId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  parentId: number;           // 被回复评论ID
  createTime: string;
  mentionedUsers: MentionedUser[];  // @的用户列表
}
```

---

## 注意事项

### 1. @格式要求
- 格式: `@用户名` 后面必须跟空格或标点
- 正确示例: `@张三 你好`, `@张三，你好`
- 错误示例: `@张三你好` (会尝试匹配"张三你好"这个用户名)

### 2. 好友限制
- 只能@已添加且已通过的好友
- @非好友会被自动忽略，不影响评论发布
- 建议前端在选择器中只显示好友列表

### 3. 数量限制
- 单条评论最多@10人
- 超出部分会被后端截断
- 建议前端限制选择数量

### 4. 用户体验建议
- 输入@时显示好友选择器
- 支持键盘上下键选择
- 支持模糊搜索好友名
- 评论中@高亮显示，可点击��转
- @自己时前端可提示无效

---

## 测试用例

### 1. 正常@好友
```json
// 请求
POST /comment/add
{
  "pictureid": 1,
  "content": "@张三 你好"
}

// 预期: 评论成功，张三在mentionedUsers中
```

### 2. @非好友
```json
// 请求
POST /comment/add
{
  "pictureid": 1,
  "content": "@陌生人 你好"
}

// 预期: 评论成功，但mentionedUsers为空（非好友被忽略）
```

### 3. @多个好友
```json
// 请求
POST /comment/add
{
  "pictureid": 1,
  "content": "@张三 @李四 @王五 大家好"
}

// 预期: 评论成功，mentionedUsers包含3人
```

### 4. 超过10人限制
```json
// 请求
POST /comment/add
{
  "pictureid": 1,
  "content": "@用户1 @用户2 ... @用户15 大家好"
}

// 预期: 评论成功，mentionedUsers只包含前10人
```

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-02-23 | 新增评论@好友功能 |

---

## 联系方式

如有问题，请联系后端开发团队。
