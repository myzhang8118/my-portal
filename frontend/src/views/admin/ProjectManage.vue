<template>
  <div class="project-manage">
    <div class="page-title-row">
      <h2>项目管理</h2>
      <button class="btn btn-primary btn-sm" @click="openAdd">+ 添加项目</button>
    </div>

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div class="project-list">
      <div v-for="project in projects" :key="project.id" class="project-item card">
        <div class="project-item-header">
          <span class="project-item-icon">{{ project.icon }}</span>
          <div class="project-item-info">
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <p class="project-item-meta">
              ID: {{ project.id }} | 链接: {{ project.link }} |
              {{ project.is_visible ? '✅ 显示' : '❌ 隐藏' }}
            </p>
          </div>
          <div class="project-item-actions">
            <button class="btn btn-outline btn-sm" @click="openEdit(project)">编辑</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(project.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑/添加弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal card">
        <h3>{{ isEdit ? '编辑项目' : '添加项目' }}</h3>

        <div class="form-group">
          <label>项目 ID</label>
          <input v-model="editForm.id" class="form-input" :disabled="isEdit" placeholder="如 music、tool-b" />
        </div>
        <div class="form-group">
          <label>标题</label>
          <input v-model="editForm.title" class="form-input" placeholder="项目名称" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="editForm.description" class="form-input" rows="2" placeholder="项目简介"></textarea>
        </div>
        <div class="form-group">
          <label>图标（emoji）</label>
          <input v-model="editForm.icon" class="form-input" placeholder="🎵" />
        </div>
        <div class="form-group">
          <label>技术栈（逗号分隔）</label>
          <input v-model="editForm.techStr" class="form-input" placeholder="Vue 3, Node.js" />
        </div>
        <div class="form-group">
          <label>链接</label>
          <input v-model="editForm.link" class="form-input" placeholder="/tools/music" />
        </div>
        <div class="form-group">
          <label>排序（数字越小越靠前）</label>
          <input v-model.number="editForm.sort_order" type="number" class="form-input" />
        </div>
        <div class="form-group" v-if="isEdit">
          <label>
            <input type="checkbox" v-model="editForm.is_visible_bool" /> 在前台显示
          </label>
        </div>

        <!-- 项目配置（仅 music 项目显示 AI 配置） -->
        <div v-if="editForm.id === 'music'" class="config-section">
          <h4>🤖 AI 配置</h4>
          
          <!-- 基础配置 -->
          <div class="form-group">
            <label>API 地址</label>
            <input v-model="editForm.config.ai_api_url" class="form-input" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>API Key</label>
            <div class="password-field">
              <input
                v-model="editForm.config.ai_api_key"
                :type="showConfigPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="sk-..."
              />
              <button class="toggle-btn" @click="showConfigPassword = !showConfigPassword">
                {{ showConfigPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>模型名称</label>
            <input v-model="editForm.config.ai_model" class="form-input" placeholder="qwen-plus" />
          </div>
          <div class="form-group">
            <label>API 类型</label>
            <select v-model="editForm.config.ai_api_type" class="form-input">
              <option value="openai_compatible">OpenAI 兼容</option>
            </select>
          </div>
          
          <!-- 高级参数 -->
          <h5 class="config-subtitle">⚙️ 高级参数</h5>
          <div class="form-row">
            <div class="form-group half">
              <label>Temperature (0-2)</label>
              <input 
                v-model.number="editForm.config.ai_temperature" 
                type="number" 
                min="0" 
                max="2" 
                step="0.1"
                class="form-input" 
                placeholder="0.8" 
              />
              <span class="field-hint">控制随机性，越高越有创意</span>
            </div>
            <div class="form-group half">
              <label>Max Tokens</label>
              <input 
                v-model.number="editForm.config.ai_max_tokens" 
                type="number" 
                min="100" 
                max="4000"
                class="form-input" 
                placeholder="500" 
              />
              <span class="field-hint">最大输出长度</span>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editForm.config.ai_reasoning" />
              开启思考模式 (Reasoning)
            </label>
            <span class="field-hint">让 AI 展示思考过程（部分模型支持）</span>
          </div>
          
          <!-- 系统提示词 -->
          <h5 class="config-subtitle">📝 系统提示词</h5>
          <div class="form-group">
            <label>自定义系统提示词（可选）</label>
            <textarea 
              v-model="editForm.config.ai_system_prompt" 
              class="form-input" 
              rows="4" 
              placeholder="留空使用默认提示词"
            ></textarea>
            <span class="field-hint">自定义 AI 的角色和行为</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="showModal = false">取消</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProjects, addProject, updateProject, deleteProject } from '../../api/index.js'

const projects = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const message = ref('')
const messageType = ref('success')
const editForm = ref({})
const showConfigPassword = ref(false)

async function loadProjects() {
  try {
    projects.value = await getProjects(true)
  } catch (e) {
    showMsg('加载失败', 'error')
  }
}

function openAdd() {
  isEdit.value = false
  editForm.value = { id: '', title: '', description: '', icon: '📦', techStr: '', link: '', sort_order: 0, config: {} }
  showModal.value = true
}

function openEdit(project) {
  isEdit.value = true
  editForm.value = {
    ...project,
    techStr: (project.tech || []).join(', '),
    is_visible_bool: project.is_visible === 1,
    config: project.config || {}
  }
  showModal.value = true
}

async function handleSave() {
  const data = {
    ...editForm.value,
    tech: editForm.value.techStr.split(',').map(s => s.trim()).filter(Boolean),
    is_visible: editForm.value.is_visible_bool !== false ? 1 : 0,
    config: editForm.value.config || {}
  }
  delete data.techStr
  delete data.is_visible_bool

  saving.value = true
  try {
    if (isEdit.value) {
      await updateProject(data.id, data)
    } else {
      await addProject(data)
    }
    showModal.value = false
    showMsg('保存成功！', 'success')
    await loadProjects()
  } catch (e) {
    showMsg(e.error || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('确认删除？')) return
  try {
    await deleteProject(id)
    showMsg('删除成功', 'success')
    await loadProjects()
  } catch (e) {
    showMsg(e.error || '删除失败', 'error')
  }
}

function showMsg(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 3000)
}

onMounted(loadProjects)
</script>

<style scoped>
.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.project-item-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.project-item-info {
  flex: 1;
  min-width: 0;
}

.project-item-info h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.project-item-info p {
  color: var(--text-secondary);
  font-size: 13px;
}

.project-item-meta {
  font-size: 12px !important;
  color: var(--text-light) !important;
  margin-top: 4px;
}

.project-item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 配置区域样式 */
.config-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.config-section h4 {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.config-subtitle {
  margin-top: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-light);
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-light);
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

@media (max-width: 640px) {
  .project-item-header {
    flex-wrap: wrap;
  }
  .project-item-actions {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
