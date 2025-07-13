import { useState, useEffect } from 'react'
import { useCarbonStore } from '../stores/carbonStore'
import { useAuthStore } from '../stores/authStore'
import { 
  TrendingDown, 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  Car,
  Utensils,
  Zap,
  ShoppingBag,
  Trash2,
  Plus
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const categoryIcons = {
  transportation: Car,
  food: Utensils,
  energy: Zap,
  shopping: ShoppingBag,
  waste: Trash2
}

const categoryColors = {
  transportation: '#3B82F6',
  food: '#10B981',
  energy: '#F59E0B',
  shopping: '#8B5CF6',
  waste: '#EF4444'
}



export default function Dashboard() {
  const { stats, activities, categoryBreakdown, emissionsBreakdown, savingsBreakdown, recentActivities, loading, fetchStats, fetchActivities } = useCarbonStore()
  const { user } = useAuthStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (user?._id) {
      console.log('Dashboard: Fetching data for user:', user._id)
      fetchStats(selectedPeriod)
      fetchActivities()
    }
  }, [selectedPeriod, fetchStats, fetchActivities, user?._id])

  // Create emissions breakdown by category
  const emissionsChartData = emissionsBreakdown.length > 0 
    ? emissionsBreakdown.map((item) => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.total,
        color: categoryColors[item._id] || '#6B7280'
      }))
    : [
        {
          name: 'No Emissions',
          value: 0,
          color: '#6B7280'
        }
      ]

  // Create savings breakdown by category
  const savingsChartData = savingsBreakdown.length > 0 
    ? savingsBreakdown.map((item) => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.total,
        color: categoryColors[item._id] || '#6B7280'
      }))
    : [
        {
          name: 'No Savings',
          value: 0,
          color: '#6B7280'
        }
      ]

  // Keep original for backward compatibility
  const pieChartData = categoryBreakdown.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.total,
    color: categoryColors[item._id] || '#6B7280'
  }))

  const getRankTitle = (rank) => {
    const titles = {
      1: 'Eco Master',
      2: 'Green Champion',
      3: 'Sustainability Expert',
      4: 'Eco Warrior',
      5: 'Green Beginner',
      6: 'Newcomer'
    }
    return titles[rank] || 'Newcomer'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-carbon-800">
            Welcome back, {user?.name || 'User'}! 🌱
          </h1>
          <p className="text-carbon-600 mt-1">
            Here's your carbon footprint overview for this {selectedPeriod}
          </p>
          {/* Debug info - remove this after testing */}
          <div className="text-xs text-gray-500 mt-2">
            User ID: {user?._id} | Activities: {activities.length} | Stats: {stats.totalEmitted.toFixed(1)}kg
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Emission Calculator</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Total Emitted</p>
              <p className="text-2xl font-bold text-carbon-800">
                {stats.totalEmitted.toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Total Saved</p>
              <p className="text-2xl font-bold text-eco-600">
                {stats.totalSaved.toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-eco-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-eco-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Net Footprint</p>
              <p className={`text-2xl font-bold ${stats.netFootprint > 0 ? 'text-red-600' : 'text-eco-600'}`}>
                {stats.netFootprint.toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>



      {/* Two Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-800 mb-6">Carbon Emissions by Category</h3>
          {emissionsBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emissionsChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}kg`}
                >
                  {emissionsChartData.map((entry, index) => (
                    <Cell key={`emissions-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-carbon-500">
              <p>No emissions recorded yet</p>
            </div>
          )}
        </div>

        {/* Savings Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-800 mb-6">Carbon Savings by Category</h3>
          {savingsBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={savingsChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}kg`}
                >
                  {savingsChartData.map((entry, index) => (
                    <Cell key={`savings-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-carbon-500">
              <p>No savings recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-carbon-800">Recent Activities</h3>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = categoryIcons[activity.category]
              return (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-carbon-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg">
                      <IconComponent className="w-5 h-5 text-carbon-600" />
                    </div>
                    <div>
                      <p className="font-medium text-carbon-800">
                        {activity.type} - {activity.category}
                      </p>
                      <p className="text-sm text-carbon-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${activity.carbonAmount > 0 ? 'text-red-600' : 'text-eco-600'}`}>
                      {activity.carbonAmount > 0 ? '+' : ''}{activity.carbonAmount.toFixed(1)} kg CO2
                    </p>
                    <p className="text-sm text-carbon-500">
                      {activity.amount} {activity.unit || 'units'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-carbon-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-carbon-300" />
            <p>No activities recorded yet.</p>
            <p className="text-sm">Start tracking your carbon footprint!</p>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="card bg-gradient-to-r from-eco-500 to-primary-500 text-white">
        <h3 className="text-lg font-semibold mb-2">💡 Quick Tip</h3>
        <p>
          Try taking public transportation instead of driving today. 
          You could save up to 2.5 kg of CO2 per trip!
        </p>
      </div>
    </div>
  )
} 