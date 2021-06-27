import { useEffect } from 'react'

const Marker = ({ map, color, latitude, longitude }) => {
  useEffect(() => {
    if (!map) return

    const marker = new google.maps.Marker({
      map,
      position: new google.maps.LatLng(latitude, longitude),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 5,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 1
      }
    })

    return () => marker.setMap(null)
  }, [map, color, latitude, longitude])

  return null
}

export default Marker
