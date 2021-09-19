import { useEffect } from 'react'

import { polylinesBySpeed } from 'utils/polylinesBySpeed'
import { PointRecord } from 'api/hooks/tracks/points'

type TrajectoryProps = {
  map: google.maps.Map | undefined
  google: typeof google | undefined
  points: PointRecord[]
  opacity?: number
}

const Trajectory = ({
  map,
  google,
  points,
  opacity: strokeOpacity = 1
}: TrajectoryProps): null => {
  useEffect(() => {
    if (!map || !google) return

    const polylines = polylinesBySpeed(points).map(
      ({ path, color: strokeColor }) =>
        new google.maps.Polyline({
          map,
          path,
          strokeColor,
          strokeOpacity,
          strokeWeight: 5
        })
    )

    return () => polylines.forEach(polyline => polyline.setMap(null))
  }, [map, google, points, strokeOpacity])

  return null
}

export default Trajectory
