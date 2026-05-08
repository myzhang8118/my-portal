<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="container admin-header-inner">
        <h1 class="admin-logo"><span class="admin-logo__mark" aria-hidden="true" />后台</h1>
        <nav class="admin-nav">
          <router-link to="/admin/about" class="nav-item" active-class="nav-active">关于我</router-link>
          <router-link to="/admin/projects" class="nav-item" active-class="nav-active">项目管理</router-link>
          <router-link to="/admin/settings" class="nav-item" active-class="nav-active">系统配置</router-link>
          <router-link to="/admin/password" class="nav-item" active-class="nav-active">修改密码</router-link>
        </nav>
        <div class="admin-actions">
          <router-link to="/" class="btn btn-outline btn-sm">查看网站</router-link>
          <button class="btn btn-sm btn-danger" type="button" @click="handleLogout">退出</button>
        </div>
      </div>
    </header>

    <nav class="mobile-nav container">
      <router-link to="/admin/about" class="mobile-nav-item" active-class="nav-active">关于我</router-link>
      <router-link to="/admin/projects" class="mobile-nav-item" active-class="nav-active">项目</router-link>
      <router-link to="/admin/settings" class="mobile-nav-item" active-class="nav-active">配置</router-link>
      <router-link to="/admin/password" class="mobile-nav-item" active-class="nav-active">密码</router-link>
    </nav>

    <main class="admin-main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { removeToken } from '../../utils/auth.js'

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
  background: rgba(12, 14, 18, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-header-inner {
  display: flex;
  align-items: center;
  height: 60px;
  gap: 30px;
}

.admin-logo {
  font-size: 17px;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.admin-logo__mark {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(94, 234, 212, 0.5);
}

.admin-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-item {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-item:hover {
  background: var(--primary-bg);
  color: var(--primary);
}

.nav-active {
  background: var(--primary-bg);
  color: var(--primary);
}

.admin-actions {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.mobile-nav {
  display: none;
  overflow-x: auto;
  padding: 10px 20px;
  gap: 6px;
  background: rgba(12, 14, 18, 0.92);
  border-bottom: 1px solid var(--border);
}

.mobile-nav-item {
  padding: 6px 14px;
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
  font-weight: 500;
}

.admin-main {
  padding: 30px 0;
}

@media (max-width: 768px) {
  .admin-nav {
    display: none;
  }
  .mobile-nav {
    display: flex;
  }
  .admin-logo {
    font-size: 15px;
  }
}
</style>
