import React from 'react'

import { Competitor, PerformanceCompetition, Result } from 'api/performanceCompetitions'
import useResultPoints from 'components/Events/PerformanceCompetition/useResultPoints'
import Map from 'components/Map'
import { afterExitColor, windowStartColor, windowEndColor } from '../constants'

type FlightPathProps = {
  event: PerformanceCompetition
  competitor: Competitor & {
    result: Result
    color: string
  }
}

const FlightPath = ({ event, competitor }: FlightPathProps) => {
  const { points = [], afterExitPoint, startPoint, endPoint } = useResultPoints(
    event,
    competitor.result
  )

  return (
    <>
      <Map.Polyline color={competitor.color} points={points} />
      {startPoint && (
        <Map.Marker
          latitude={startPoint.latitude}
          longitude={startPoint.longitude}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            strokeWeight: 5,
            strokeColor: windowStartColor,
            fillColor: windowStartColor,
            fillOpacity: 1
          }}
        />
      )}
      {endPoint && (
        <Map.Marker
          latitude={endPoint.latitude}
          longitude={endPoint.longitude}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            strokeWeight: 5,
            strokeColor: windowEndColor,
            fillColor: windowEndColor,
            fillOpacity: 1
          }}
        />
      )}
      {afterExitPoint && (
        <Map.Marker
          latitude={afterExitPoint.latitude}
          longitude={afterExitPoint.longitude}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            strokeWeight: 5,
            strokeColor: afterExitColor,
            fillColor: afterExitColor,
            fillOpacity: 1
          }}
        />
      )}
    </>
  )
}

export default FlightPath
