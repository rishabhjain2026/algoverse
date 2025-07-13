import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, TrendingDown, Award, Users, Zap, TreePine } from 'lucide-react'

const carbonFacts = [
  {
    fact: "A single tree can absorb up to 48 pounds of CO2 per year",
    impact: "Planting just 10 trees can offset your annual carbon footprint",
    icon: TreePine
  },
  {
    fact: "Switching to LED bulbs can save 1,400 pounds of CO2 annually",
    impact: "That's equivalent to driving 1,500 fewer miles per year",
    icon: Zap
  },
  {
    fact: "Eating plant-based meals saves 2.5 kg of CO2 per meal",
    impact: "Going vegetarian for a year saves as much CO2 as driving 2,500 miles",
    icon: Leaf
  },
  {
    fact: "Public transportation reduces CO2 by 37 million metric tons yearly",
    impact: "One bus can take 40 cars off the road",
    icon: TrendingDown
  },
  {
    fact: "Recycling one aluminum can saves enough energy to run a TV for 3 hours",
    impact: "Recycling reduces CO2 emissions by 25% compared to landfills",
    icon: Award
  }
]

export default function LandingPage() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % carbonFacts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentFact = carbonFacts[currentFactIndex]
  const IconComponent = currentFact.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-primary-50 to-eco-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <Leaf className="w-8 h-8 text-primary-600" />
          <span className="text-2xl font-bold text-carbon-800">EcoTracker</span>
        </div>
        <div className="space-x-4">
          <Link to="/auth" className="btn-secondary">Sign In</Link>
          <Link to="/auth" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-carbon-800 mb-6">
            Track Your
            <span className="eco-gradient bg-clip-text text-transparent"> Carbon Footprint</span>
          </h1>
          <p className="text-xl text-carbon-600 mb-8 max-w-3xl mx-auto">
            Join thousands of eco-conscious individuals tracking their environmental impact. 
            Earn rewards, compete with friends, and make a real difference for our planet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="btn-primary text-lg px-8 py-4">
              Start Tracking Today
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>

        {/* Carbon Fact Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className={`card transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-eco-100 rounded-full">
                  <IconComponent className="w-8 h-8 text-eco-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-carbon-800 mb-4">
                Did You Know?
              </h3>
              <p className="text-lg text-carbon-700 mb-3">
                {currentFact.fact}
              </p>
              <p className="text-eco-600 font-medium">
                {currentFact.impact}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="p-4 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-carbon-800 mb-2">Track & Reduce</h3>
            <p className="text-carbon-600">
              Monitor your daily activities and see your carbon footprint in real-time
            </p>
          </div>
          
          <div className="card text-center">
            <div className="p-4 bg-eco-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 text-eco-600" />
            </div>
            <h3 className="text-xl font-semibold text-carbon-800 mb-2">Earn Rewards</h3>
            <p className="text-carbon-600">
              Get cashback and rewards for making sustainable choices
            </p>
          </div>
          
          <div className="card text-center">
            <div className="p-4 bg-carbon-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-carbon-600" />
            </div>
            <h3 className="text-xl font-semibold text-carbon-800 mb-2">Compete & Connect</h3>
            <p className="text-carbon-600">
              Challenge friends and see how you rank among eco-warriors
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
            <div className="text-carbon-600">Active Users</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-eco-600 mb-2">50,000kg</div>
            <div className="text-carbon-600">CO2 Saved</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">$25,000</div>
            <div className="text-carbon-600">Rewards Given</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-eco-600 mb-2">4.8★</div>
            <div className="text-carbon-600">User Rating</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card bg-gradient-to-r from-primary-500 to-eco-500 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join our community and start tracking your carbon footprint today
            </p>
            <Link to="/auth" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 