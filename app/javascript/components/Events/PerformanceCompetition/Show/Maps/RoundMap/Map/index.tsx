import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import useGoogleMapsApi from 'utils/useGoogleMapsApi'

import { selectBoundaries } from 'redux/events/round/selectors'

import ReferencePoints from './ReferencePoints'
import FlightPaths from './FlightPaths'
import DesignatedLane from './DesignatedLane'

import styles from './styles.module.scss'

type MapProps = {
  children: React.ReactNode
}

const Map = ({ children }: MapProps) => {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map>()

  const google = useGoogleMapsApi()

  const boundaries = useSelector(selectBoundaries)

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
    if (!google || !mapInstance || !boundaries) return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(boundaries.minLatitude, boundaries.minLongitude))
    bounds.extend(new google.maps.LatLng(boundaries.maxLatitude, boundaries.maxLongitude))

    mapInstance.fitBounds(bounds)
  }, [mapInstance, boundaries, google])

  return (
    <main className={styles.container}>
      <div ref={mapElementRef}>Map</div>

      <ReferencePoints map={mapInstance} />
      <FlightPaths map={mapInstance} />
      <DesignatedLane map={mapInstance} />

      {children}
    </main>
  )
}

export default Map
