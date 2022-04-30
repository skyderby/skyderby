import { useEffect } from 'react'

import useMapContext from './MapContext'

type MarkerProps = {
  latitude: number
  longitude: number
}

const Marker = ({ latitude, longitude }: MarkerProps) => {
  const { map } = useMapContext()

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
