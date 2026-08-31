<template>
  <div class="change-password">
    <div class="module-head">
      <h2>修改密码</h2>
      <p class="module-head__meta mono">SECURITY / CREDENTIAL_ROTATION</p>
    </div>
    <div class="neon-strip" aria-hidden="true" />

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div class="card module-panel password-panel">
      <div class="form-group">
        <label>旧密码</label>
        <input v-model="form.oldPassword" type="password" class="form-input" placeholder="当前密码" />
      </div>

      <div class="form-group">
        <label>新密码</label>
        <input v-model="form.newPassword" type="password" class="form-input" placeholder="新密码（至少6位）" />
      </div>

      <div class="form-group">
        <label>确认新密码</label>
        <input v-model="form.confirmPassword" type="password" class="form-input" placeholder="再次输入新密码" />
      </div>

      <button class="btn btn-primary" @click="handleChange" :disabled="saving">
        {{ saving ? '修改中...' : '修改密码' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { changePassword } from '../../api/index.js'

const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)
const message = ref('')
const messageType = ref('success')

async function handleChange() {
  if (!form.oldPassword || !form.newPassword) {
    return showMsg('请填写完整', 'error')
  }
  if (form.newPassword !== form.confirmPassword) {
    return showMsg('两次密码不一致', 'error')
  }
  if (form.newPassword.length < 6) {
    return showMsg('新密码至少 6 位', 'error')
  }

  saving.value = true
  try {
    await changePassword(form.oldPassword, form.newPassword)
    showMsg('密码修改成功！', 'success')
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e) {
    showMsg(e.error || '修改失败', 'error')
  } finally {
    saving.value = false
  }
}

function showMsg(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 3000)
}
</script>

<style scoped>
.module-head {
  margin-bottom: 8px;
}

.module-head h2 {
  margin-bottom: 4px;
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.8vw, 1.45rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.module-head__meta {
  color: var(--text-light);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.neon-strip {
  height: 2px;
  width: min(260px, 55vw);
  margin: 10px 0 18px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink), transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--cyber-cyan) 35%, transparent);
}

.module-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 3px solid color-mix(in srgb, var(--cyber-cyan) 68%, transparent);
}

.password-panel {
  max-width: 460px;
}
</style>
