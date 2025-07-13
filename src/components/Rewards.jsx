import { useState } from 'react'
import { useCarbonStore } from '../stores/carbonStore'
import { useAuthStore } from '../stores/authStore'
import { 
  Gift, 
  DollarSign, 
  CreditCard, 
  ShoppingBag, 
  Coffee, 
  TreePine,
  Star,
  TrendingUp,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react'

const availableRewards = [
  {
    id: 1,
    name: 'Coffee Shop Voucher',
    description: 'Get $5 off your next coffee purchase',
    points: 50,
    value: 5,
    icon: Coffee,
    category: 'food',
    available: true
  },
  {
    id: 2,
    name: 'Eco-Friendly Store Credit',
    description: '$10 credit for sustainable products',
    points: 100,
    value: 10,
    icon: ShoppingBag,
    category: 'shopping',
    available: true
  },
  {
    id: 3,
    name: 'Tree Planting Certificate',
    description: 'We\'ll plant a tree in your name',
    points: 75,
    value: 15,
    icon: TreePine,
    category: 'environment',
    available: true
  },
  {
    id: 4,
    name: 'Renewable Energy Credit',
    description: '$20 credit towards green energy',
    points: 200,
    value: 20,
    icon: Zap,
    category: 'energy',
    available: true
  },
  {
    id: 5,
    name: 'Premium Eco Badge',
    description: 'Exclusive badge for your profile',
    points: 150,
    value: 25,
    icon: Award,
    category: 'achievement',
    available: true
  },
  {
    id: 6,
    name: 'Carbon Offset Certificate',
    description: 'Official certificate for 100kg CO2 offset',
    points: 300,
    value: 30,
    icon: Star,
    category: 'environment',
    available: true
  }
]

const cashbackTiers = [
  {
    tier: 'Bronze',
    minPoints: 0,
    maxPoints: 99,
    cashbackRate: 0.5,
    color: 'amber'
  },
  {
    tier: 'Silver',
    minPoints: 100,
    maxPoints: 249,
    cashbackRate: 1.0,
    color: 'gray'
  },
  {
    tier: 'Gold',
    minPoints: 250,
    maxPoints: 499,
    cashbackRate: 1.5,
    color: 'yellow'
  },
  {
    tier: 'Platinum',
    minPoints: 500,
    maxPoints: 999,
    cashbackRate: 2.0,
    color: 'blue'
  },
  {
    tier: 'Diamond',
    minPoints: 1000,
    maxPoints: Infinity,
    cashbackRate: 3.0,
    color: 'purple'
  }
]

export default function Rewards() {
  const { stats } = useCarbonStore()
  const { user } = useAuthStore()
  const [selectedReward, setSelectedReward] = useState(null)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [redeemedRewards, setRedeemedRewards] = useState([])

  const currentTier = cashbackTiers.find(tier => 
    stats.points >= tier.minPoints && stats.points <= tier.maxPoints
  ) || cashbackTiers[0]

  const nextTier = cashbackTiers.find(tier => tier.minPoints > stats.points)

  const totalCashbackEarned = (stats.totalSaved * currentTier.cashbackRate) / 100
  const availableCashback = totalCashbackEarned - redeemedRewards.reduce((sum, reward) => sum + reward.value, 0)

  const handleRedeemReward = (reward) => {
    if (stats.points >= reward.points) {
      setSelectedReward(reward)
      setShowRedeemModal(true)
    }
  }

  const confirmRedeem = () => {
    if (selectedReward) {
      setRedeemedRewards(prev => [...prev, {
        ...selectedReward,
        redeemedAt: new Date().toISOString(),
        id: Date.now()
      }])
      setShowRedeemModal(false)
      setSelectedReward(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-carbon-800 mb-2">
          Rewards & Cashback
        </h1>
        <p className="text-carbon-600">
          Earn rewards for your sustainable choices
        </p>
      </div>

      {/* Points and Cashback Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Your Points</p>
              <p className="text-2xl font-bold text-primary-600">
                {stats.points}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Star className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Available Cashback</p>
              <p className="text-2xl font-bold text-eco-600">
                ${availableCashback.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-eco-100 rounded-full">
              <DollarSign className="w-6 h-6 text-eco-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Current Tier</p>
              <p className="text-2xl font-bold text-carbon-800">
                {currentTier.tier}
              </p>
              <p className="text-sm text-carbon-500">
                {currentTier.cashbackRate}% cashback
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cashback System */}
      <div className="card">
        <h3 className="text-lg font-semibold text-carbon-800 mb-4">
          Cashback System
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-eco-500 to-primary-500 text-white rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Total Cashback Earned</p>
                <p className="text-2xl font-bold">${totalCashbackEarned.toFixed(2)}</p>
                <p className="text-sm opacity-90">
                  Based on {stats.totalSaved.toFixed(1)}kg CO2 saved
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Current Rate</p>
                <p className="text-xl font-bold">{currentTier.cashbackRate}%</p>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-carbon-700">
                Progress to {nextTier?.tier || 'Max Tier'}
              </span>
              <span className="text-sm text-carbon-500">
                {stats.points} / {nextTier?.minPoints || '∞'} points
              </span>
            </div>
            <div className="w-full bg-carbon-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-eco-500 to-primary-500 h-2 rounded-full transition-all"
                style={{ 
                  width: `${nextTier ? Math.min(100, (stats.points / nextTier.minPoints) * 100) : 100}%` 
                }}
              />
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {cashbackTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`p-3 rounded-lg border-2 ${
                  tier.tier === currentTier.tier
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-carbon-200'
                }`}
              >
                <div className="text-center">
                  <p className={`font-semibold ${
                    tier.tier === currentTier.tier ? 'text-primary-700' : 'text-carbon-700'
                  }`}>
                    {tier.tier}
                  </p>
                  <p className="text-sm text-carbon-500">{tier.cashbackRate}%</p>
                  <p className="text-xs text-carbon-400">
                    {tier.minPoints}+ pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="card">
        <h3 className="text-lg font-semibold text-carbon-800 mb-4">
          Available Rewards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRewards.map((reward) => {
            const IconComponent = reward.icon
            const canRedeem = stats.points >= reward.points
            return (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  canRedeem
                    ? 'border-carbon-200 hover:border-primary-300 cursor-pointer'
                    : 'border-carbon-100 opacity-50'
                }`}
                onClick={() => canRedeem && handleRedeemReward(reward)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <IconComponent className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-carbon-600">
                      {reward.points} pts
                    </p>
                    <p className="text-lg font-bold text-eco-600">
                      ${reward.value}
                    </p>
                  </div>
                </div>
                <h4 className="font-semibold text-carbon-800 mb-1">
                  {reward.name}
                </h4>
                <p className="text-sm text-carbon-600 mb-3">
                  {reward.description}
                </p>
                <button
                  disabled={!canRedeem}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    canRedeem
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-carbon-200 text-carbon-500 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? 'Redeem Now' : 'Not Enough Points'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Redeemed Rewards */}
      {redeemedRewards.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-800 mb-4">
            Redeemed Rewards
          </h3>
          <div className="space-y-3">
            {redeemedRewards.map((reward) => {
              const IconComponent = reward.icon
              return (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-eco-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-eco-100 rounded-lg">
                      <IconComponent className="w-4 h-4 text-eco-600" />
                    </div>
                    <div>
                      <p className="font-medium text-carbon-800">{reward.name}</p>
                      <p className="text-sm text-carbon-500">
                        Redeemed on {new Date(reward.redeemedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-eco-600" />
                    <span className="text-sm font-medium text-eco-600">
                      ${reward.value}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-carbon-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-carbon-800 mb-4">
              Redeem Reward
            </h3>
            <div className="mb-6">
              <p className="text-carbon-600 mb-2">
                Are you sure you want to redeem:
              </p>
              <div className="p-4 bg-carbon-50 rounded-lg">
                <h4 className="font-semibold text-carbon-800">{selectedReward.name}</h4>
                <p className="text-sm text-carbon-600">{selectedReward.description}</p>
                <p className="text-sm font-medium text-carbon-700 mt-2">
                  Cost: {selectedReward.points} points
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 btn-primary"
              >
                Confirm Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-carbon-800 mb-2">
          💡 How to Earn More Rewards
        </h3>
        <ul className="text-sm text-carbon-600 space-y-1">
          <li>• Track your daily activities consistently</li>
          <li>• Choose sustainable transportation options</li>
          <li>• Opt for plant-based meals</li>
          <li>• Use energy-efficient appliances</li>
          <li>• Recycle and compost your waste</li>
          <li>• Buy second-hand items instead of new</li>
        </ul>
      </div>
    </div>
  )
} 