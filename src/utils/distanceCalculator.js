// Distance calculation utility using free geocoding services

// Calculate distance between two points using Haversine formula
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return distance
}

// Geocode address using free Nominatim service
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Main function to calculate distance between two addresses
export const calculateDistanceBetweenAddresses = async (address1, address2) => {
  try {
    // Geocode both addresses
    const [location1, location2] = await Promise.all([
      geocodeAddress(address1),
      geocodeAddress(address2)
    ])
    
    if (!location1 || !location2) {
      throw new Error('Could not geocode one or both addresses')
    }
    
    // Calculate distance using Haversine formula
    const distance = calculateHaversineDistance(
      location1.lat, location1.lon,
      location2.lat, location2.lon
    )
    
    return {
      distance: distance.toFixed(2),
      location1,
      location2
    }
  } catch (error) {
    console.error('Distance calculation error:', error)
    throw error
  }
}

// Fallback distance estimation based on address similarity
export const estimateDistance = (address1, address2) => {
  // Simple estimation based on address characteristics
  const words1 = address1.toLowerCase().split(' ')
  const words2 = address2.toLowerCase().split(' ')
  
  // Count common words (very basic similarity check)
  const commonWords = words1.filter(word => words2.includes(word))
  const similarity = commonWords.length / Math.max(words1.length, words2.length)
  
  // Estimate distance based on similarity
  if (similarity > 0.5) {
    return (Math.random() * 2 + 0.5).toFixed(1) // 0.5-2.5 km for similar addresses
  } else if (similarity > 0.2) {
    return (Math.random() * 5 + 2).toFixed(1) // 2-7 km for somewhat similar
  } else {
    return (Math.random() * 10 + 5).toFixed(1) // 5-15 km for different areas
  }
} 