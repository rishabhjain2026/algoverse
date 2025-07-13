import { useState, useEffect } from 'react'
import { useCarbonStore } from '../stores/carbonStore'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api.js'
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Award,
  Star,
  Target
} from 'lucide-react'

// Mock leaderboard data
const mockLeaderboard = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rank: 1,
    points: 1250,
    carbonSaved: 125.0,
    avatar: 'SJ',
    badge: 'Eco Master',
    streak: 45
  },
  {
    id: 2,
    name: 'Mike Chen',
    rank: 2,
    points: 980,
    carbonSaved: 98.0,
    avatar: 'MC',
    badge: 'Green Champion',
    streak: 32
  },
  {
    id: 3,
    name: 'Emma Davis',
    rank: 3,
    points: 845,
    carbonSaved: 84.5,
    avatar: 'ED',
    badge: 'Sustainability Expert',
    streak: 28
  },
  {
    id: 4,
    name: 'Alex Rodriguez',
    rank: 4,
    points: 720,
    carbonSaved: 72.0,
    avatar: 'AR',
    badge: 'Eco Warrior',
    streak: 21
  },
  {
    id: 5,
    name: 'Lisa Wang',
    rank: 5,
    points: 650,
    carbonSaved: 65.0,
    avatar: 'LW',
    badge: 'Green Beginner',
    streak: 18
  },
  {
    id: 6,
    name: 'David Kim',
    rank: 6,
    points: 580,
    carbonSaved: 58.0,
    avatar: 'DK',
    badge: 'Green Beginner',
    streak: 15
  },
  {
    id: 7,
    name: 'Maria Garcia',
    rank: 7,
    points: 520,
    carbonSaved: 52.0,
    avatar: 'MG',
    badge: 'Green Beginner',
    streak: 12
  },
  {
    id: 8,
    name: 'James Wilson',
    rank: 8,
    points: 480,
    carbonSaved: 48.0,
    avatar: 'JW',
    badge: 'Green Beginner',
    streak: 10
  },
  {
    id: 9,
    name: 'Anna Thompson',
    rank: 9,
    points: 420,
    carbonSaved: 42.0,
    avatar: 'AT',
    badge: 'Green Beginner',
    streak: 8
  },
  {
    id: 10,
    name: 'Chris Lee',
    rank: 10,
    points: 380,
    carbonSaved: 38.0,
    avatar: 'CL',
    badge: 'Green Beginner',
    streak: 6
  }
]

const rankIcons = {
  1: Crown,
  2: Medal,
  3: Trophy
}

const rankColors = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600'
}

export default function Rankings() {
  const { stats } = useCarbonStore()
  const { user } = useAuthStore()
  const [selectedPeriod, setSelectedPeriod] = useState('all-time')
  const [selectedCategory, setSelectedCategory] = useState('overall')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await api.getLeaderboard({
          period: selectedPeriod,
          category: selectedCategory
        })
        setLeaderboard(response.data.leaderboard || [])
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError(error.message)
        // Fallback to mock data if API fails
        setLeaderboard(mockLeaderboard)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedPeriod, selectedCategory])

  // Find current user in leaderboard
  const currentUserRank = leaderboard.find(entry => entry.name === user?.name) || {
    rank: stats.rank,
    points: stats.points,
    carbonSaved: stats.totalSaved,
    badge: getBadgeByPoints(stats.points)
  }

  const getBadgeByPoints = (points) => {
    if (points >= 1000) return 'Eco Master'
    if (points >= 500) return 'Green Champion'
    if (points >= 250) return 'Sustainability Expert'
    if (points >= 100) return 'Eco Warrior'
    if (points >= 50) return 'Green Beginner'
    return 'Newcomer'
  }

  const getRankIcon = (rank) => {
    const IconComponent = rankIcons[rank]
    return IconComponent ? <IconComponent className={`w-6 h-6 ${rankColors[rank]}`} /> : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-carbon-800 mb-2">
          Leaderboard & Rankings
        </h1>
        <p className="text-carbon-600">
          See how you rank among eco-conscious individuals
        </p>
      </div>

      {/* Current User Stats */}
      <div className="card bg-gradient-to-r from-primary-500 to-eco-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user?.name || 'You'}
              </h3>
              <p className="text-white text-opacity-90">
                {currentUserRank.badge}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              #{currentUserRank.rank}
            </div>
            <div className="text-sm text-white text-opacity-90">
              {currentUserRank.points} points
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="all-time">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="overall">Overall</option>
              <option value="transportation">Transportation</option>
              <option value="food">Food & Diet</option>
              <option value="energy">Energy</option>
              <option value="shopping">Shopping</option>
              <option value="waste">Waste</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-carbon-800">
            Top Eco Warriors
          </h3>
          <div className="flex items-center space-x-2 text-sm text-carbon-500">
            <TrendingUp className="w-4 h-4" />
            <span>Updated daily</span>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-carbon-600">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading leaderboard: {error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-carbon-600">No data available yet.</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                entry.name === user?.name
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-carbon-100 hover:border-carbon-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRankIcon(entry.rank)}
                  <span className="text-lg font-bold text-carbon-800 min-w-[2rem]">
                    #{entry.rank}
                  </span>
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-eco-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {entry.avatar}
                </div>
                
                <div>
                  <p className="font-medium text-carbon-800">
                    {entry.name}
                    {entry.name === user?.name && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-carbon-500">
                    {entry.badge} • {entry.streak} day streak
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-carbon-800">
                  {entry.points} pts
                </p>
                <p className="text-sm text-eco-600">
                  {entry.carbonSaved} kg saved
                </p>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Achievement System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-800 mb-4">
            Your Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-eco-50 rounded-lg">
              <Award className="w-6 h-6 text-eco-600" />
              <div>
                <p className="font-medium text-carbon-800">First Steps</p>
                <p className="text-sm text-carbon-500">Started your eco journey</p>
              </div>
            </div>
            
            {stats.points >= 50 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-carbon-800">Green Beginner</p>
                  <p className="text-sm text-carbon-500">Earned 50+ points</p>
                </div>
              </div>
            )}
            
            {stats.points >= 100 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-carbon-800">Eco Warrior</p>
                  <p className="text-sm text-carbon-500">Earned 100+ points</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-800 mb-4">
            Next Milestones
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-carbon-50 rounded-lg">
              <div>
                <p className="font-medium text-carbon-800">Sustainability Expert</p>
                <p className="text-sm text-carbon-500">250 points needed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-carbon-600">
                  {Math.max(0, 250 - stats.points)} to go
                </p>
                <div className="w-20 h-2 bg-carbon-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-primary-500 rounded-full"
                    style={{ width: `${Math.min(100, (stats.points / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-carbon-50 rounded-lg">
              <div>
                <p className="font-medium text-carbon-800">Green Champion</p>
                <p className="text-sm text-carbon-500">500 points needed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-carbon-600">
                  {Math.max(0, 500 - stats.points)} to go
                </p>
                <div className="w-20 h-2 bg-carbon-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-eco-500 rounded-full"
                    style={{ width: `${Math.min(100, (stats.points / 500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="card bg-gradient-to-r from-carbon-600 to-carbon-800 text-white">
        <h3 className="text-lg font-semibold mb-4">Community Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">10,247</p>
            <p className="text-sm text-carbon-300">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">1,234,567</p>
            <p className="text-sm text-carbon-300">kg CO2 Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">$45,678</p>
            <p className="text-sm text-carbon-300">Rewards Given</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-carbon-300">Trees Planted</p>
          </div>
        </div>
      </div>
    </div>
  )
} 