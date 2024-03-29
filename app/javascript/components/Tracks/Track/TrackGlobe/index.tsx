import React, { useEffect, useState, useRef } from 'react'
import type Cesium from 'cesium'

import { useTrackPointsQuery } from 'api/tracks/points'
import useCesiumApi from 'utils/useCesiumApi'
import PageContainer from 'components/Tracks/Track/PageContainer'
import Trajectory from './Trajectory'
import ViewerClock from './ViewerClock'
import styles from './styles.module.scss'

type TrackGlobeProps = {
  trackId: number
}

const TrackGlobe = ({ trackId }: TrackGlobeProps): JSX.Element | null => {
  const Cesium = useCesiumApi()
  const element = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<Cesium.Viewer>()

  const { data: points = [] } = useTrackPointsQuery(trackId)

  useEffect(() => {
    if (!Cesium || !element.current) return

    setViewer(
      new Cesium.Viewer(element.current, {
        terrainProvider: Cesium.createWorldTerrain(),
        infoBox: false,
        homeButton: false,
        baseLayerPicker: false,
        geocoder: false,
        sceneModePicker: false,
        selectionIndicator: false,
        scene3DOnly: true
      })
    )
  }, [Cesium])

  if (!Cesium) return null

  return (
    <PageContainer>
      <div className={styles.map} ref={element}>
        {points.length > 0 && (
          <>
            <ViewerClock Cesium={Cesium} viewer={viewer} points={points} />
            <Trajectory Cesium={Cesium} viewer={viewer} points={points} />
          </>
        )}
      </div>
    </PageContainer>
  )
}

export default TrackGlobe
