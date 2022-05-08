import { useEffect, useRef } from 'react'
import useMapContext from 'components/Map/MapContext'

interface MostDistantPointProps {
  laneViolation: {
    latitude: number
    longitude: number
    distance: number
  }
}

const MostDistantPoint = ({ laneViolation }: MostDistantPointProps) => {
  const { map } = useMapContext()
  const infoWindow = useRef(new google.maps.InfoWindow())

  useEffect(() => {
    if (!map) return
    const mapWindow = infoWindow.current
    mapWindow.open(map)

    return () => mapWindow.close()
  }, [map, infoWindow])

  useEffect(() => {
    if (!map) return

    const deviation = laneViolation.distance - 300

    infoWindow.current.setPosition({
      lat: Number(laneViolation.latitude),
      lng: Number(laneViolation.longitude)
    })
    infoWindow.current.setContent(`Violation: ${Math.round(deviation * 10) / 10}m`)
  }, [map, laneViolation.latitude, laneViolation.longitude, laneViolation.distance])

  return null
}

export default MostDistantPoint
