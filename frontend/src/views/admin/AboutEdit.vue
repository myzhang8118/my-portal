<template>
  <div class="about-edit">
    <div class="module-head">
      <h2>编辑关于我</h2>
      <p class="module-head__meta mono">ABOUT / PROFILE_EDITOR</p>
    </div>
    <div class="neon-strip" aria-hidden="true" />

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div class="module-panel card">
      <h3 class="block-title">基础资料</h3>
      <div class="form-group">
        <label>头像</label>
        <div class="avatar-upload">
          <img :src="form.avatar || defaultAvatar" class="preview-avatar" @error="(e) => (e.target.src = defaultAvatar)" />
          <input type="file" accept="image/*" @change="handleUpload" ref="fileInput" style="display: none" />
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
        <label>详细介绍（Markdown，用于首页「关于我」区块）</label>
        <MdEditor v-model="form.content" language="zh-CN" :preview="true" style="height: 400px" />
      </div>

      <h3 class="block-title block-title--spaced">首页展示区</h3>
      <p class="field-hint">以下字段会渲染在首页；介绍条支持占位符 <code v-pre class="inline-code">{{name}}</code>，保存后会替换为上方「名字」。</p>

      <div class="form-row">
        <div class="form-group half">
          <label>主标题第一行</label>
          <input v-model="form.home_hero_line1" class="form-input" placeholder="冷静表达，" />
        </div>
        <div class="form-group half">
          <label>主标题第二行（渐变高亮）</label>
          <input v-model="form.home_hero_line2" class="form-input" placeholder="锋利执行。" />
        </div>
      </div>

      <div class="form-group">
        <label>介绍横条全文</label>
        <textarea
          v-model="form.home_intro"
          class="form-input"
          rows="3"
          :placeholder="introPlaceholder"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label>按钮：进入项目</label>
          <input v-model="form.home_btn_projects" class="form-input" />
        </div>
        <div class="form-group half">
          <label>按钮：查看介绍</label>
          <input v-model="form.home_btn_about" class="form-input" />
        </div>
      </div>

      <div class="form-group">
        <label>区块标题 · 项目区</label>
        <input v-model="form.home_heading_projects" class="form-input" />
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>区块标题 · 关于我</label>
          <input v-model="form.home_heading_about" class="form-input" />
        </div>
        <div class="form-group half">
          <label>区块标题 · 社交</label>
          <input v-model="form.home_heading_social" class="form-input" />
        </div>
      </div>

      <div class="form-group">
        <label>社交链接（可增删）</label>
        <div v-for="(row, i) in form.home_social" :key="i" class="social-row">
          <input v-model="row.label" class="form-input" placeholder="显示文字" />
          <input v-model="row.url" class="form-input" placeholder="https:// 或 # 占位" />
          <button type="button" class="btn btn-outline btn-sm" @click="removeSocial(i)">删</button>
        </div>
        <button type="button" class="btn btn-outline btn-sm" @click="addSocial">+ 添加一行</button>
      </div>

      <button class="btn btn-primary" @click="handleSave" :disabled="saving">
        {{ saving ? '保存中...' : '💾 保存' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAbout, updateAbout, uploadAvatar } from '../../api/index.js'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const emptyForm = () => ({
  name: '',
  avatar: '',
  title: '',
  content: '',
  home_hero_line1: '冷静表达，',
  home_hero_line2: '锋利执行。',
  home_intro:
    '你好，我是{{name}} / YOUR NAME —— 使用右上角太阳与月亮开关在同一页切换昼夜主题。',
  home_btn_projects: '进入项目矩阵 / PROJECTS',
  home_btn_about: '查看完整介绍 / ABOUT',
  home_heading_projects: '我的项目 / PROJECTS',
  home_heading_about: '关于我 / ABOUT ME',
  home_heading_social: '社交链接 / SOCIAL',
  home_social: [
    { label: 'GitHub / 开源主页', url: 'https://github.com' },
    { label: '小红书 / 内容更新', url: 'https://www.xiaohongshu.com' },
    { label: '微信 / 商务合作', url: '#' },
    { label: '邮箱 / Email', url: 'mailto:hello@example.com' }
  ]
})

const form = ref(emptyForm())
const saving = ref(false)
const message = ref('')
const messageType = ref('success')
const fileInput = ref(null)
const introPlaceholder = '你好，我是{{name}} / YOUR NAME —— …'

const defaultAvatar =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#EEF2FF" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="40">👤</text></svg>'
  )

function normalizeFromApi(data) {
  const base = emptyForm()
  const merged = { ...base, ...data }
  const social = Array.isArray(data.home_social)
    ? data.home_social.map((x) => ({ label: x.label || '', url: x.url || '#' }))
    : base.home_social
  merged.home_social = social.length ? social : base.home_social
  return merged
}

onMounted(async () => {
  try {
    const data = await getAbout()
    form.value = normalizeFromApi(data)
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

function addSocial() {
  form.value.home_social.push({ label: '', url: 'https://' })
}

function removeSocial(i) {
  form.value.home_social.splice(i, 1)
}

async function handleSave() {
  saving.value = true
  try {
    await updateAbout({ ...form.value })
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
  setTimeout(() => {
    message.value = ''
  }, 3000)
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

.block-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.block-title--spaced {
  margin-top: 22px;
}

.field-hint {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--text-light);
  line-height: 1.55;
}

.inline-code {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--cyber-cyan) 10%, transparent);
}

.form-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.form-group.half {
  flex: 1;
  min-width: 200px;
}

.social-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.social-row .form-input {
  flex: 1;
  min-width: 140px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid var(--border);
  box-shadow: 0 0 20px color-mix(in srgb, var(--cyber-cyan) 15%, transparent);
}
</style>
