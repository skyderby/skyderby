import { useEffect } from 'react'

const Trajectory = ({ color: strokeColor, points, map }) => {
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
  }, [map, path, strokeColor])

  return null
}

export default Trajectory
