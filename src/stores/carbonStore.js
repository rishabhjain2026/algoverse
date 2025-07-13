import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api.js'

export const useCarbonStore = create(
  persist(
    (set, get) => ({
      // Carbon footprint data
      currentUserId: null, // Track current user
      activities: [],
      stats: {
        totalEmitted: 0,
        totalSaved: 0,
        netFootprint: 0,
        rank: 6,
        points: 0,
        tier: 'Bronze'
      },
      categoryBreakdown: [],
      emissionsBreakdown: [],
      savingsBreakdown: [],
      recentActivities: [],
      loading: false,
      error: null,
      
      // Carbon emission factors (kg CO2e)
      emissionFactors: {
        transportation: {
          car: 0.2, // per km
          bus: 0.05, // per km
          train: 0.04, // per km
          plane: 0.25, // per km
          bike: 0, // per km
          walk: 0 // per km
        },
        food: {
          beef: 13.3, // per kg
          chicken: 2.9, // per kg
          fish: 3.0, // per kg
          vegetables: 0.2, // per kg
          fruits: 0.3, // per kg
          dairy: 1.4, // per kg
          grains: 0.5 // per kg
        },
        energy: {
          electricity: 0.5, // per kWh
          naturalGas: 2.0, // per m3
          heating: 2.5 // per kWh
        },
        shopping: {
          clothing: 23.0, // per item
          electronics: 400.0, // per item
          furniture: 100.0, // per item
          books: 2.5 // per item
        },
        waste: {
          general: 0.5, // per kg
          recyclable: 0.1, // per kg
          compost: 0.05 // per kg
        }
      },
      
      // Actions
      addActivity: async (activityData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.addActivity(activityData)
          await get().fetchStats()
          await get().fetchActivities()
          set({ loading: false })
          return { success: true, data: response.data.activity }
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message 
          })
          return { success: false, error: error.message }
        }
      },
      
      fetchActivities: async (params = {}) => {
        set({ loading: true, error: null })
        try {
          const response = await api.getActivities(params)
          set({
            activities: response.data.activities,
            loading: false
          })
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message 
          })
        }
      },
      
      fetchStats: async (period = 'all') => {
        set({ loading: true, error: null })
        try {
          console.log('CarbonStore: Fetching stats for period:', period)
          const response = await api.getStats(period)
          const { stats, categoryBreakdown, emissionsBreakdown, savingsBreakdown, recentActivities } = response.data
          
          console.log('CarbonStore: Received stats:', stats)
          console.log('CarbonStore: Received activities count:', recentActivities?.length || 0)
          
          set({
            stats: stats || {
              totalEmitted: 0,
              totalSaved: 0,
              netFootprint: 0,
              rank: 6,
              points: 0,
              tier: 'Bronze'
            },
            categoryBreakdown: categoryBreakdown || [],
            emissionsBreakdown: emissionsBreakdown || [],
            savingsBreakdown: savingsBreakdown || [],
            recentActivities: recentActivities || [],
            loading: false
          })
        } catch (error) {
          console.error('CarbonStore: Error fetching stats:', error)
          set({ 
            loading: false, 
            error: error.message 
          })
        }
      },
      
      deleteActivity: async (activityId) => {
        set({ loading: true, error: null })
        try {
          await api.deleteActivity(activityId)
          await get().fetchStats()
          await get().fetchActivities()
          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message 
          })
          return { success: false, error: error.message }
        }
      },
      
      fetchEmissionFactors: async () => {
        try {
          const response = await api.getEmissionFactors()
          set({
            emissionFactors: response.data.emissionFactors
          })
        } catch (error) {
          console.error('Error fetching emission factors:', error)
        }
      },
      
      clearError: () => {
        set({ error: null })
      },
      
      resetData: () => {
        set({
          currentUserId: null,
          activities: [],
          stats: {
            totalEmitted: 0,
            totalSaved: 0,
            netFootprint: 0,
            rank: 6,
            points: 0,
            tier: 'Bronze'
          },
          categoryBreakdown: [],
          recentActivities: [],
          loading: false,
          error: null
        })
      },
      
      setCurrentUser: (userId) => {
        const state = get()
        console.log('CarbonStore: Setting current user from', state.currentUserId, 'to', userId)
        // If user is different, clear all data
        if (state.currentUserId !== userId) {
          console.log('CarbonStore: Clearing data for user switch')
          // Clear localStorage for carbon store
          localStorage.removeItem('carbon-storage')
          set({
            currentUserId: userId,
            activities: [],
            stats: {
              totalEmitted: 0,
              totalSaved: 0,
              netFootprint: 0,
              rank: 6,
              points: 0,
              tier: 'Bronze'
            },
            categoryBreakdown: [],
            recentActivities: [],
            loading: false,
            error: null
          })
        }
      }
    }),
    {
      name: 'carbon-storage',
      partialize: (state) => ({
        emissionFactors: state.emissionFactors
      })
    }
  )
)

// Helper functions
function calculateCarbonAmount(category, entry, factors) {
  const categoryFactors = factors[category]
  if (!categoryFactors) return 0
  
  const factor = categoryFactors[entry.type] || 0
  return factor * (entry.amount || 1)
}

function calculateStats(carbonData) {
  let totalEmitted = 0
  let totalSaved = 0
  
  Object.values(carbonData).forEach(category => {
    category.forEach(entry => {
      if (entry.carbonAmount > 0) {
        totalEmitted += entry.carbonAmount
      } else {
        totalSaved += Math.abs(entry.carbonAmount)
      }
    })
  })
  
  const netFootprint = totalEmitted - totalSaved
  const points = Math.floor(totalSaved * 10) // 10 points per kg saved
  
  return {
    totalEmitted,
    totalSaved,
    netFootprint,
    points,
    rank: calculateRank(points),
    streak: 0 // This would be calculated based on daily activity
  }
}

function calculateRank(points) {
  if (points >= 1000) return 1
  if (points >= 500) return 2
  if (points >= 250) return 3
  if (points >= 100) return 4
  if (points >= 50) return 5
  return 6
} 