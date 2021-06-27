import { useEffect } from 'react'

const Marker = ({ latitude, longitude, map }) => {
  useEffect(() => {
    if (!map) return

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map
    })

    return () => marker.setMap(null)
  }, [map, latitude, longitude])

  return null
}

export default Marker
