import React, { useCallback, useEffect, useRef, useState } from 'react'

import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { getBoundaries } from 'utils/getBoundaries'
import { MapContext } from './MapContext'
import Marker from './Marker'
import Polyline from './Polyline'

type MapProps = {
  children?: React.ReactNode
  options?: google.maps.MapOptions
  autoFitBounds?: boolean
  afterInitialize?: (map: google.maps.Map) => void
  onZoomChanged?: (map: google.maps.Map) => void
  onCenterChanged?: (map: google.maps.Map) => void
}

interface Coordinate {
  latitude: number
  longitude: number
}

const Map = (props: MapProps) => {
  const {
    children,
    autoFitBounds = false,
    options = {},
    afterInitialize,
    onZoomChanged,
    onCenterChanged
  } = props

  const optionsRef = useRef<google.maps.MapOptions>(options)
  const onZoomChangedRef = useRef(onZoomChanged)
  const onCenterChangedRef = useRef(onCenterChanged)
  const afterInitializeRef = useRef(afterInitialize)
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()
  const objId = useRef(0)
  const [coordinates, setCoordinates] = useState<Record<string, Coordinate[]>>({})
  const google = useGoogleMapsApi()

  useEffect(() => {
    onZoomChangedRef.current = onZoomChanged
  }, [onZoomChanged])

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged
  }, [onCenterChanged])

  const registerCoordinates = useCallback(
    (coordinates: Coordinate[]) => {
      if (!autoFitBounds) return null

      const id = objId.current++
      setCoordinates(prev => ({ ...prev, [id]: coordinates }))

      return id
    },
    [setCoordinates, autoFitBounds]
  )

  const deregisterCoordinates = useCallback(
    (id: number | null) => {
      if (!autoFitBounds || !id) return

      setCoordinates(prev =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id.toString()))
      )
    },
    [setCoordinates, autoFitBounds]
  )

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
      ...optionsRef.current
    }

    const map = new google.maps.Map(mapElementRef.current, mapOptions)
    setMap(map)
    afterInitializeRef.current?.(map)
  }, [google])

  useEffect(() => {
    if (!google || !map) return

    google.maps.event.addListener(map, 'zoom_changed', () =>
      onZoomChangedRef.current?.(map)
    )
    google.maps.event.addListener(map, 'center_changed', () =>
      onCenterChangedRef.current?.(map)
    )
  }, [map, google])

  return (
    <div ref={mapElementRef}>
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
