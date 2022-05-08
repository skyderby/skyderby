import React, { useEffect, useRef, useState } from 'react'

import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { getBoundaries } from 'utils/getBoundaries'
import { MapContext } from './MapContext'
import Marker from './Marker'
import Polyline from './Polyline'

type MapProps = {
  children?: React.ReactNode
  options?: google.maps.MapOptions
  autoFitBounds?: boolean
}

interface Coordinate {
  latitude: number
  longitude: number
}

const Map = ({ children, autoFitBounds = false, options = {} }: MapProps) => {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()
  const objId = useRef(0)
  const [coordinates, setCoordinates] = useState<Record<string, Coordinate[]>>({})
  const google = useGoogleMapsApi()

  const registerCoordinates = (coordinates: Coordinate[]) => {
    const id = objId.current++
    setCoordinates(prev => ({ ...prev, [id]: coordinates }))

    return id
  }

  const deregisterCoordinates = (id: number) => {
    setCoordinates(prev =>
      Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id.toString()))
    )
  }

  const { minLatitude, minLongitude, maxLatitude, maxLongitude } =
    getBoundaries(Object.values(coordinates).flat()) ?? {}

  useEffect(() => {
    if (!google || !map || !autoFitBounds) return

    if (!minLatitude || !minLongitude || !maxLatitude || !maxLongitude) return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(minLatitude, minLongitude))
    bounds.extend(new google.maps.LatLng(maxLatitude, maxLongitude))

    map.fitBounds(bounds)
  }, [google, map, autoFitBounds, minLatitude, minLongitude, maxLatitude, maxLongitude])

  useEffect(() => {
    if (!google || !mapElementRef.current) return

    const mapOptions = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0),
      fullscreenControl: false,
      streetViewControl: false,
      ...options
    }

    setMap(new google.maps.Map(mapElementRef.current, mapOptions))
  }, [google])

  return (
    <div ref={mapElementRef}>
      Map
      {google && map && (
        <MapContext.Provider
          value={{ google, map, registerCoordinates, deregisterCoordinates }}
        >
          {children}
        </MapContext.Provider>
      )}
    </div>
  )
}

export default Object.assign(Map, { Marker, Polyline })
