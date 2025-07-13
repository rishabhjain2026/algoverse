import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

export default function GoogleMapsDistance({ onDistanceCalculated, onError }) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [distance, setDistance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const autocompleteRefs = useRef({ origin: null, destination: null })

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        initializeAutocomplete()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeAutocomplete
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please check your API key.')
        onError('Failed to load Google Maps API')
      }
      document.head.appendChild(script)
    }

    loadGoogleMapsAPI()
  }, [])

  const initializeAutocomplete = () => {
    if (!window.google || !window.google.maps) return

    // Initialize autocomplete for origin
    const originInput = document.getElementById('origin-input')
    if (originInput) {
      autocompleteRefs.current.origin = new window.google.maps.places.Autocomplete(originInput, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' } // You can change this to your country
      })
    }

    // Initialize autocomplete for destination
    const destinationInput = document.getElementById('destination-input')
    if (destinationInput) {
      autocompleteRefs.current.destination = new window.google.maps.places.Autocomplete(destinationInput, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' } // You can change this to your country
      })
    }
  }

  const calculateDistance = async () => {
    if (!origin || !destination) {
      setError('Please enter both origin and destination')
      return
    }

    setLoading(true)
    setError('')

    try {
      const service = new window.google.maps.DistanceMatrixService()
      
      const request = {
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC
      }

      service.getDistanceMatrix(request, (response, status) => {
        setLoading(false)
        
        if (status === 'OK') {
          const element = response.rows[0].elements[0]
          
          if (element.status === 'OK') {
            const distanceInMeters = element.distance.value
            const distanceInKm = (distanceInMeters / 1000).toFixed(2)
            
            setDistance(distanceInKm)
            onDistanceCalculated(parseFloat(distanceInKm))
          } else {
            setError('Could not calculate distance. Please check your addresses.')
            onError('Could not calculate distance')
          }
        } else {
          setError('Failed to calculate distance. Please try again.')
          onError('Failed to calculate distance')
        }
      })
    } catch (err) {
      setLoading(false)
      setError('An error occurred while calculating distance')
      onError('An error occurred while calculating distance')
    }
  }

  const clearForm = () => {
    setOrigin('')
    setDestination('')
    setDistance(null)
    setError('')
    onDistanceCalculated(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Navigation className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-carbon-800">
          Calculate Distance with Google Maps
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Input */}
        <div>
          <label htmlFor="origin-input" className="block text-sm font-medium text-carbon-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Starting Point
          </label>
          <input
            id="origin-input"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter starting address"
            className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Destination Input */}
        <div>
          <label htmlFor="destination-input" className="block text-sm font-medium text-carbon-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Destination
          </label>
          <input
            id="destination-input"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination address"
            className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={calculateDistance}
          disabled={loading || !origin || !destination}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{loading ? 'Calculating...' : 'Calculate Distance'}</span>
        </button>

        <button
          onClick={clearForm}
          className="btn-secondary"
        >
          Clear
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Distance Result */}
      {distance && (
        <div className="p-4 bg-eco-50 border border-eco-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-eco-800">Calculated Distance</p>
              <p className="text-sm text-eco-600">Based on driving route</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-eco-600">{distance} km</p>
              <p className="text-xs text-eco-500">{(distance * 0.621371).toFixed(2)} miles</p>
            </div>
          </div>
        </div>
      )}

      {/* API Key Notice */}
      <div className="text-xs text-carbon-500 bg-carbon-50 p-3 rounded-lg">
        <p><strong>Note:</strong> This feature requires a Google Maps API key. Add your API key to the environment variables as <code>REACT_APP_GOOGLE_MAPS_API_KEY</code></p>
      </div>
    </div>
  )
} 