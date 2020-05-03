import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { getBoundaries } from 'utils/getBoundaries'
import { selectPoints } from 'redux/tracks/points'
import { selectWindData } from 'redux/tracks/windData'
import { usePageContext } from 'components/PageContext'

import SpeedScale from './SpeedScale'
import WindAloftChart from './WindAloftChart'
import { MapElement, WindAloftChartContainer } from './elements'

import { subtractWind } from 'utils/windCancellation'

import Trajectory from './Trajectory'

const TrackMap = () => {
  const { trackId } = usePageContext()

  const mapElementRef = useRef()
  const [mapInstance, setMapInstance] = useState()
  const google = useGoogleMapsApi()

  const points = useSelector(state => selectPoints(state, trackId))
  const windData = useSelector(state => selectWindData(state, trackId))
  const zeroWindPoints = subtractWind(points, windData)

  useEffect(() => {
    if (!google) return

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0)
    }

    setMapInstance(new google.maps.Map(mapElementRef.current, options))
  }, [google])

  useEffect(() => {
    if (!mapInstance) return

    const boundaries = getBoundaries(points)

    if (!boundaries) return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(boundaries.minLatitude, boundaries.minLongitude))
    bounds.extend(new google.maps.LatLng(boundaries.maxLatitude, boundaries.maxLongitude))

    mapInstance.fitBounds(bounds)
  }, [mapInstance, google, points])

  return (
    <>
      <MapElement ref={mapElementRef}>
        <Trajectory map={mapInstance} google={google} points={points} />
        {zeroWindPoints.length > 0 && (
          <Trajectory
            map={mapInstance}
            google={google}
            points={zeroWindPoints}
            opacity={0.5}
          />
        )}
      </MapElement>

      <SpeedScale />

      {windData.length > 0 && (
        <WindAloftChartContainer>
          <WindAloftChart windData={windData} />
        </WindAloftChartContainer>
      )}
    </>
  )
}

export default TrackMap
