<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="container admin-header-inner">
        <h1 class="admin-logo"><span class="admin-logo__mark" aria-hidden="true" />ADMIN CONSOLE</h1>
        <div class="admin-actions">
          <router-link to="/" class="btn btn-outline btn-sm">查看网站</router-link>
          <button class="btn btn-sm btn-danger" type="button" @click="handleLogout">退出</button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="container admin-shell">
      <aside class="admin-sidebar">
        <p class="admin-sidebar__title">CONTROL</p>
        <nav class="admin-sidebar__nav">
          <router-link to="/admin/about" class="admin-nav-item" active-class="admin-nav-item--active">关于我 / About</router-link>
          <router-link to="/admin/projects" class="admin-nav-item" active-class="admin-nav-item--active">项目管理 / Projects</router-link>
          <router-link to="/admin/settings" class="admin-nav-item" active-class="admin-nav-item--active">系统配置 / Settings</router-link>
          <router-link to="/admin/visits" class="admin-nav-item" active-class="admin-nav-item--active">访问监控 / Visits</router-link>
          <router-link to="/admin/password" class="admin-nav-item" active-class="admin-nav-item--active">修改密码 / Password</router-link>
        </nav>
      </aside>

      <main class="admin-main">
        <nav class="mobile-nav">
          <router-link to="/admin/about" class="mobile-nav-item" active-class="mobile-nav-item--active">关于我</router-link>
          <router-link to="/admin/projects" class="mobile-nav-item" active-class="mobile-nav-item--active">项目</router-link>
          <router-link to="/admin/settings" class="mobile-nav-item" active-class="mobile-nav-item--active">配置</router-link>
          <router-link to="/admin/visits" class="mobile-nav-item" active-class="mobile-nav-item--active">监控</router-link>
          <router-link to="/admin/password" class="mobile-nav-item" active-class="mobile-nav-item--active">密码</router-link>
        </nav>
        <section class="admin-main-panel card">
          <router-view />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { removeToken } from '../../utils/auth.js'
import ThemeToggle from '../../components/ThemeToggle.vue'

const router = useRouter()

function handleLogout() {
  removeToken()
  router.push('/admin')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--bg);
}

.admin-header {
  background: rgba(5, 8, 18, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 12px 40px color-mix(in srgb, var(--cyber-violet) 8%, transparent);
}

:root[data-theme='light'] .admin-header {
  background: color-mix(in srgb, var(--bg-card-solid) 88%, transparent);
  border-bottom-color: rgba(20, 27, 47, 0.12);
  box-shadow: 0 8px 28px rgba(20, 27, 47, 0.08);
}

.admin-header-inner {
  display: flex;
  align-items: center;
  min-height: 68px;
  gap: 16px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.admin-logo {
  font-family: var(--font-display);
  font-size: 14px;
  white-space: nowrap;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 14px color-mix(in srgb, var(--cyber-cyan) 35%, transparent));
}

.admin-logo__mark {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-pink));
  box-shadow:
    0 0 14px color-mix(in srgb, var(--cyber-cyan) 55%, transparent),
    0 0 22px color-mix(in srgb, var(--cyber-pink) 35%, transparent);
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;
}

.admin-shell {
  display: grid;
  grid-template-columns: 248px 1fr;
  gap: 18px;
  padding-top: 18px;
  padding-bottom: 28px;
}

.admin-sidebar {
  position: sticky;
  top: 92px;
  align-self: start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: color-mix(in srgb, var(--bg-card-solid) 70%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 16px 12px;
  box-shadow: var(--shadow);
}

.admin-sidebar__title {
  margin: 0 0 12px;
  padding: 0 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--cyber-cyan);
}

.admin-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-nav-item {
  position: relative;
  border-radius: 10px;
  padding: 11px 12px 11px 14px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  border: 1px solid transparent;
  transition: border-color var(--ease-hover), background var(--ease-hover), color var(--ease-hover), box-shadow var(--ease-hover);
}

.admin-nav-item::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 20%;
  width: 3px;
  height: 60%;
  border-radius: 2px;
  opacity: 0;
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-pink));
  box-shadow: 0 0 12px color-mix(in srgb, var(--cyber-cyan) 50%, transparent);
  transition: opacity var(--ease-hover);
}

.admin-nav-item:hover {
  color: var(--text);
  border-color: rgba(255, 255, 255, 0.1);
  background: color-mix(in srgb, var(--cyber-cyan) 8%, transparent);
}

.admin-nav-item--active {
  color: var(--text);
  border-color: color-mix(in srgb, var(--cyber-cyan) 40%, transparent);
  background: color-mix(in srgb, var(--cyber-cyan) 12%, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--cyber-cyan) 14%, transparent);
}

.admin-nav-item--active::before {
  opacity: 1;
}

.admin-main {
  min-width: 0;
}

.admin-main-panel {
  min-height: calc(100vh - 140px);
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.mobile-nav {
  display: none;
  overflow-x: auto;
  margin-bottom: 12px;
  padding: 2px;
  gap: 6px;
  background: transparent;
}

.mobile-nav-item {
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-item--active {
  border-color: color-mix(in srgb, var(--cyber-cyan) 45%, transparent);
  color: var(--text);
  box-shadow: 0 0 12px color-mix(in srgb, var(--cyber-cyan) 12%, transparent);
}

@media (max-width: 768px) {
  .admin-shell {
    grid-template-columns: 1fr;
    gap: 12px;
    padding-top: 12px;
  }
  .admin-sidebar {
    display: none;
  }
  .mobile-nav {
    display: flex;
  }
  .admin-main-panel {
    min-height: auto;
    padding: 16px;
  }
}
</style>
