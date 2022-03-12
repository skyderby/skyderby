import { useEffect } from 'react'

interface Point {
  latitude: number
  longitude: number
}

type TrajectoryProps = {
  color: string
  points: Point[]
  map: google.maps.Map | undefined
}

const Trajectory = ({ color: strokeColor, points, map }: TrajectoryProps) => {
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
