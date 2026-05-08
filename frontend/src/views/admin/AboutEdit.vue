<template>
  <div class="about-edit">
    <h2>编辑关于我</h2>

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div class="form-group">
      <label>头像</label>
      <div class="avatar-upload">
        <img :src="form.avatar || defaultAvatar" class="preview-avatar" @error="(e) => e.target.src = defaultAvatar" />
        <input type="file" accept="image/*" @change="handleUpload" ref="fileInput" style="display:none" />
        <button class="btn btn-outline btn-sm" @click="$refs.fileInput.click()">上传头像</button>
      </div>
    </div>

    <div class="form-group">
      <label>名字</label>
      <input v-model="form.name" class="form-input" placeholder="你的名字" />
    </div>

    <div class="form-group">
      <label>一句话介绍</label>
      <input v-model="form.title" class="form-input" placeholder="一句话介绍自己" />
    </div>

    <div class="form-group">
      <label>详细介绍（Markdown）</label>
      <MdEditor
        v-model="form.content"
        language="zh-CN"
        :preview="true"
        style="height: 400px"
      />
    </div>

    <button class="btn btn-primary" @click="handleSave" :disabled="saving">
      {{ saving ? '保存中...' : '💾 保存' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAbout, updateAbout, uploadAvatar } from '../../api/index.js'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const form = ref({ name: '', avatar: '', title: '', content: '' })
const saving = ref(false)
const message = ref('')
const messageType = ref('success')
const fileInput = ref(null)
const defaultAvatar = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#EEF2FF" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="40">👤</text></svg>')

onMounted(async () => {
  try {
    const data = await getAbout()
    form.value = { ...data }
  } catch (e) {
    showMessage('加载失败', 'error')
  }
})

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  try {
    const result = await uploadAvatar(file)
    form.value.avatar = result.url
    showMessage('头像上传成功', 'success')
  } catch (e) {
    showMessage(e.error || '上传失败', 'error')
  }
}

async function handleSave() {
  saving.value = true
  try {
    await updateAbout(form.value)
    showMessage('保存成功！', 'success')
  } catch (e) {
    showMessage(e.error || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

function showMessage(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 3000)
}
</script>

<style scoped>
.about-edit h2 {
  margin-bottom: 20px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}
</style>
