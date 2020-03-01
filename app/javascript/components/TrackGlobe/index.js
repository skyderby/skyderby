import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'

import { selectPoints } from 'redux/tracks/points'
import useCesiumApi from 'utils/useCesiumApi'
import { usePageContext } from 'components/PageContext'
import Trajectory from './Trajectory'
import ViewerClock from './ViewerClock'

const TrackGlobe = () => {
  const { trackId } = usePageContext()

  const Cesium = useCesiumApi()
  const element = useRef()
  const [viewer, setViewer] = useState()

  const points = useSelector(state => selectPoints(state, trackId))

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
    <div ref={element}>
      {points.length > 0 && (
        <>
          <ViewerClock Cesium={Cesium} viewer={viewer} points={points} />
          <Trajectory Cesium={Cesium} viewer={viewer} points={points} />
        </>
      )}
    </div>
  )
}

export default TrackGlobe
