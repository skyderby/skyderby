import { LOCATION_ARROW_PATH } from '../locationArrowPath'

const SIZE = '24px'

const buildElement = ({ imageUrl, color, className }) => {
  if (className) {
    const arrow = document.createElement('div')
    arrow.className = className
    if (imageUrl) {
      arrow.style.maskImage = `url(${imageUrl})`
      arrow.style.webkitMaskImage = `url(${imageUrl})`
    }
    return arrow
  }

  if (color) {
    const wrapper = document.createElement('div')
    wrapper.style.width = SIZE
    wrapper.style.height = SIZE
    wrapper.innerHTML =
      '<svg viewBox="0 0 640 640" width="24" height="24">' +
      `<path fill="${color}" d="${LOCATION_ARROW_PATH}"/></svg>`
    return wrapper
  }

  const img = document.createElement('img')
  img.src = imageUrl
  img.style.width = SIZE
  img.style.height = SIZE
  return img
}

export default class ArrowMarker {
  constructor({ map, position, imageUrl = null, color = null, className = null }) {
    this.element = buildElement({ imageUrl, color, className })
    this.element.style.transform = 'translateY(50%) rotate(-45deg)'

    this.marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: position.latitude, lng: position.longitude },
      content: this.element
    })
  }

  setPosition(point, heading) {
    this.marker.position = { lat: point.latitude, lng: point.longitude }

    if (heading !== undefined) {
      this.element.style.transform = `translateY(50%) rotate(${heading - 45}deg)`
    }
  }

  remove() {
    this.marker.map = null
  }
}
