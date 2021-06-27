import { useEffect, useRef } from 'react'

const ICON = {
  path: 'M 0, 0 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
  fillOpacity: 0.5,
  strokeWeight: 0,
  fillColor: '#345995',
  scale: 0.15
}

const Marker = ({ map, latitude, longitude, onDrag }) => {
  const marker = useRef()

  useEffect(() => {
    marker.current = new google.maps.Marker({
      map: map,
      draggable: true,
      icon: ICON
    })

    google.maps.event.addListener(marker.current, 'drag', () => {
      const position = marker.current.getPosition()
      const latitude = position.lat()
      const longitude = position.lng()

      onDrag({ latitude, longitude })
    })

    return () => marker.current.setMap(null)
  }, [map, onDrag])

  useEffect(() => {
    if (!latitude || !longitude) return

    marker.current.setPosition(new google.maps.LatLng(latitude, longitude))
  }, [map, latitude, longitude])

  return null
}

export default Marker
