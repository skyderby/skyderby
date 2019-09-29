import React, { useContext } from 'react'

import MapContext from 'components/RoundMap/Map/MapContext'
import Overlay from './Overlay'

const DesignatedLane = () => {
  const { map } = useContext(MapContext)

  return (
    <>
      <Overlay map={map} />
    </>
  )
}

export default DesignatedLane
