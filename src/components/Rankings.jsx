import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useCarbonStore } from '../stores/carbonStore'
import api from '../services/api.js'
import { 
  Trophy, 
  Award, 
  Users, 
  Target, 
  TrendingUp,
  Star,
  Crown,
  Medal,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

// Mock leaderboard data for fallback
const mockLeaderboard = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rank: 1,
    points: 1250,
    carbonSaved: 125.0,
    avatar: 'SJ',
    badge: 'Eco Master',
    streak: 45,
    tier: 'Diamond'
  },
  {
    id: 2,
    name: 'Mike Chen',
    rank: 2,
    points: 980,
    carbonSaved: 98.0,
    avatar: 'MC',
    badge: 'Green Champion',
    streak: 32,
    tier: 'Platinum'
  },
  {
    id: 3,
    name: 'Emma Davis',
    rank: 3,
    points: 850,
    carbonSaved: 85.0,
    avatar: 'ED',
    badge: 'Sustainability Expert',
    streak: 28,
    tier: 'Gold'
  },
  {
    id: 4,
    name: 'Alex Rodriguez',
    rank: 4,
    points: 720,
    carbonSaved: 72.0,
    avatar: 'AR',
    badge: 'Eco Warrior',
    streak: 21,
    tier: 'Silver'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    rank: 5,
    points: 650,
    carbonSaved: 65.0,
    avatar: 'LW',
    badge: 'Green Beginner',
    streak: 18,
    tier: 'Bronze'
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

const tierColors = {
  'Diamond': 'text-purple-600',
  'Platinum': 'text-gray-600',
  'Gold': 'text-yellow-600',
  'Silver': 'text-gray-500',
  'Bronze': 'text-orange-600'
}

export default function Rankings() {
  const { stats } = useCarbonStore()
  const { user } = useAuthStore()
  const [selectedPeriod, setSelectedPeriod] = useState('all-time')
  const [selectedCategory, setSelectedCategory] = useState('overall')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('points')

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching leaderboard...')
        const response = await api.getLeaderboard({
          period: selectedPeriod,
          category: selectedCategory
        })
        console.log('Leaderboard response:', response)
        setLeaderboard(response.data.leaderboard || [])
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError(error.message)
        // Fallback to mock data if API fails
        console.log('Using mock data as fallback')
        setLeaderboard(mockLeaderboard)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedPeriod, selectedCategory])

  const getBadgeByPoints = (points) => {
    if (points >= 1000) return 'Eco Master'
    if (points >= 500) return 'Green Champion'
    if (points >= 250) return 'Sustainability Expert'
    if (points >= 100) return 'Eco Warrior'
    if (points >= 50) return 'Green Beginner'
    return 'Newcomer'
  }

  const getTierByPoints = (points) => {
    if (points >= 1000) return 'Diamond'
    if (points >= 500) return 'Platinum'
    if (points >= 250) return 'Gold'
    if (points >= 100) return 'Silver'
    return 'Bronze'
  }

  // Find current user in leaderboard
  console.log('Current user:', user?.name)
  console.log('Leaderboard:', leaderboard)
  console.log('User stats:', stats)
  
  const currentUserRank = leaderboard.find(entry => entry.name === user?.name) || {
    rank: stats.rank,
    points: stats.points,
    carbonSaved: stats.totalSaved,
    badge: getBadgeByPoints(stats.points),
    tier: getTierByPoints(stats.points)
  }
  
  console.log('Current user rank:', currentUserRank)

  const getRankIcon = (rank) => {
    const IconComponent = rankIcons[rank]
    return IconComponent ? <IconComponent className={`w-6 h-6 ${rankColors[rank]}`} /> : null
  }

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'points':
        return b.points - a.points
      case 'carbonSaved':
        return b.carbonSaved - a.carbonSaved
      case 'streak':
        return b.streak - a.streak
      default:
        return a.rank - b.rank
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-carbon-800 mb-2 flex items-center justify-center">
          <Trophy className="w-10 h-10 mr-3 text-yellow-600" />
          Leaderboard & Rankings
        </h1>
        <p className="text-carbon-600 text-lg">
          See how you rank among eco-conscious individuals
        </p>
      </div>

      {/* Current User Stats Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-eco-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {user?.name || 'You'}
              </h3>
              <p className="text-white text-opacity-90 text-lg">
                {currentUserRank.badge} • {currentUserRank.tier} Tier
              </p>
              <p className="text-white text-opacity-80">
                {currentUserRank.streak || 0} day streak
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              #{currentUserRank.rank}
            </div>
            <div className="text-lg text-white text-opacity-90">
              {currentUserRank.points} points
            </div>
            <div className="text-sm text-white text-opacity-80">
              {currentUserRank.carbonSaved?.toFixed(1) || stats.totalSaved.toFixed(1)} kg saved
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-carbon-600" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all-time">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-carbon-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-auto"
              >
                <option value="overall">Overall</option>
                <option value="transportation">Transportation</option>
                <option value="food">Food</option>
                <option value="energy">Energy</option>
                <option value="shopping">Shopping</option>
                <option value="waste">Waste</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-carbon-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto"
            >
              <option value="rank">Rank</option>
              <option value="points">Points</option>
              <option value="carbonSaved">CO₂ Saved</option>
              <option value="streak">Streak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-carbon-800 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
            Top Eco Warriors
          </h2>
          <div className="text-sm text-carbon-600">
            {leaderboard.length} participants
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Error loading leaderboard</p>
            <p className="text-sm text-carbon-500">Showing sample data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLeaderboard.map((entry, index) => (
              <div key={entry.id || index} className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                entry.name === user?.name 
                  ? 'bg-gradient-to-r from-primary-50 to-eco-50 border-primary-300 shadow-lg' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                      <span className={`text-xl font-bold min-w-[3rem] ${
                        entry.rank === 1 ? 'text-yellow-600' :
                        entry.rank === 2 ? 'text-gray-500' :
                        entry.rank === 3 ? 'text-amber-600' :
                        'text-carbon-600'
                      }`}>
                        #{entry.rank}
                      </span>
                    </div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-eco-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {entry.avatar}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-carbon-800 text-lg">
                          {entry.name}
                        </p>
                        {entry.name === user?.name && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-carbon-600">
                        <span className="flex items-center space-x-1">
                          <Award className="w-3 h-3" />
                          <span>{entry.badge}</span>
                        </span>
                        <span className={`font-medium ${tierColors[entry.tier]}`}>
                          {entry.tier}
                        </span>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{entry.streak} day streak</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-bold text-carbon-800 text-lg">
                          {entry.points} pts
                        </p>
                        <p className="text-sm text-eco-600">
                          {entry.carbonSaved?.toFixed(1) || '0.0'} kg saved
                        </p>
                      </div>
                      {sortBy === 'points' && (
                        <div className="flex flex-col items-center">
                          {index > 0 && entry.points < sortedLeaderboard[index - 1].points && (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          )}
                          {index < sortedLeaderboard.length - 1 && entry.points > sortedLeaderboard[index + 1].points && (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold text-carbon-800 mb-6 flex items-center">
            <Award className="w-6 h-6 mr-2 text-yellow-600" />
            Your Achievements
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-eco-50 rounded-lg border border-eco-200">
              <div className="w-12 h-12 bg-eco-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-eco-600" />
              </div>
              <div>
                <p className="font-semibold text-carbon-800">First Steps</p>
                <p className="text-sm text-carbon-600">Started your eco journey</p>
                <p className="text-xs text-eco-600">Unlocked immediately</p>
              </div>
            </div>
            
            {stats.points >= 50 && (
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-carbon-800">Green Beginner</p>
                  <p className="text-sm text-carbon-600">Earned 50+ points</p>
                  <p className="text-xs text-yellow-600">Unlocked at 50 points</p>
                </div>
              </div>
            )}
            
            {stats.points >= 100 && (
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-carbon-800">Eco Warrior</p>
                  <p className="text-sm text-carbon-600">Earned 100+ points</p>
                  <p className="text-xs text-blue-600">Unlocked at 100 points</p>
                </div>
              </div>
            )}

            {stats.points >= 250 && (
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-carbon-800">Sustainability Expert</p>
                  <p className="text-sm text-carbon-600">Earned 250+ points</p>
                  <p className="text-xs text-purple-600">Unlocked at 250 points</p>
                </div>
              </div>
            )}

            {stats.points >= 500 && (
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-carbon-800">Green Champion</p>
                  <p className="text-sm text-carbon-600">Earned 500+ points</p>
                  <p className="text-xs text-green-600">Unlocked at 500 points</p>
                </div>
              </div>
            )}

            {stats.points >= 1000 && (
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-300">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-carbon-800">Eco Master</p>
                  <p className="text-sm text-carbon-600">Earned 1000+ points</p>
                  <p className="text-xs text-yellow-600">Unlocked at 1000 points</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-carbon-800 mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-600" />
            Next Milestones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-carbon-50 rounded-lg border border-carbon-200">
              <div>
                <p className="font-semibold text-carbon-800">Sustainability Expert</p>
                <p className="text-sm text-carbon-600">250 points needed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-carbon-600">
                  {Math.max(0, 250 - stats.points)} to go
                </p>
                <div className="w-24 h-2 bg-carbon-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.points / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-carbon-50 rounded-lg border border-carbon-200">
              <div>
                <p className="font-semibold text-carbon-800">Green Champion</p>
                <p className="text-sm text-carbon-600">500 points needed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-carbon-600">
                  {Math.max(0, 500 - stats.points)} to go
                </p>
                <div className="w-24 h-2 bg-carbon-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-eco-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.points / 500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-carbon-50 rounded-lg border border-carbon-200">
              <div>
                <p className="font-semibold text-carbon-800">Eco Master</p>
                <p className="text-sm text-carbon-600">1000 points needed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-carbon-600">
                  {Math.max(0, 1000 - stats.points)} to go
                </p>
                <div className="w-24 h-2 bg-carbon-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.points / 1000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-carbon-800 mb-6">Community Impact</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">1,247</div>
              <div className="text-sm text-carbon-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">12,450</div>
              <div className="text-sm text-carbon-600">kg CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">$8,920</div>
              <div className="text-sm text-carbon-600">Rewards Given</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">4.8★</div>
              <div className="text-sm text-carbon-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 