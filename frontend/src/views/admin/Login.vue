<template>
  <div class="login-page">
    <div class="login-card card">
      <h2>⚙️ 管理后台</h2>
      <p class="login-tip">请输入管理员密码</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="输入密码"
            autofocus
          />
        </div>
        <div v-if="error" class="message message-error">{{ error }}</div>
        <button class="btn btn-primary login-btn" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <router-link to="/" class="back-link">← 返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../api/index.js'
import { setToken } from '../../utils/auth.js'

const router = useRouter()
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await login(password.value)
    setToken(result.token)
    router.push('/admin/about')
  } catch (e) {
    error.value = e.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  text-align: center;
  padding: 40px 30px;
}

.login-card h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.login-tip {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: var(--text-light);
  font-size: 14px;
}

.back-link:hover {
  color: var(--primary);
}
</style>
