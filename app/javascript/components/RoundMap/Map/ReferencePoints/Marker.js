import { useContext, useEffect } from 'react'

import MapContext from 'components/RoundMap/Map/MapContext'

const Marker = ({ latitude, longitude }) => {
  const { map } = useContext(MapContext)

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
