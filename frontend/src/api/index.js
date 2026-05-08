import axios from 'axios'
import { getToken, removeToken } from '../utils/auth.js'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截：带上 token
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：401 跳转登录
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/admin'
    }
    return Promise.reject(error.response?.data || { error: '网络错误' })
  }
)

// ===== 公开接口 =====
export const getAbout = () => api.get('/about')
export const getProjects = (all = false) => api.get(`/projects${all ? '?all=1' : ''}`)
export const musicRecommend = (mood) => api.post('/tools/music/recommend', { mood })

// ===== 认证接口 =====
export const login = (password) => api.post('/auth/login', { password })
export const checkAuth = () => api.get('/auth/check')
export const changePassword = (oldPassword, newPassword) =>
  api.post('/auth/change-password', { oldPassword, newPassword })

// ===== 管理接口 =====
export const updateAbout = (data) => api.put('/about', data)
export const addProject = (data) => api.post('/projects', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const getSettings = () => api.get('/settings')
export const updateSettings = (data) => api.put('/settings', data)
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
