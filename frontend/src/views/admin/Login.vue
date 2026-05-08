<template>
  <div class="login-page">
    <div class="login-card card">
      <p class="login-kicker mono">AUTH</p>
      <h2 class="login-title">管理后台</h2>
      <p class="login-tip">使用管理员密码登录</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="密码"
            autofocus
          />
        </div>
        <div v-if="error" class="message message-error">{{ error }}</div>
        <button class="btn btn-primary login-btn" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
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
.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-light);
}

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
  padding: 36px 28px;
}

.login-kicker {
  margin-bottom: 10px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
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
  font-size: 15px;
}

.back-link {
  display: inline-block;
  margin-top: 22px;
  color: var(--text-light);
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.back-link:hover {
  color: var(--accent);
}
</style>
