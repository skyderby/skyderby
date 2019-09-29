import { useState, useEffect, useCallback } from 'react'

const Overlay = ({ map }) => {
  const [overlay, setOverlay] = useState()

  const handleAdd = overlay => {
    console.log('Add')
    const div = document.createElement('div')
    div.style.borderStyle = 'none'
    div.style.borderWidth = '0px'
    div.style.position = 'absolute'
    div.style.top = 0
    div.style.left = 0
    div.style.height = '200px'
    div.style.width = '100px'

    const img = document.createElement('img')
    img.src = '/designated-lane.png'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.opacity = '0.5'
    img.style.position = 'absolute'

    div.appendChild(img)

    const panes = overlay.getPanes()
    panes.overlayLayer.appendChild(div)

    const center_position = new google.maps.LatLng(20, 20)
  }

  const handleDraw = overlay => {
    console.log('draw')
  }

  const hadnleRemove = overlay => {
    console.log('remove')
  }

  useEffect(() => {
    if (!map) return

    const overlayView = new google.maps.OverlayView()
    overlayView.onAdd = () => handleAdd(overlayView)
    overlayView.draw = () => handleDraw(overlayView)
    overlayView.setMap(map)

    setOverlay(overlayView)
  }, [map])

  return null
}

export default Overlay
