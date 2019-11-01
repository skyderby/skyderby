import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import initMapsApi from 'utils/google_maps_api'

import { selectBoundaries } from 'redux/events/round/selectors'

import MapContext from './MapContext'
import Legend from './Legend'
import ReferencePoints from './ReferencePoints'
import FlightPaths from './FlightPaths'
import DesignatedLane from './DesignatedLane'

const Map = () => {
  const [apiReady, setApiReady] = useState(false)
  const mapElementRef = useRef()
  const [mapInstance, setMapInstance] = useState()

  const onMapsApiReady = () => setApiReady(true)

  const boundaries = useSelector(selectBoundaries)

  useEffect(() => {
    window.addEventListener('maps_api:ready', onMapsApiReady, { once: true })

    initMapsApi()

    return () => window.removeEventListener('maps_api:ready', onMapsApiReady)
  }, [])

  useEffect(() => {
    if (!apiReady) return

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0)
    }

    setMapInstance(new google.maps.Map(mapElementRef.current, options))
  }, [apiReady])

  useEffect(() => {
    if (
      !mapInstance ||
      !boundaries.minLatitude ||
      !boundaries.minLongitude ||
      !boundaries.maxLatitude ||
      !boundaries.maxLongitude
    )
      return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(boundaries.minLatitude, boundaries.minLongitude))
    bounds.extend(new google.maps.LatLng(boundaries.maxLatitude, boundaries.maxLongitude))

    mapInstance.fitBounds(bounds)
  }, [
    mapInstance,
    boundaries.minLatitude,
    boundaries.minLongitude,
    boundaries.maxLatitude,
    boundaries.maxLongitude
  ])

  return (
    <Container>
      <MapElement ref={mapElementRef}>Map</MapElement>
      <MapContext.Provider value={{ map: mapInstance }}>
        <ReferencePoints />
        <FlightPaths />
        <DesignatedLane />
      </MapContext.Provider>

      <Legend />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-basis: 70%;
  flex-direction: column;
  padding: 15px;
`

const MapElement = styled.div`
  flex-basis: 100%;
  flex-shrink: 1;
  flex-grow: 1;
  margin-bottom: 15px;
`

export default Map
