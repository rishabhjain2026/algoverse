import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api.js'
import { useCarbonStore } from './carbonStore.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,
      
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          // ✅ Directly get response object (not response.data)
          const { user, token } = await api.login(credentials)

          localStorage.setItem('token', token)

          // Set current user in carbon store and force refresh
          const carbonStore = useCarbonStore.getState()
          carbonStore.setCurrentUser(user._id)
          setTimeout(() => {
            carbonStore.fetchStats()
            carbonStore.fetchActivities()
          }, 100)

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })

          return { success: true }
        } catch (error) {
          set({
            error: error.message,
            loading: false
          })
          return { success: false, error: error.message }
        }
      },
      
      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          // ✅ Directly get response object (not response.data)
          const { user, token } = await api.register(userData)

          localStorage.setItem('token', token)

          // Set current user in carbon store and force refresh
          const carbonStore = useCarbonStore.getState()
          carbonStore.setCurrentUser(user._id)
          setTimeout(() => {
            carbonStore.fetchStats()
            carbonStore.fetchActivities()
          }, 100)

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })

          return { success: true }
        } catch (error) {
          set({
            error: error.message,
            loading: false
          })
          return { success: false, error: error.message }
        }
      },
      
      logout: () => {
        localStorage.removeItem('token')
        // Clear carbon data on logout
        useCarbonStore.getState().resetData()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },
      
      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates }
        }))
      },
      
      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false })
          useCarbonStore.getState().resetData()
          return false
        }
        
        try {
          // ✅ Directly get user object (not response.data.user)
          const { user } = await api.getCurrentUser()

          const carbonStore = useCarbonStore.getState()
          carbonStore.setCurrentUser(user._id)
          setTimeout(() => {
            carbonStore.fetchStats()
            carbonStore.fetchActivities()
          }, 100)

          set({
            user,
            token,
            isAuthenticated: true
          })
          return true
        } catch (error) {
          localStorage.removeItem('token')
          useCarbonStore.getState().resetData()
          set({
            user: null,
            token: null,
            isAuthenticated: false
          })
          return false
        }
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
)
