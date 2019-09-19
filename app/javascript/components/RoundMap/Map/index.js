import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import initMapsApi from 'utils/google_maps_api'

import Legend from './Legend'

const Map = () => {
  const [apiReady, setApiReady] = useState(false)
  const mapElementRef = useRef()

  useEffect(() => {
    window.addEventListener('maps_api:ready', () => setApiReady(true), { once: true })

    initMapsApi()
  }, [])

  useEffect(() => {
    if (!apiReady) return

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0)
    }

    new google.maps.Map(mapElementRef.current, options)
  }, [apiReady])

  return (
    <Container>
      <MapElement ref={mapElementRef}>Map</MapElement>
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
