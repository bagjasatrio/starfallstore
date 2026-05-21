import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
})

// ── Request interceptor: attach token ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('sf-auth')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch (_) {}
  }
  return config
})

// ── Response interceptor: handle 401 globally ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('sf-auth')
      window.dispatchEvent(new CustomEvent('sf:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api

// ── API helpers ────────────────────────────────────────────────────────────────

export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
}

export const productApi = {
  list:    (params) => api.get('/products', { params }),
  popular: ()       => api.get('/products/popular'),
  show:    (slug)   => api.get(`/products/${slug}`),
}

export const orderApi = {
  create:        (data) => api.post('/orders', data),
  show:          (uuid) => api.get(`/orders/${uuid}`),
  track:         (query)=> api.get(`/orders/track/${query}`),
  myOrders:      ()     => api.get('/my-orders'),
  checkNickname: (data) => api.post('/game/check-nickname', data),
}

export const leaderboardApi = {
  index: () => api.get('/leaderboard'),
}

export const adminApi = {
  stats:           ()     => api.get('/admin/stats'),
  orders:          (p)    => api.get('/admin/orders', { params: p }),
  orderShow:       (uuid) => api.get(`/admin/orders/${uuid}`),
  refund:          (uuid) => api.post(`/admin/orders/${uuid}/refund`),
  products:        ()     => api.get('/admin/products'),
  productCreate:   (d)    => api.post('/admin/products', d),
  productUpdate:   (id,d) => api.put(`/admin/products/${id}`, d),
  productDelete:   (id)   => api.delete(`/admin/products/${id}`),
  stock:           ()     => api.get('/admin/stock'),
  stockCreate:     (d)    => api.post('/admin/stock', d),
  stockDelete:     (id)   => api.delete(`/admin/stock/${id}`),
  auditLogs:       (p)    => api.get('/admin/audit-logs', { params: p }),
  orderStatus:     (uuid, status) => api.post(`/admin/orders/${uuid}/status`, { status }),

  // Account Inventory (Stok Akun)
  inventoryList:   (params) => api.get('/admin/inventory', { params }),
  inventoryCreate: (data) => api.post('/admin/inventory', data),
  inventoryUpdate: (id, data) => api.put(`/admin/inventory/${id}`, data),
  inventoryDelete: (id) => api.delete(`/admin/inventory/${id}`),

  // User Management
  usersList:       (params) => api.get('/admin/users', { params }),
  userCreate:      (data) => api.post('/admin/users', data),
  userShow:        (id) => api.get(`/admin/users/${id}`),
  userUpdate:      (id, data) => api.put(`/admin/users/${id}`, data),
  adjustBalance:   (id, data) => api.post(`/admin/users/${id}/adjust-balance`, data),
  toggleUserStatus: (id, status) => api.post(`/admin/users/${id}/toggle-status`, { status }),
  resetUserPassword: (id, password) => api.post(`/admin/users/${id}/reset-password`, { password }),

  // Finance Analytics
  finance:         () => api.get('/admin/analytics/finance'),
}
