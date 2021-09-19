import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'

import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import useCesiumApi from 'utils/useCesiumApi'
import PageContainer from 'components/Tracks/Track/PageContainer'
import Trajectory from './Trajectory'
import ViewerClock from './ViewerClock'
import styles from './styles.module.scss'

const TrackGlobe = ({ match }) => {
  const trackId = Number(match.params.id)
  const Cesium = useCesiumApi()
  const element = useRef()
  const [viewer, setViewer] = useState()

  const { data: points = [] } = useTrackPointsQuery(trackId)

  useEffect(() => {
    if (!Cesium) return

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

TrackGlobe.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default TrackGlobe
