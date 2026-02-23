<template>
  <div id="userLoginPage">
    <h2 class="title">用户登录</h2>
    <div class="desc">一个简单的用户界面</div>
    <LoginForm />
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码长度不能少于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { userLogin } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const loginUserStore = useLoginUserStore()
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
const handleSubmit = async (values: any) => {
  const res = await userLogin(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>
<style scoped>
#userLoginPage {
  max-width: 500px;
  margin: 0 auto;
}
.title {
  text-align: center;
  margin-bottom: 16px;
  font-size: 28px;
}
.desc {
  text-align: center;
  margin-bottom: 16px;
  color: #888;
}
.tips {
  text-align: right;
  margin-bottom: 16px;
  font-size: 13px;
}
</style>
