<template>
  <div class="login-page">
    <header class="login-header">
      <div class="container login-header__inner">
        <router-link to="/" class="login-back mono">← PORTAL</router-link>
        <ThemeToggle />
      </div>
    </header>
    <div class="login-card card">
      <p class="login-kicker mono">AUTH</p>
      <h2 class="login-title">管理后台</h2>
      <p class="login-tip">使用管理员密码登录</p>
      <div class="neon-strip" aria-hidden="true" />

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
import ThemeToggle from '../../components/ThemeToggle.vue'

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
  position: relative;
}

.login-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(5, 8, 18, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:root[data-theme='light'] .login-header {
  background: color-mix(in srgb, var(--bg-card-solid) 78%, transparent);
  border-bottom-color: rgba(20, 27, 47, 0.12);
}

.login-header__inner {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-back {
  color: var(--text-secondary);
  font-size: 11px;
}

.login-back:hover {
  color: var(--accent);
}

.login-card {
  width: 100%;
  max-width: 380px;
  text-align: center;
  padding: 36px 28px;
  border: 1px solid color-mix(in srgb, var(--cyber-cyan) 22%, var(--border));
  box-shadow:
    0 0 40px color-mix(in srgb, var(--cyber-violet) 12%, transparent),
    inset 0 0 28px color-mix(in srgb, var(--cyber-cyan) 6%, transparent);
}

.login-kicker {
  margin-bottom: 10px;
}

.login-title {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 4vw, 1.65rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink), var(--cyber-violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.login-tip {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.neon-strip {
  height: 2px;
  width: min(220px, 60vw);
  margin: 0 auto 18px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink), transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--cyber-cyan) 35%, transparent);
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
