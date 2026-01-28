import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
}

// Resume APIs
export const resumeAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
  analyzeSkillGap: (data) => api.post('/resumes/analyze-skill-gap', data),
  generateRoadmap: (data) => api.post('/resumes/generate-roadmap', data),
  getRoadmap: (id) => api.get(`/resumes/roadmap/${id}`),
  updateProgress: (id, data) => api.put(`/resumes/roadmap/${id}/progress`, data),
}

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getTopSkillGaps: () => api.get('/admin/dashboard/skill-gaps'),
  getRoleAnalytics: () => api.get('/admin/dashboard/role-analytics'),
  getCommonFeedback: () => api.get('/admin/dashboard/feedback'),
  generateReport: (params) => api.get('/admin/reports/generate', { params }),
  getAllUsers: () => api.get('/admin/users'),
  getAllResumes: (params) => api.get('/admin/resumes', { params }),
}

export default api
