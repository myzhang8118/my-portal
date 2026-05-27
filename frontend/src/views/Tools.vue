<template>
  <div class="tools-page">
    <header class="sub-header">
      <div class="container sub-header__inner">
        <router-link to="/" class="sub-header__back mono">← INDEX</router-link>
        <div class="header-right">
          <span class="sub-header__title mono">LAB</span>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="container tools-body">
      <div class="page-head">
        <div>
          <h1 class="page-head__h">工作台</h1>
          <p class="page-head__sub mono">TOOLS · UTILITIES</p>
        </div>
        <router-link to="/" class="btn btn-outline btn-sm">返回首页</router-link>
      </div>
      <div class="neon-strip" aria-hidden="true" />

      <div class="tools-panel card">
        <div class="tools-grid">
          <article
            v-for="project in projects"
            :key="project.id"
            class="tool-card card card-hover"
            role="button"
            tabindex="0"
            @click="goToTool(project)"
            @keydown.enter="goToTool(project)"
          >
            <div class="tool-card__row">
              <span class="tool-card__icon" aria-hidden="true">{{ project.icon }}</span>
              <span class="tool-card__arrow mono" aria-hidden="true">→</span>
            </div>
            <h3 class="tool-card__title">{{ project.title }}</h3>
            <p class="tool-card__desc">{{ project.description }}</p>
          </article>
        </div>

        <div v-if="projects.length === 0" class="empty-state">
          <p class="mono">EMPTY_STATE</p>
          <p class="empty-state__hint">暂无工具项，可在后台添加。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects } from '../api/index.js'
import ThemeToggle from '../components/ThemeToggle.vue'

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
  display: flex;
  flex-direction: column;
}

.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sub-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(5, 8, 18, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:root[data-theme='light'] .sub-header {
  background: color-mix(in srgb, var(--bg-card-solid) 78%, transparent);
  border-bottom-color: rgba(20, 27, 47, 0.12);
}

.sub-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  flex-wrap: wrap;
  padding: 6px 0;
}

.sub-header__back {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.sub-header__back:hover {
  color: var(--accent);
}

.sub-header__title {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 600;
}

.tools-body {
  padding: 28px 22px 48px;
  flex: 1;
}

.neon-strip {
  height: 2px;
  width: min(260px, 55vw);
  margin: -6px 0 18px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink), transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--cyber-cyan) 35%, transparent);
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.page-head__h {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow:
    0 0 18px color-mix(in srgb, var(--cyber-cyan) 22%, transparent),
    0 0 28px color-mix(in srgb, var(--cyber-pink) 15%, transparent);
}

.page-head__sub {
  margin-top: 8px;
  font-size: 10px;
  color: var(--text-light);
  font-weight: 700;
  letter-spacing: 0.12em;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.tools-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 3px solid color-mix(in srgb, var(--cyber-cyan) 68%, transparent);
  padding: 16px;
}

.tool-card {
  cursor: pointer;
  text-align: left;
  padding: 20px 18px;
}

.tool-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tool-card__icon {
  font-size: 26px;
  line-height: 1;
}

.tool-card__arrow {
  font-size: 13px;
  color: var(--text-light);
  transition: color 0.2s ease, transform 0.2s ease;
}

.tool-card:hover .tool-card__arrow {
  color: var(--accent);
  transform: translateX(3px);
}

.tool-card__title {
  font-size: 16px;
  font-weight: 650;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.tool-card__desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.empty-state {
  text-align: center;
  padding: 64px 16px 40px;
  color: var(--text-light);
}

.empty-state .mono {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.empty-state__hint {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .tools-body {
    padding: 20px 16px 40px;
  }
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
