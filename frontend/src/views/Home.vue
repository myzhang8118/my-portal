<template>
  <div class="home">
    <header class="site-header">
      <div class="container site-header__inner">
        <router-link to="/" class="brand" aria-label="首页">
          <span class="brand__glyph" aria-hidden="true" />
          <span class="brand__text">PORTAL</span>
        </router-link>
        <nav class="site-nav" aria-label="主导航">
          <router-link to="/tools" class="site-nav__link">工作台</router-link>
          <router-link to="/admin" class="site-nav__link site-nav__link--muted">管理</router-link>
        </nav>
      </div>
    </header>

    <main>
      <!-- 关于我 -->
      <section class="hero">
        <div class="container">
          <p class="hero__kicker">
            <span class="mono">SYS</span><span class="hero__dot">·</span><span class="mono">PROFILE</span>
          </p>
          <div class="about-card card">
            <div class="about-card__header">
              <div class="avatar-wrap">
                <img
                  :src="about.avatar || defaultAvatar"
                  alt=""
                  class="avatar"
                  width="96"
                  height="96"
                  @error="onAvatarError"
                />
              </div>
              <div class="about-card__titles">
                <h1 class="name">{{ about.name || '你的名字' }}</h1>
                <p class="title-line">{{ about.title || '一句话介绍自己' }}</p>
              </div>
            </div>
            <div class="about-card__body markdown-content" v-html="renderedContent"></div>
          </div>
        </div>
      </section>

      <!-- 项目 -->
      <section class="projects">
        <div class="container">
          <div class="section-head">
            <h2 class="section-head__title">项目</h2>
            <span class="section-head__meta mono">SELECTED_WORK</span>
          </div>

          <div class="projects-grid">
            <article
              v-for="project in projects"
              :key="project.id"
              class="project-card card card-hover"
              role="button"
              tabindex="0"
              @click="goToProject(project)"
              @keydown.enter="goToProject(project)"
            >
              <div class="project-card__top">
                <span class="project-card__icon" aria-hidden="true">{{ project.icon }}</span>
                <span class="project-card__chevron mono" aria-hidden="true">→</span>
              </div>
              <h3 class="project-card__title">{{ project.title }}</h3>
              <p class="project-card__desc">{{ project.description }}</p>
              <div v-if="project.tech?.length" class="project-card__tags">
                <span v-for="t in project.tech" :key="t" class="tag mono">{{ t }}</span>
              </div>
            </article>
          </div>

          <div class="tools-cta">
            <router-link to="/tools" class="btn btn-outline">
              打开工作台
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container site-footer__inner">
        <span class="mono site-footer__sig">// built minimal</span>
        <router-link to="/admin" class="site-footer__link">管理后台</router-link>
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

const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#0c0e12"/>
  <path d="M35 68V32l15 18 15-18v36" fill="none" stroke="#5eead4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
</svg>`
const defaultAvatar = ref('data:image/svg+xml,' + encodeURIComponent(defaultSvg))

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
.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.78em;
  font-weight: 500;
}

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* —— Header —— */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border);
  background: rgba(7, 8, 11, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-weight: 700;
  letter-spacing: 0.14em;
  font-size: 12px;
}

.brand:hover {
  color: var(--primary-light);
}

.brand__glyph {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: linear-gradient(135deg, var(--accent), rgba(94, 234, 212, 0.2));
  box-shadow: 0 0 16px rgba(94, 234, 212, 0.45);
}

.brand__text {
  font-family: var(--font-mono);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.site-nav__link {
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.site-nav__link:hover {
  color: var(--text);
  background: var(--accent-dim);
  border-color: var(--border);
}

.site-nav__link.router-link-active:not(.site-nav__link--muted) {
  color: var(--accent);
  border-color: rgba(94, 234, 212, 0.35);
  background: var(--accent-muted);
}

.site-nav__link--muted {
  font-size: 12px;
  color: var(--text-light);
}

.site-nav__link--muted:hover {
  color: var(--text-secondary);
}

/* —— Hero / About —— */
.hero {
  padding: 36px 0 28px;
}

.hero__kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: var(--text-light);
}

.hero__dot {
  opacity: 0.45;
}

.about-card {
  padding: 28px 26px;
  text-align: left;
}

.about-card__header {
  display: flex;
  gap: 22px;
  align-items: center;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid var(--border);
  box-shadow: 0 0 0 1px rgba(94, 234, 212, 0.12);
}

.about-card__titles {
  min-width: 0;
}

.name {
  font-size: clamp(1.55rem, 4vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 6px;
}

.title-line {
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  max-width: 36ch;
}

.about-card__body {
  max-width: 680px;
}

/* —— Projects —— */
.projects {
  padding: 12px 0 48px;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.section-head__title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text);
}

.section-head__meta {
  color: var(--text-light);
  font-size: 11px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.project-card {
  cursor: pointer;
  text-align: left;
  padding: 20px 18px;
}

.project-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-card__icon {
  font-size: 26px;
  line-height: 1;
  opacity: 0.92;
}

.project-card__chevron {
  color: var(--text-light);
  font-size: 14px;
  transition: color 0.2s ease, transform 0.2s ease;
}

.project-card:hover .project-card__chevron {
  color: var(--accent);
  transform: translateX(3px);
}

.project-card__title {
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.project-card__desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.55;
  margin-bottom: 14px;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: var(--primary-light);
  background: var(--accent-muted);
  border: 1px solid rgba(94, 234, 212, 0.22);
}

.tools-cta {
  display: flex;
  justify-content: center;
}

/* —— Footer —— */
.site-footer {
  margin-top: auto;
  padding: 22px 0 28px;
  border-top: 1px solid var(--border);
}

.site-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.site-footer__sig {
  color: var(--text-light);
  font-size: 11px;
}

.site-footer__link {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.site-footer__link:hover {
  color: var(--accent);
}

@media (max-width: 640px) {
  .hero {
    padding: 24px 0 18px;
  }
  .about-card {
    padding: 20px 16px;
  }
  .about-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
