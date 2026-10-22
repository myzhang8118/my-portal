<template>
  <div class="switch-page">
    <div class="module-head">
      <div>
        <h2>服务开关</h2>
        <p class="module-head__meta mono">SERVER PROJECTS / ON-OFF SWITCH</p>
      </div>
      <div class="module-head__actions">
        <button class="btn btn-outline btn-sm" @click="load" :disabled="loading">🔄 刷新</button>
        <button class="btn btn-outline btn-sm" @click="allAction('start')" :disabled="loading">全部启动</button>
        <button class="btn btn-outline btn-sm" @click="allAction('stop')" :disabled="loading">全部停止</button>
      </div>
    </div>
    <div class="neon-strip" aria-hidden="true" />

    <div v-if="message" :class="['message', messageType === 'success' ? 'message-success' : 'message-error']">
      {{ message }}
    </div>

    <div class="switch-list module-panel card">
      <div v-for="p in projects" :key="p.name" class="switch-item card">
        <div class="switch-item__head">
          <span :class="['status-dot', `status-dot--${p.status}`]"></span>
          <div class="switch-item__info">
            <h3>{{ p.name }}</h3>
            <p class="switch-item__desc">{{ p.desc }}</p>
            <p class="switch-item__meta">
              <span :class="['type-badge', `type-badge--${p.type}`]">{{ typeLabel(p.type) }}</span>
              <span v-if="p.port" class="mono">:{{ p.port }}</span>
              <span v-if="p.path" class="mono">{{ p.path }}</span>
              <span class="status-text" :data-status="p.status">{{ statusLabel(p.status) }}</span>
            </p>
            <p v-if="p.name === 'my-portal'" class="switch-item__warn">
              ⚠️ 停止后本面板也会下线，需 SSH 执行 <code>ssh aliyun "/root/projects.sh start my-portal"</code> 恢复
            </p>
            <p v-else-if="p.name === 'travel-agent'" class="switch-item__warn">
              ℹ️ 仅 git 仓库，未部署
            </p>
          </div>
        </div>
        <div class="switch-item__actions">
          <button class="btn btn-primary btn-sm" :disabled="loading || p.status==='running' || p.type==='undeployed'"
                  @click="doAction(p.name, 'start')">启动</button>
          <button class="btn btn-outline btn-sm" :disabled="loading || p.status==='stopped' || p.type==='undeployed'"
                  @click="doAction(p.name, 'stop')">停止</button>
          <button class="btn btn-outline btn-sm" :disabled="loading || p.type==='undeployed'"
                  @click="doAction(p.name, 'restart')">重启</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getSwitch, switchAction } from '../../api/index.js'

const projects = ref([])
const loading = ref(false)
const message = ref('')
const messageType = ref('success')
let pollTimer = null

async function load() {
  loading.value = true
  try {
    projects.value = await getSwitch()
  } catch (e) {
    showMsg('加载失败：' + (e.error || '网络错误'), 'error')
  } finally {
    loading.value = false
  }
}

async function doAction(name, action) {
  if (!confirm(`${name} ${actionLabel(action)}？`)) return
  loading.value = true
  try {
    const r = await switchAction(name, action)
    showMsg(r.message || `${name} ${action} 成功`, 'success')
    if (r.recovery) {
      showMsg(`${name} ${action} 已触发。${r.recovery}`, 'success')
    }
    await load()
  } catch (e) {
    showMsg(`${name} ${action} 失败：${e.error || '未知错误'}`, 'error')
  } finally {
    loading.value = false
  }
}

async function allAction(action) {
  const names = projects.value.filter(p => p.type !== 'undeployed').map(p => p.name)
  if (!confirm(`对 ${names.length} 个项目执行：${actionLabel(action)}？`)) return
  loading.value = true
  for (const n of names) {
    try { await switchAction(n, action) } catch (e) { /* 继续下一个 */ }
  }
  showMsg(`批量 ${action} 完成`, 'success')
  await load()
  loading.value = false
}

function showMsg(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 5000)
}

function typeLabel(t) {
  return { pm2: 'PM2', systemd: 'systemd', static: '静态', undeployed: '未部署' }[t] || t
}
function statusLabel(s) {
  return { running: '运行中', stopped: '已停止', degraded: '路由在/进程未跑' }[s] || s
}
function actionLabel(a) {
  return { start: '启动', stop: '停止', restart: '重启' }[a] || a
}

onMounted(() => {
  load()
  // 每 10s 自动刷新（让前端状态跟上后台 switch）
  pollTimer = setInterval(load, 10000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<style scoped>
.module-head__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.switch-list { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
.switch-item { padding: 14px 16px; }
.switch-item__head { display: flex; gap: 14px; align-items: flex-start; }
.switch-item__info { flex: 1; min-width: 0; }
.switch-item__info h3 { font-size: 16px; margin-bottom: 2px; font-family: var(--font-display); letter-spacing: 0.04em; }
.switch-item__desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 4px; }
.switch-item__meta { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; font-size: 12px; color: var(--text-light); }
.switch-item__warn { font-size: 11px; color: var(--text-light); margin-top: 6px; }
.switch-item__warn code { background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; font-size: 11px; }
.switch-item__actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; min-width: 90px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; box-shadow: 0 0 10px; }
.status-dot--running { background: #2ed573; box-shadow: 0 0 10px #2ed573; }
.status-dot--stopped { background: #ff4757; box-shadow: 0 0 10px #ff4757; }
.status-dot--degraded { background: #ffa502; box-shadow: 0 0 10px #ffa502; }
.status-text { font-weight: 600; }
.status-text[data-status="running"] { color: #2ed573; }
.status-text[data-status="stopped"] { color: #ff4757; }
.status-text[data-status="degraded"] { color: #ffa502; }
.type-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; letter-spacing: 0.05em; }
.type-badge--pm2 { background: rgba(46, 213, 115, 0.15); color: #2ed573; border: 1px solid rgba(46,213,115,0.3); }
.type-badge--systemd { background: rgba(255, 165, 2, 0.15); color: #ffa502; border: 1px solid rgba(255,165,2,0.3); }
.type-badge--static { background: rgba(116, 185, 255, 0.15); color: #74b9ff; border: 1px solid rgba(116,185,255,0.3); }
.type-badge--undeployed { background: rgba(255,255,255,0.08); color: var(--text-light); border: 1px solid rgba(255,255,255,0.15); }
@media (max-width: 640px) {
  .switch-item__head { flex-wrap: wrap; }
  .switch-item__actions { flex-direction: row; width: 100%; }
}
</style>
