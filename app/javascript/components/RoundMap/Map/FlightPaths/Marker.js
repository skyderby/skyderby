import { useContext, useEffect } from 'react'

import MapContext from 'components/RoundMap/Map/MapContext'

const Marker = ({ color, latitude, longitude }) => {
  const { map } = useContext(MapContext)

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
  }, [map, latitude, longitude])

  return null
}

export default Marker
