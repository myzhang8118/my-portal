<template>
  <div class="home">
    <header class="site-header">
      <div class="container site-header__inner">
        <router-link to="/" class="brand" aria-label="首页">
          <span class="brand__glyph" aria-hidden="true" />
          <span class="brand__text">PORTAL</span>
        </router-link>
        <div class="header-right">
          <nav class="site-nav" aria-label="主导航">
            <router-link to="/tools" class="site-nav__link">工作台</router-link>
            <router-link to="/admin" class="site-nav__link site-nav__link--muted">管理</router-link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main>
      <section class="hero container">
        <h1 class="hero-title">
          {{ heroLine1 }}<br />
          <span class="headline-accent">{{ heroLine2 }}</span>
        </h1>
        <p class="intro-strip">{{ introResolved }}</p>
        <div class="hero-actions">
          <button class="btn btn-primary" type="button" @click="scrollToSection('projects')">{{ btnProjects }}</button>
          <button class="btn btn-outline" type="button" @click="scrollToSection('about')">{{ btnAbout }}</button>
        </div>
      </section>

      <section id="projects" class="section container">
        <h2 class="section-title">{{ headingProjects }}</h2>
        <div class="neon-line" />
        <div class="project-grid">
          <article
            v-for="(project, index) in displayedProjects"
            :key="project.id"
            class="project-card card card-hover"
            role="button"
            tabindex="0"
            @click="goToProject(project)"
            @keydown.enter="goToProject(project)"
          >
            <div class="project-index mono">项目 {{ String(index + 1).padStart(2, '0') }} / P-0{{ index + 1 }}</div>
            <h3 class="project-title">{{ project.title }}</h3>
            <p class="project-desc">{{ project.description }}</p>
            <div class="project-tags">
              <span v-for="t in (project.tech || []).slice(0, 2)" :key="t" class="chip">{{ t }}</span>
            </div>
          </article>
        </div>
      </section>

      <section id="about" class="section container about-layout">
        <div class="card card-hover about-panel">
          <h2 class="section-title">{{ headingAbout }}</h2>
          <div class="neon-line" />
          <div class="markdown-content about-content" v-html="renderedContent || defaultAboutFallback"></div>
        </div>
        <aside class="card card-hover social-panel">
          <h2 class="section-title">{{ headingSocial }}</h2>
          <div class="neon-line" />
          <div class="social-list">
            <a
              v-for="(row, i) in socialLinks"
              :key="i"
              class="social"
              :href="row.url || '#'"
              :target="isExternalUrl(row.url) ? '_blank' : undefined"
              :rel="isExternalUrl(row.url) ? 'noopener noreferrer' : undefined"
              @click="onSocialClick($event, row)"
            >
              <span>{{ row.label }}</span>
              <span>↗</span>
            </a>
          </div>
        </aside>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container site-footer__inner">
        <span class="mono site-footer__sig">// CYBER_PORTAL · NEON_STACK</span>
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
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const md = new MarkdownIt()

const about = ref({})
const projects = ref([])

const renderedContent = computed(() => {
  return about.value.content ? md.render(about.value.content) : ''
})
const displayedProjects = computed(() => projects.value.slice(0, 3))

const defaultAboutFallback =
  '<p>你好，欢迎来到至尊宝的小窝</p><p>在后台「关于我」里编辑 Markdown，内容会显示在这里。</p>'

const heroLine1 = computed(() => about.value.home_hero_line1 || '冷静表达，')
const heroLine2 = computed(() => about.value.home_hero_line2 || '锋利执行。')
const btnProjects = computed(() => about.value.home_btn_projects || '进入项目矩阵 / PROJECTS')
const btnAbout = computed(() => about.value.home_btn_about || '查看完整介绍 / ABOUT')
const headingProjects = computed(() => about.value.home_heading_projects || '我的项目 / PROJECTS')
const headingAbout = computed(() => about.value.home_heading_about || '关于我 / ABOUT ME')
const headingSocial = computed(() => about.value.home_heading_social || '社交链接 / SOCIAL')

const introResolved = computed(() => {
  const tpl =
    about.value.home_intro ||
    '你好，我是{{name}} / YOUR NAME —— 使用右上角太阳与月亮开关在同一页切换昼夜主题。'
  const name = about.value.name || '你的名字'
  return tpl.replace(/\{\{\s*name\s*\}\}/gi, name)
})

const socialLinks = computed(() => {
  const s = about.value.home_social
  if (Array.isArray(s) && s.length) {
    return s.filter((x) => x && x.label)
  }
  return []
})

function isExternalUrl(url) {
  return typeof url === 'string' && url.startsWith('http')
}

function onSocialClick(e, row) {
  if (!row.url || row.url === '#') {
    e.preventDefault()
  }
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

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78em;
  font-weight: 600;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(5, 8, 18, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:root[data-theme='light'] .site-header {
  background: color-mix(in srgb, var(--bg-card-solid) 78%, transparent);
  border-bottom-color: rgba(20, 27, 47, 0.12);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand:hover {
  filter: brightness(1.08);
}

.brand__glyph {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-pink));
  box-shadow:
    0 0 14px color-mix(in srgb, var(--cyber-cyan) 55%, transparent),
    0 0 22px color-mix(in srgb, var(--cyber-pink) 35%, transparent);
}

.brand__text {
  font-family: var(--font-display);
  font-size: clamp(14px, 2.4vw, 20px);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink), var(--cyber-violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 28px color-mix(in srgb, var(--cyber-cyan) 40%, transparent);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-right .site-nav {
  justify-content: flex-end;
}

.site-nav__link {
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  transition: transform var(--ease-hover), color var(--ease-hover), border-color var(--ease-hover), box-shadow var(--ease-hover);
}

.site-nav__link:hover {
  color: var(--text);
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--cyber-cyan) 55%, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--cyber-cyan) 22%, transparent);
}

.site-nav__link.router-link-active:not(.site-nav__link--muted) {
  color: var(--text);
  border-color: color-mix(in srgb, var(--cyber-cyan) 65%, transparent);
  background: color-mix(in srgb, var(--cyber-cyan) 10%, transparent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--cyber-cyan) 18%, transparent);
}

.site-nav__link--muted {
  font-size: 10px;
  color: var(--text-light);
  border-color: rgba(255, 255, 255, 0.1);
}

.site-nav__link--muted:hover {
  color: var(--text-secondary);
}

.hero {
  padding: 84px 0 22px;
}

.hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(44px, 8vw, 98px);
  line-height: 0.96;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.headline-accent {
  display: block;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink), var(--cyber-violet), var(--cyber-lime));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.intro-strip {
  margin: 16px 0 0;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-card-solid) 58%, transparent);
  color: var(--text-secondary);
  font-size: clamp(16px, 2.2vw, 24px);
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.hero-actions {
  margin-top: 14px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.section {
  margin-top: 34px;
}

.section-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
}

.project-card {
  grid-column: span 4;
  min-height: 178px;
  cursor: pointer;
}

.project-index {
  color: var(--cyber-cyan);
  letter-spacing: 0.1em;
  font-size: 11px;
  margin-bottom: 8px;
}

.project-title {
  margin: 0;
  font-size: 30px;
  letter-spacing: 0.03em;
}

.project-desc {
  margin: 10px 0 0;
  color: var(--text-secondary);
  line-height: 1.58;
  font-size: 14px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.chip {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.about-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.about-panel,
.social-panel {
  min-height: 260px;
}

.about-content {
  color: var(--text-secondary);
}

.social-list {
  display: grid;
  gap: 10px;
}

.social {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: var(--ease-hover);
}

.social:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--cyber-pink) 52%, transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--cyber-pink) 16%, transparent);
  transform: translateX(2px);
}

/* —— Footer —— */
.site-footer {
  margin-top: auto;
  padding: 22px 0 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -20px 40px color-mix(in srgb, var(--cyber-violet) 8%, transparent);
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
    padding: 62px 0 12px;
  }
  .project-grid {
    grid-template-columns: 1fr;
  }
  .project-card {
    grid-column: span 1;
  }
  .about-layout {
    grid-template-columns: 1fr;
  }
}
</style>
