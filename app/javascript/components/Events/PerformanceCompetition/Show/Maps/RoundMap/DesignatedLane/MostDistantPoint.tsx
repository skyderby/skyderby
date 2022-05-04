import { useEffect } from 'react'
import useMapContext from 'components/Map/MapContext'

const MostDistantPoint = ({ laneViolation }) => {
  const { map } = useMapContext()

  useEffect(() => {
    if (!map || !laneViolation) return

    const deviation = laneViolation.distance - 300

    const infoWindow = new google.maps.InfoWindow({
      position: {
        lat: Number(laneViolation.latitude),
        lng: Number(laneViolation.longitude)
      },
      map: map,
      content: `Violation: ${Math.round(deviation * 10) / 10}m`
    })

    return () => infoWindow.setMap(null)
  }, [map, laneViolation])

  return null
}

export default MostDistantPoint
