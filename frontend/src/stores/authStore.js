import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (_) {}
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('sf-token')
      },

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'sf-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
