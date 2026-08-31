<template>
  <div class="visits-page">
    <h2 class="page-title">访问监控 / VISITS</h2>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-value">{{ stats.today }}</p>
        <p class="stat-label">今日访问</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">{{ stats.todayIps }}</p>
        <p class="stat-label">今日独立 IP</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">{{ stats.total }}</p>
        <p class="stat-label">累计访问</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">{{ stats.totalIps }}</p>
        <p class="stat-label">累计独立 IP</p>
      </div>
    </div>

    <!-- 7 天趋势 -->
    <div class="panel">
      <h3 class="panel-title">近 7 天访问趋势</h3>
      <div class="trend" v-if="stats.trend && stats.trend.length">
        <div v-for="d in stats.trend" :key="d.day" class="trend-item">
          <span class="trend-count">{{ d.count }}</span>
          <div class="trend-bar-wrap">
            <div class="trend-bar" :style="{ height: barHeight(d.count) }"></div>
          </div>
          <span class="trend-day">{{ d.day.slice(5) }}</span>
        </div>
      </div>
      <p v-else class="empty">暂无数据，有访客访问公开页面后自动统计</p>
    </div>

    <div class="two-col">
      <!-- IP 排行 -->
      <div class="panel">
        <h3 class="panel-title">访客 IP 排行（点击可筛选）</h3>
        <table class="table">
          <thead><tr><th>IP</th><th>次数</th><th>最近访问</th></tr></thead>
          <tbody>
            <tr v-for="r in stats.topIps" :key="r.ip" class="clickable" @click="filterByIp(r.ip)">
              <td class="mono">{{ r.ip }}</td>
              <td>{{ r.count }}</td>
              <td class="nowrap">{{ r.last_seen }}</td>
            </tr>
            <tr v-if="!stats.topIps || !stats.topIps.length"><td colspan="3" class="empty">暂无数据</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 热门页面 -->
      <div class="panel">
        <h3 class="panel-title">热门页面</h3>
        <table class="table">
          <thead><tr><th>页面</th><th>次数</th></tr></thead>
          <tbody>
            <tr v-for="r in stats.topPages" :key="r.path">
              <td class="mono">{{ r.path }}</td>
              <td>{{ r.count }}</td>
            </tr>
            <tr v-if="!stats.topPages || !stats.topPages.length"><td colspan="2" class="empty">暂无数据</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 访问记录 -->
    <div class="panel">
      <div class="list-header">
        <h3 class="panel-title">访问记录（共 {{ total }} 条）</h3>
        <div class="filter">
          <input v-model="ipFilter" class="input" placeholder="按 IP 筛选，回车确认" @keyup.enter="loadList(1)" />
          <button v-if="ipFilter" class="btn" @click="ipFilter = ''; loadList(1)">清除</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>时间</th><th>IP</th><th>页面</th><th>User-Agent</th></tr></thead>
          <tbody>
            <tr v-for="v in list" :key="v.id">
              <td class="nowrap">{{ v.created_at }}</td>
              <td class="mono nowrap">{{ v.ip }}</td>
              <td class="mono">{{ v.path }}</td>
              <td class="ua" :title="v.user_agent">{{ v.user_agent }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="4" class="empty">暂无记录</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pager">
        <button class="btn" :disabled="page <= 1" @click="loadList(page - 1)">上一页</button>
        <span>第 {{ page }} 页</span>
        <button class="btn" :disabled="page * size >= total" @click="loadList(page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getVisits, getVisitStats } from '../../api/index.js'

const stats = ref({ today: 0, todayIps: 0, total: 0, totalIps: 0, trend: [], topIps: [], topPages: [] })
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = 20
const ipFilter = ref('')

const maxTrend = computed(() => Math.max(1, ...(stats.value.trend || []).map(d => d.count)))
function barHeight(count) {
  return Math.max(6, Math.round((count / maxTrend.value) * 120)) + 'px'
}

async function loadStats() {
  stats.value = await getVisitStats()
}

async function loadList(p = 1) {
  page.value = p
  const data = await getVisits({ page: p, size, ip: ipFilter.value || undefined })
  list.value = data.list
  total.value = data.total
}

function filterByIp(ip) {
  ipFilter.value = ip
  loadList(1)
}

onMounted(() => {
  loadStats()
  loadList(1)
})
</script>

<style scoped>
.visits-page { display: flex; flex-direction: column; gap: 20px; }
.page-title { font-size: 20px; margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card {
  border: 1px solid rgba(128, 140, 168, 0.25);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}
.stat-value { font-size: 28px; font-weight: 700; margin: 0; }
.stat-label { font-size: 12px; opacity: 0.65; margin: 6px 0 0; }

.panel {
  border: 1px solid rgba(128, 140, 168, 0.25);
  border-radius: 10px;
  padding: 16px;
}
.panel-title { font-size: 14px; margin: 0 0 12px; opacity: 0.85; }

.trend { display: flex; align-items: flex-end; gap: 14px; min-height: 160px; }
.trend-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.trend-count { font-size: 12px; opacity: 0.75; }
.trend-bar-wrap { height: 120px; display: flex; align-items: flex-end; }
.trend-bar {
  width: 28px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #7c8cff, #4c5fd5);
}
.trend-day { font-size: 11px; opacity: 0.6; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th, .table td { text-align: left; padding: 8px 10px; border-bottom: 1px solid rgba(128, 140, 168, 0.15); }
.table th { opacity: 0.6; font-weight: 500; font-size: 12px; }
.mono { font-family: ui-monospace, monospace; font-size: 12px; }
.nowrap { white-space: nowrap; }
.ua { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.7; font-size: 12px; }
.clickable { cursor: pointer; }
.clickable:hover td { background: rgba(124, 140, 255, 0.08); }
.empty { text-align: center; opacity: 0.5; padding: 16px 0; }

.list-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.filter { display: flex; gap: 8px; }
.input {
  background: transparent;
  border: 1px solid rgba(128, 140, 168, 0.35);
  border-radius: 6px;
  color: inherit;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
}
.input:focus { border-color: #7c8cff; }

.table-wrap { overflow-x: auto; }
.pager { display: flex; align-items: center; gap: 14px; justify-content: center; margin-top: 12px; font-size: 13px; opacity: 0.85; }
.btn {
  background: transparent;
  border: 1px solid rgba(128, 140, 168, 0.35);
  border-radius: 6px;
  color: inherit;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
}
.btn:hover:not(:disabled) { border-color: #7c8cff; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
}
</style>
