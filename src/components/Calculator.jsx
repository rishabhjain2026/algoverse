import { useState } from 'react'
import { useCarbonStore } from '../stores/carbonStore'
import { 
  Car, 
  Utensils, 
  Zap, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Calculator as CalcIcon,
  Info,
  CheckCircle
} from 'lucide-react'

const categories = [
  {
    id: 'transportation',
    name: 'Transportation',
    icon: Car,
    color: 'blue',
    description: 'Track your travel emissions'
  },
  {
    id: 'food',
    name: 'Food & Diet',
    icon: Utensils,
    color: 'green',
    description: 'Monitor your food choices'
  },
  {
    id: 'energy',
    name: 'Energy Usage',
    icon: Zap,
    color: 'yellow',
    description: 'Track electricity and heating'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'purple',
    description: 'Monitor your purchases'
  },
  {
    id: 'waste',
    name: 'Waste Management',
    icon: Trash2,
    color: 'red',
    description: 'Track waste and recycling'
  }
]

const categoryOptions = {
  transportation: [
    { value: 'car', label: 'Car (gasoline)', unit: 'km' },
    { value: 'bus', label: 'Bus', unit: 'km' },
    { value: 'train', label: 'Train', unit: 'km' },
    { value: 'plane', label: 'Airplane', unit: 'km' },
    { value: 'bike', label: 'Bicycle', unit: 'km' },
    { value: 'walk', label: 'Walking', unit: 'km' }
  ],
  food: [
    { value: 'beef', label: 'Beef', unit: 'kg' },
    { value: 'chicken', label: 'Chicken', unit: 'kg' },
    { value: 'fish', label: 'Fish', unit: 'kg' },
    { value: 'vegetables', label: 'Vegetables', unit: 'kg' },
    { value: 'fruits', label: 'Fruits', unit: 'kg' },
    { value: 'dairy', label: 'Dairy', unit: 'kg' },
    { value: 'grains', label: 'Grains', unit: 'kg' }
  ],
  energy: [
    { value: 'electricity', label: 'Electricity', unit: 'kWh' },
    { value: 'naturalGas', label: 'Natural Gas', unit: 'm³' },
    { value: 'heating', label: 'Heating', unit: 'kWh' }
  ],
  shopping: [
    { value: 'clothing', label: 'Clothing', unit: 'item' },
    { value: 'electronics', label: 'Electronics', unit: 'item' },
    { value: 'furniture', label: 'Furniture', unit: 'item' },
    { value: 'books', label: 'Books', unit: 'item' }
  ],
  waste: [
    { value: 'general', label: 'General Waste', unit: 'kg' },
    { value: 'recyclable', label: 'Recyclable', unit: 'kg' },
    { value: 'compost', label: 'Compost', unit: 'kg' }
  ]
}

export default function Calculator() {
  const { addActivity, emissionFactors } = useCarbonStore()
  const [selectedCategory, setSelectedCategory] = useState('transportation')
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    unit: '',
    notes: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setFormData({ type: '', amount: '', unit: '', notes: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTypeChange = (e) => {
    const selectedType = e.target.value
    const option = categoryOptions[selectedCategory].find(opt => opt.value === selectedType)
    setFormData(prev => ({
      ...prev,
      type: selectedType,
      unit: option ? option.unit : ''
    }))
  }

  const calculateCarbon = () => {
    if (!formData.type || !formData.amount) return 0
    
    const factor = emissionFactors[selectedCategory][formData.type] || 0
    const amount = parseFloat(formData.amount) || 0
    
    // For sustainable transportation choices, calculate savings compared to car
    if (selectedCategory === 'transportation') {
      const carFactor = emissionFactors.transportation.car || 0.2
      
      if (formData.type === 'bike' || formData.type === 'walk') {
        // These are carbon-free, so savings = what a car would have emitted
        return -(carFactor * amount)
      } else if (formData.type === 'bus' || formData.type === 'train') {
        // Calculate savings compared to car
        const carEmission = carFactor * amount
        const publicEmission = factor * amount
        return carEmission - publicEmission
      }
    }
    
    // For waste recycling, calculate savings
    if (selectedCategory === 'waste' && (formData.type === 'recyclable' || formData.type === 'compost')) {
      const generalWasteFactor = emissionFactors.waste.general || 0.5
      const currentFactor = factor
      const savings = generalWasteFactor - currentFactor
      return -(savings * amount)
    }
    
    return factor * amount
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.type || !formData.amount) return
    
    const carbonAmount = calculateCarbon()
    
    const result = await addActivity({
      category: selectedCategory,
      type: formData.type,
      amount: parseFloat(formData.amount),
      unit: formData.unit,
      notes: formData.notes
    })
    
    if (result.success) {
      setShowSuccess(true)
      setFormData({ type: '', amount: '', unit: '', notes: '' })
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const carbonAmount = calculateCarbon()
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const IconComponent = selectedCategoryData?.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-carbon-800 mb-2">
          Carbon Footprint Calculator
        </h1>
        <p className="text-carbon-600">
          Calculate and track your carbon emissions from daily activities
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="card bg-eco-50 border-eco-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-eco-600" />
            <div>
              <p className="font-medium text-eco-800">Activity Added Successfully!</p>
              <p className="text-sm text-eco-600">
                Your carbon footprint has been updated.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Selection */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-carbon-800 mb-4">
              Select Category
            </h3>
            <div className="space-y-3">
              {categories.map((category) => {
                const IconComponent = category.icon
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-carbon-200 hover:border-carbon-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary-100' : 'bg-carbon-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isSelected ? 'text-primary-600' : 'text-carbon-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${
                          isSelected ? 'text-primary-700' : 'text-carbon-800'
                        }`}>
                          {category.name}
                        </p>
                        <p className="text-sm text-carbon-500">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              {IconComponent && (
                <div className="p-2 bg-primary-100 rounded-lg">
                  <IconComponent className="w-6 h-6 text-primary-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-carbon-800">
                  {selectedCategoryData?.name} Calculator
                </h3>
                <p className="text-sm text-carbon-500">
                  {selectedCategoryData?.description}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-2">
                  Activity Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="input-field"
                  required
                >
                  <option value="">Select an activity</option>
                  {categoryOptions[selectedCategory]?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-2">
                  Amount ({formData.unit})
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder={`Enter amount in ${formData.unit}`}
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Carbon Calculation Preview */}
              {formData.type && formData.amount && (
                <div className="p-4 bg-carbon-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-carbon-700">
                        Estimated Carbon Impact
                      </p>
                      <p className="text-xs text-carbon-500">
                        Based on current emission factors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        carbonAmount > 0 ? 'text-red-600' : 'text-eco-600'
                      }`}>
                        {carbonAmount > 0 ? '+' : ''}{carbonAmount.toFixed(2)} kg CO2
                      </p>
                      <p className="text-xs text-carbon-500">
                        {Math.abs(carbonAmount).toFixed(2)} kg CO2 equivalent
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!formData.type || !formData.amount}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </button>
            </form>
          </div>

          {/* Tips Section */}
          <div className="card bg-gradient-to-r from-eco-50 to-primary-50 border-eco-200">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-eco-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-carbon-800 mb-2">
                  Tips for Reducing Your Carbon Footprint
                </h4>
                <ul className="text-sm text-carbon-600 space-y-1">
                  <li>• Choose public transportation over driving</li>
                  <li>• Opt for plant-based meals when possible</li>
                  <li>• Use energy-efficient appliances</li>
                  <li>• Buy second-hand items instead of new</li>
                  <li>• Recycle and compost your waste</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 