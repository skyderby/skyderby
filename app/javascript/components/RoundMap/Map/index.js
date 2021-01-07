import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import useGoogleMapsApi from 'utils/useGoogleMapsApi'

import { selectBoundaries } from 'redux/events/round/selectors'

import MapContext from './MapContext'
import Legend from './Legend'
import ReferencePoints from './ReferencePoints'
import FlightPaths from './FlightPaths'
import DesignatedLane from './DesignatedLane'

import styles from './styles.module.scss'

const Map = () => {
  const mapElementRef = useRef()
  const [mapInstance, setMapInstance] = useState()

  const google = useGoogleMapsApi()

  const boundaries = useSelector(selectBoundaries)

  useEffect(() => {
    if (!google) return

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0)
    }

    setMapInstance(new google.maps.Map(mapElementRef.current, options))
  }, [google])

  useEffect(() => {
    if (!mapInstance || !boundaries) return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(boundaries.minLatitude, boundaries.minLongitude))
    bounds.extend(new google.maps.LatLng(boundaries.maxLatitude, boundaries.maxLongitude))

    mapInstance.fitBounds(bounds)
  }, [mapInstance, boundaries, google])

  return (
    <main className={styles.container}>
      <div ref={mapElementRef}>Map</div>
      <MapContext.Provider value={{ map: mapInstance }}>
        <ReferencePoints />
        <FlightPaths />
        <DesignatedLane />
      </MapContext.Provider>

      <Legend />
    </main>
  )
}

export default Map
