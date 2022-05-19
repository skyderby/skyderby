import { useEffect } from 'react'

import useMapContext from './MapContext'

type MarkerProps = {
  latitude: number
  longitude: number
} & google.maps.MarkerOptions

const Marker = ({ latitude, longitude, ...markerOptions }: MarkerProps) => {
  const { map, registerCoordinates, deregisterCoordinates } = useMapContext()

  useEffect(() => {
    if (!map) return

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      ...markerOptions,
      map
    })

    const coordinatesId = registerCoordinates([{ latitude, longitude }])

    return () => {
      coordinatesId && deregisterCoordinates(coordinatesId)
      marker.setMap(null)
    }
  }, [map, latitude, longitude])

  return null
}

export default Marker
