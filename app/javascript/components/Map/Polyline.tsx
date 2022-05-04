import { useEffect } from 'react'

import useMapContext from './MapContext'

type PolylineProps = {
  points: { latitude: number; longitude: number }[]
  color: string
}

const Polyline = ({ points, color: strokeColor }: PolylineProps) => {
  const { map, registerCoordinates, deregisterCoordinates } = useMapContext()

  useEffect(() => {
    if (!map) return

    const path = points.map(({ latitude, longitude }) => ({
      lat: Number(latitude),
      lng: Number(longitude)
    }))

    const polyline = new google.maps.Polyline({
      map,
      path,
      strokeColor,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    const coordinatesId = registerCoordinates(points)

    return () => {
      deregisterCoordinates(coordinatesId)
      polyline.setMap(null)
    }
  }, [points])

  return null
}

export default Polyline
