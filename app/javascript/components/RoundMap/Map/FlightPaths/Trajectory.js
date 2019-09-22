import { useContext, useEffect } from 'react'

import MapContext from 'components/RoundMap/Map/MapContext'

const Trajectory = ({ color: strokeColor, points }) => {
  const { map } = useContext(MapContext)

  const path = points.map(({ latitude, longitude }) => ({
    lat: Number(latitude),
    lng: Number(longitude)
  }))

  useEffect(() => {
    if (!map) return

    const polyline = new google.maps.Polyline({
      map,
      path,
      strokeColor,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    return () => {
      polyline.setMap(null)
    }
  }, [map])

  return null
}

export default Trajectory
