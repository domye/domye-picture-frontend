import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<{ userName: string; id: number | null }>({
    userName: '未登录',
    id: null,
  })

  async function fetchLoginUser() {
    // 测试用户登录，3 秒后登录
    setTimeout(() => {
      loginUser.value = { userName: '测试用户', id: 1 }
    }, 3000)
  }
  function setLoginUser(newLoginUser: { userName: string; id: number | null }) {
    loginUser.value = newLoginUser
  }

  return { setLoginUser, loginUser, fetchLoginUser }
})
