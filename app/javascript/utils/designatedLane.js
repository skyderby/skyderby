import Geospatial from 'utils/geospatial'

export default function (google, map, width, length, direction, opts = {}) {
  const DLOverlay = class extends google.maps.OverlayView {
    constructor(map, width, length, direction, opts) {
      super()

      this._map = map
      this.width = width
      this.length = length
      this.direction = direction

      this.onRotate = opts['onRotate']

      this.setBounds(this.mapCenter)
      this.centerMarker = this.createCenterMarker()
      this.rotateMarker = this.createRotateMarker()

      this._div = null
    }

    show() {
      this.setMap(this._map)
      this.centerMarker.setMap(this._map)
      this.rotateMarker.setMap(this._map)
    }

    hide() {
      this.setMap(null)
      this.centerMarker.setMap(null)
      this.rotateMarker.setMap(null)
    }

    setLength(val) {
      if (val === 0) return

      this.length = val
      this.setBounds(this.centerMarker.getPosition())
      this.draw()
      this.rotateMarker.setPosition(this.rotateMarkerPosition)
    }

    setWidth(val) {
      if (val === 0) return

      this.width = val
      this.setBounds(this.centerMarker.getPosition())
      this.draw()
    }

    setDirection(val) {
      this.direction = val
      this.draw()
      this.rotateMarker.setPosition(this.rotateMarkerPosition)
    }

    setPosition(lat, lon) {
      const centerPosition = new google.maps.LatLng(lat, lon)

      this.setBounds(centerPosition)
      this.draw()

      this.rotateMarker.setPosition(this.rotateMarkerPosition)
      this.centerMarker.setPosition(centerPosition)
    }

    onAdd() {
      const div = this.createDiv()
      const img = this.createImg()

      div.appendChild(img)

      this._div = div

      this.panes.overlayLayer.appendChild(div)

      this.map.getDiv().dispatchEvent(new Event('map:dl-shown'))
    }

    onRemove() {
      this._div.parentNode.removeChild(this._div)
    }

    draw() {
      const overlayProjection = this.getProjection()
      const sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest())
      const ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast())

      const div = this._div
      div.style.left = `${sw.x}px`
      div.style.top = `${ne.y}px`
      div.style.height = `${sw.y - ne.y}px`
      div.style.width = `${ne.x - sw.x}px`
      div.style.transform = `rotate(${this.direction}deg)`
    }

    createDiv() {
      const div = document.createElement('div')
      div.style.borderStyle = 'none'
      div.style.borderWidth = '0px'
      div.style.position = 'absolute'

      return div
    }

    createImg() {
      const img = document.createElement('img')
      img.src = this.imageSrc
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.opacity = '0.5'
      img.style.position = 'absolute'

      return img
    }

    createCenterMarker() {
      const icon = {
        path: 'M 0, 0 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
        fillOpacity: 0.5,
        strokeWeight: 0,
        fillColor: '#345995',
        scale: 0.2
      }

      const marker = new google.maps.Marker({
        position: this.mapCenter,
        map: map,
        draggable: true,
        icon: icon
      })

      google.maps.event.addListener(marker, 'drag', () => {
        this.setBounds(marker.getPosition())
        this.rotateMarker.setPosition(this.rotateMarkerPosition)
      })

      return marker
    }

    createRotateMarker() {
      const icon = {
        path: 'M 0, 0 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
        fillOpacity: 0.5,
        strokeWeight: 2,
        scale: 0.1
      }

      const marker = new google.maps.Marker({
        position: this.rotateMarkerPosition,
        map: map,
        draggable: true,
        icon: icon
      })

      google.maps.event.addListener(marker, 'drag', () => {
        const centerPosition = this.centerMarker.getPosition()
        const markerPosition = marker.getPosition()

        const latDiff = markerPosition.lat() - centerPosition.lat()
        const lonDiff = markerPosition.lng() - centerPosition.lng()

        this.direction = (Math.atan2(lonDiff, latDiff) * 180) / Math.PI

        this.draw()

        if (typeof this.onRotate === 'function') {
          const angle = Math.round(Geospatial.normalizeAngle(this.direction) * 10) / 10
          this.onRotate(angle)
        }
      })

      google.maps.event.addListener(marker, 'dragend', () => {
        marker.setPosition(this.rotateMarkerPosition)
      })

      return marker
    }

    setBounds(point) {
      const centerLat = point.lat()
      const centerLon = point.lng()

      const topPoint = Geospatial.destiantionByBearingAndDistance(
        centerLat,
        centerLon,
        0,
        this.length / 2
      )
      const bottomPoint = Geospatial.destiantionByBearingAndDistance(
        centerLat,
        centerLon,
        180,
        this.length / 2
      )
      const rightPoint = Geospatial.destiantionByBearingAndDistance(
        centerLat,
        centerLon,
        90,
        this.width / 2
      )
      const leftPoint = Geospatial.destiantionByBearingAndDistance(
        centerLat,
        centerLon,
        270,
        this.width / 2
      )

      const southWest = new google.maps.LatLng(
        bottomPoint['latitude'],
        leftPoint['longitude']
      )
      const northEast = new google.maps.LatLng(
        topPoint['latitude'],
        rightPoint['longitude']
      )

      this.bounds = new google.maps.LatLngBounds(southWest, northEast)
    }

    get rotateMarkerPosition() {
      const center = this.centerMarker.getPosition()
      const angle = this.direction

      const { latitude, longitude } = Geospatial.destiantionByBearingAndDistance(
        center.lat(),
        center.lng(),
        angle,
        this.length / 2
      )

      return new google.maps.LatLng(latitude, longitude)
    }

    get mapCenter() {
      return this._map.getCenter()
    }

    get panes() {
      return this.getPanes()
    }

    get imageSrc() {
      return '/designated-lane.png'
    }
  }

  return new DLOverlay(map, width, length, direction, opts)
}
