import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'

import MapContext from './MapContext'

const ReferencePoints = () => {
  const { map } = useContext(MapContext)

  const referencePoints = useSelector(state =>
    state.eventRoundMap.results.reduce((acc, { referencePoint }) => {
      if (!referencePoint) return acc

      if (acc.find(({ id }) => id === referencePoint.id)) return acc

      return [...acc, referencePoint]
    }, [])
  )

  useEffect(() => {
    if (!map) return

    const markers = referencePoints.map(
      ({ latitude, longitude }) =>
        new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
          map
        })
    )

    return () => markers.forEach(marker => marker.setMap(null))
  }, [map, referencePoints])

  return null
}

export default ReferencePoints
