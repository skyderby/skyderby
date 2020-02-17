import { useEffect } from 'react'
import PropTypes from 'prop-types'

import { polylinesBySpeed } from 'utils/polylinesBySpeed'

const Trajectory = ({ map, google, points, opacity: strokeOpacity = 1 }) => {
  useEffect(() => {
    if (!map) return

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

Trajectory.propTypes = {
  map: PropTypes.object,
  google: PropTypes.object,
  points: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired
    })
  ).isRequired,
  opacity: PropTypes.number
}
export default Trajectory
