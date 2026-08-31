import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../utils/auth.js'
import { trackVisit } from '../api/index.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('../views/Tools.vue')
  },
  {
    path: '/tools/music',
    name: 'MusicTool',
    component: () => import('../views/tools/MusicTool.vue')
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/about'
      },
      {
        path: '/admin/about',
        name: 'AboutEdit',
        component: () => import('../views/admin/AboutEdit.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/projects',
        name: 'ProjectManage',
        component: () => import('../views/admin/ProjectManage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/settings',
        name: 'Settings',
        component: () => import('../views/admin/Settings.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/password',
        name: 'ChangePassword',
        component: () => import('../views/admin/ChangePassword.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/visits',
        name: 'VisitMonitor',
        component: () => import('../views/admin/VisitMonitor.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = getToken()
    if (!token) {
      next('/admin')
    } else {
      next()
    }
  } else {
    next()
  }
})

// 访问埋点：公开页面切换时上报（后台页面不上报）
router.afterEach((to) => {
  if (!to.path.startsWith('/admin')) {
    trackVisit(to.fullPath, document.referrer || '').catch(() => {})
  }
})

export default router
