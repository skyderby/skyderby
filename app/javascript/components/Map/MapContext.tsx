import React, { createContext, useContext, useState } from 'react'
import useGoogleMapsApi from 'utils/useGoogleMapsApi'

type MapContext = {
  map: google.maps.Map
  google: typeof google
}
const MapContext = createContext<MapContext | undefined>(undefined)

const useMapContext = (): MapContext => {
  const context = useContext(MapContext)

  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapContext')
  }

  return context
}

export { MapContext }

export default useMapContext
