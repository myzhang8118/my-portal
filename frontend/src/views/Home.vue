<template>
  <div class="home">
    <!-- 关于我 -->
    <section class="about-section">
      <div class="container">
        <div class="about-card card">
          <div class="about-header">
            <div class="avatar-wrapper">
              <img
                :src="about.avatar || defaultAvatar"
                alt="头像"
                class="avatar"
                @error="onAvatarError"
              />
            </div>
            <h1 class="name">{{ about.name || '你的名字' }}</h1>
            <p class="title-text">{{ about.title || '一句话介绍自己' }}</p>
          </div>
          <div class="about-content markdown-content" v-html="renderedContent"></div>
        </div>
      </div>
    </section>

    <!-- 我的项目 -->
    <section class="projects-section">
      <div class="container">
        <h2 class="section-title">🚀 我的项目</h2>
        <div class="projects-grid">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card card card-hover"
            @click="goToProject(project)"
          >
            <div class="project-icon">{{ project.icon }}</div>
            <h3 class="project-title">{{ project.title }}</h3>
            <p class="project-desc">{{ project.description }}</p>
            <div class="project-tech">
              <span v-for="t in project.tech" :key="t" class="tech-tag">{{ t }}</span>
            </div>
            <div class="project-action">
              体验一下 →
            </div>
          </div>
        </div>

        <div class="tools-entrance">
          <router-link to="/tools" class="btn btn-outline">
            🛠️ 进入工具箱
          </router-link>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>Made with ❤️ | <router-link to="/admin">管理后台</router-link></p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAbout, getProjects } from '../api/index.js'
import MarkdownIt from 'markdown-it'

const router = useRouter()
const md = new MarkdownIt()

const about = ref({})
const projects = ref([])
const defaultAvatar = ref('data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#EEF2FF" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="40">👤</text></svg>'))

const renderedContent = computed(() => {
  return about.value.content ? md.render(about.value.content) : ''
})

function onAvatarError(e) {
  e.target.src = defaultAvatar.value
}

function goToProject(project) {
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
    about.value = await getAbout()
  } catch (e) {
    console.error('加载关于我失败:', e)
  }
  try {
    projects.value = await getProjects()
  } catch (e) {
    console.error('加载项目列表失败:', e)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.about-section {
  padding: 60px 0 40px;
}

.about-card {
  text-align: center;
  padding: 40px;
}

.about-header {
  margin-bottom: 30px;
}

.avatar-wrapper {
  margin-bottom: 16px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-bg);
}

.name {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.title-text {
  color: var(--text-secondary);
  font-size: 16px;
}

.about-content {
  text-align: left;
  max-width: 700px;
  margin: 0 auto;
}

.projects-section {
  padding: 20px 0 40px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.project-card {
  cursor: pointer;
  text-align: center;
  padding: 30px 24px;
}

.project-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.project-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 16px;
}

.tech-tag {
  background: var(--primary-bg);
  color: var(--primary);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.project-action {
  color: var(--primary);
  font-weight: 500;
  font-size: 14px;
}

.tools-entrance {
  text-align: center;
}

.footer {
  margin-top: auto;
  padding: 20px 0;
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
}

@media (max-width: 640px) {
  .about-section {
    padding: 30px 0 20px;
  }
  .about-card {
    padding: 24px 16px;
  }
  .name {
    font-size: 22px;
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
