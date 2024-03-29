import React, { useState, useEffect, useRef } from 'react'

import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { getBoundaries } from 'utils/getBoundaries'
import { useTrackPointsQuery } from 'api/tracks/points'
import { useTrackWindDataQuery } from 'api/tracks/windData'
import PageContainer from 'components/Tracks/Track/PageContainer'
import SpeedScale from './SpeedScale'
import WindAloftChart from './WindAloftChart'
import { subtractWind } from 'utils/windCancellation'
import Trajectory from './Trajectory'
import styles from './styles.module.scss'

type TrackMapProps = {
  trackId: number
}

const TrackMap = ({ trackId }: TrackMapProps): JSX.Element => {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map>()
  const google = useGoogleMapsApi()

  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: windData = [] } = useTrackWindDataQuery(trackId)
  const zeroWindPoints = subtractWind(points, windData)

  useEffect(() => {
    if (!google || !mapElementRef.current) return

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0)
    }

    setMapInstance(new google.maps.Map(mapElementRef.current, options))
  }, [google])

  useEffect(() => {
    if (!google || !mapInstance) return

    const boundaries = getBoundaries(points)

    if (!boundaries) return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(boundaries.minLatitude, boundaries.minLongitude))
    bounds.extend(new google.maps.LatLng(boundaries.maxLatitude, boundaries.maxLongitude))

    mapInstance.fitBounds(bounds)
  }, [mapInstance, google, points])

  return (
    <PageContainer>
      <div className={styles.map} ref={mapElementRef}>
        <Trajectory map={mapInstance} google={google} points={points} />
        {zeroWindPoints.length > 0 && (
          <Trajectory
            map={mapInstance}
            google={google}
            points={zeroWindPoints}
            opacity={0.5}
          />
        )}
      </div>

      <SpeedScale />

      {windData.length > 0 && (
        <div className={styles.windsAloft}>
          <WindAloftChart windData={windData} />
        </div>
      )}
    </PageContainer>
  )
}

export default TrackMap
