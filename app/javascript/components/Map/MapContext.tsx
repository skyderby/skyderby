import { createContext, useContext } from 'react'

type MapContext = {
  map: google.maps.Map
  google: typeof google
  registerCoordinates: (
    coordinates: { latitude: number; longitude: number }[]
  ) => number | null
  deregisterCoordinates: (id: number | null) => void
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
