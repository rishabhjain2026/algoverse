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
          const response = await api.login(credentials)
          console.log("🔍 Login Response:", response)

          // ✅ Handle both possible response structures
          const user = response.user || response.data?.user
          const token = response.token || response.data?.token

          if (!user || !token) {
            throw new Error("Invalid login response from server")
          }

          localStorage.setItem('token', token)

          const carbonStore = useCarbonStore.getState()
          if (user._id) {
            carbonStore.setCurrentUser(user._id)
          }

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
          console.error("❌ Login Error:", error)
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
          const response = await api.register(userData)
          console.log("🔍 Register Response:", response)

          // ✅ Handle both possible response structures
          const user = response.user || response.data?.user
          const token = response.token || response.data?.token

          if (!user || !token) {
            throw new Error("Invalid register response from server")
          }

          localStorage.setItem('token', token)

          const carbonStore = useCarbonStore.getState()
          if (user._id) {
            carbonStore.setCurrentUser(user._id)
          }

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
          console.error("❌ Register Error:", error)
          set({
            error: error.message,
            loading: false
          })
          return { success: false, error: error.message }
        }
      },
      
      logout: () => {
        localStorage.removeItem('token')
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
          const response = await api.getCurrentUser()
          console.log("🔍 CheckAuth Response:", response)

          // ✅ Handle both possible response structures
          const user = response.user || response.data?.user

          if (!user) {
            throw new Error("Invalid user data from server")
          }

          const carbonStore = useCarbonStore.getState()
          if (user._id) {
            carbonStore.setCurrentUser(user._id)
          }

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
          console.error("❌ CheckAuth Error:", error)
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
