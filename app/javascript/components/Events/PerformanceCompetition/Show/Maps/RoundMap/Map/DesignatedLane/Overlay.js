import { useMemo, useEffect } from 'react'

import getLaneParams from './getLaneParams'

const Overlay = ({ map, startPoint, endPoint }) => {
  const overlay = useMemo(() => new google.maps.OverlayView(), [])

  const div = useMemo(() => {
    const div = document.createElement('div')
    div.style.opacity = 0
    div.style.borderStyle = 'none'
    div.style.borderWidth = '0px'
    div.style.position = 'absolute'

    const img = document.createElement('img')
    img.src = '/designated-lane.png'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.opacity = '0.5'
    img.style.position = 'absolute'

    div.appendChild(img)

    return div
  }, [])

  const draw = () => {
    const { top, right, bottom, left, bearing } = getLaneParams(startPoint, endPoint)

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bottom.latitude, left.longitude),
      new google.maps.LatLng(top.latitude, right.longitude)
    )

    const projection = overlay.getProjection()
    const southWest = projection.fromLatLngToDivPixel(bounds.getSouthWest())
    const northEast = projection.fromLatLngToDivPixel(bounds.getNorthEast())

    div.style.opacity = 1
    div.style.left = `${southWest.x}px`
    div.style.top = `${northEast.y}px`
    div.style.height = `${southWest.y - northEast.y}px`
    div.style.width = `${northEast.x - southWest.x}px`
    div.style.transform = `rotate(${bearing}deg)`
  }

  overlay.onAdd = () => overlay.getPanes().overlayLayer.appendChild(div)
  overlay.draw = draw
  overlay.onRemove = () => div.parentNode.removeChild(div)

  useEffect(() => {
    if (!map) return

    overlay.setMap(map)

    return () => overlay.setMap(null)
  }, [map, overlay])

  return null
}

export default Overlay
