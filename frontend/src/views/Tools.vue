<template>
  <div class="tools-page">
    <div class="container">
      <div class="page-header">
        <h1>🛠️ 工具箱</h1>
        <router-link to="/" class="btn btn-outline btn-sm">← 返回首页</router-link>
      </div>

      <div class="tools-grid">
        <div
          v-for="project in projects"
          :key="project.id"
          class="tool-card card card-hover"
          @click="goToTool(project)"
        >
          <div class="tool-icon">{{ project.icon }}</div>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <div class="tool-action">体验一下 →</div>
        </div>
      </div>

      <div v-if="projects.length === 0" class="empty-state">
        <p>暂时还没有工具，敬请期待 🎉</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects } from '../api/index.js'

const router = useRouter()
const projects = ref([])

function goToTool(project) {
  if (project.link) {
    if (project.link.startsWith('http')) {
      window.open(project.link, '_blank')
    } else {
      router.push(project.link)
    }
  }
}

onMounted(async () => {
  try {
    projects.value = await getProjects()
  } catch (e) {
    console.error('加载工具列表失败:', e)
  }
})
</script>

<style scoped>
.tools-page {
  min-height: 100vh;
  padding: 40px 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 24px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.tool-card {
  cursor: pointer;
  text-align: center;
  padding: 30px 20px;
}

.tool-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.tool-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.tool-card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.tool-action {
  color: var(--primary);
  font-weight: 500;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-light);
  font-size: 16px;
}

@media (max-width: 640px) {
  .tools-page {
    padding: 20px 0;
  }
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
