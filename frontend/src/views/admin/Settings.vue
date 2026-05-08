<template>
  <div class="settings-page">
    <h2>系统配置</h2>

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div v-for="(group, groupKey) in settings" :key="groupKey" class="settings-group card">
      <h3>{{ group.label }}</h3>
      <div v-for="item in group.items" :key="item.key" class="form-group">
        <label>{{ item.label }}</label>
        <div v-if="item.type === 'password'" class="password-field">
          <input
            v-model="formData[item.key]"
            :type="showPasswords[item.key] ? 'text' : 'password'"
            class="form-input"
            :placeholder="item.displayValue || '未设置'"
          />
          <button class="toggle-btn" @click="showPasswords[item.key] = !showPasswords[item.key]">
            {{ showPasswords[item.key] ? '🙈' : '👁️' }}
          </button>
        </div>
        <select v-else-if="item.type === 'select'" v-model="formData[item.key]" class="form-input">
          <option v-for="opt in item.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <input v-else v-model="formData[item.key]" class="form-input" />
      </div>
    </div>

    <button class="btn btn-primary" @click="handleSave" :disabled="saving">
      {{ saving ? '保存中...' : '💾 保存配置' }}
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSettings, updateSettings } from '../../api/index.js'

const settings = ref({})
const formData = reactive({})
const showPasswords = reactive({})
const saving = ref(false)
const message = ref('')
const messageType = ref('success')

onMounted(async () => {
  try {
    const data = await getSettings()
    settings.value = data
    // 初始化表单数据
    for (const group of Object.values(data)) {
      for (const item of group.items) {
        formData[item.key] = item.value
        if (item.type === 'password') {
          showPasswords[item.key] = false
        }
      }
    }
  } catch (e) {
    showMsg('加载配置失败', 'error')
  }
})

async function handleSave() {
  saving.value = true
  try {
    await updateSettings({ ...formData })
    showMsg('配置已保存！', 'success')
  } catch (e) {
    showMsg(e.error || '保存失败', 'error')
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
.settings-page h2 {
  margin-bottom: 20px;
}

.settings-group {
  margin-bottom: 20px;
}

.settings-group h3 {
  font-size: 16px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.password-field {
  display: flex;
  gap: 8px;
}

.password-field .form-input {
  flex: 1;
}

.toggle-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 12px;
  cursor: pointer;
  font-size: 16px;
}
</style>
