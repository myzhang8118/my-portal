<template>
  <div class="change-password">
    <h2>修改密码</h2>

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div class="card" style="max-width: 400px;">
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
.change-password h2 {
  margin-bottom: 20px;
}
</style>
