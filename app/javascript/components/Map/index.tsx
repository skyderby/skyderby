import React, { useEffect, useRef, useState } from 'react'

import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { MapContext } from './MapContext'
import Marker from './Marker'
import { getBoundaries } from 'utils/getBoundaries'

type MapProps = {
  children?: React.ReactNode
  options?: google.maps.MapOptions
  autoFitBounds?: boolean
}

const Map = ({ children, autoFitBounds = false, options = {} }: MapProps) => {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()
  const google = useGoogleMapsApi()

  const coordinates = autoFitBounds
    ? React.Children.map(React.Children.toArray(children), child => {
        if (React.isValidElement(child)) {
          if (
            Number.isFinite(child.props.latitude) &&
            Number.isFinite(child.props.longitude)
          ) {
            return {
              latitude: child.props.latitude,
              longitude: child.props.longitude
            }
          }
        }
      }).filter(el => el !== undefined)
    : []

  const { minLatitude, minLongitude, maxLatitude, maxLongitude } =
    getBoundaries(coordinates) ?? {}

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
        <MapContext.Provider value={{ google, map }}>{children}</MapContext.Provider>
      )}
    </div>
  )
}

export default Object.assign(Map, { Marker })
