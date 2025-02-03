import { Controller } from 'stimulus'
import initMapsApi from 'utils/google_maps_api'
import getLaneViolation from 'utils/checkLaneViolation'

const START_POINT_COLOR = '#ff1053'
const END_POINT_COLOR = '#5FAD41'
const AFTER_EXIT_POINT_COLOR = '#124E78'
const LINE_COLOR = '#7cb5ec'

const MAPS_API_FAIL_TEMPLATE = `
  <i class="fa fa-3x fa-exclamation-triangle text-danger"></i>
  <p>Failed to load Google Maps API.</p>
`

export default class extends Controller {
  static targets = ['map', 'mapData', 'loadingPlaceholder']

  connect() {
    initMapsApi()
    this.mapData = JSON.parse(this.mapDataTarget.textContent)
  }

  onMapsReady = () => {
    this.mapsReady = true
    this.renderMap()
  }

  onMapsFailedLoad = () => {
    this.mapsReady = false
    this.loadingPlaceholderTarget.innerHTML = MAPS_API_FAIL_TEMPLATE
  }

  renderMap() {
    if (!this.mapsReady || !this.mapData) return

    const {
      place: { latitude, longitude }
    } = this.mapData
    var center = new google.maps.LatLng(latitude, longitude)

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: center
    }

    this.mapTarget.mapInstance = new google.maps.Map(this.mapTarget, options)
    this.drawMap()
  }

  drawMap() {
    this.drawPolyline(this.mapData.pathCoordinates, LINE_COLOR)

    this.drawPoint(this.mapData.startPoint, START_POINT_COLOR)
    this.drawPoint(this.mapData.endPoint, END_POINT_COLOR)
    this.drawPoint(this.mapData.afterExitPoint, AFTER_EXIT_POINT_COLOR)

    this.drawMostDistantPoint()

    this.showDesignatedLane()

    this.resize()
  }

  drawMostDistantPoint() {
    const { afterExitPoint, referencePoint, endPoint, pathCoordinates } = this.mapData

    if (!referencePoint) return

    const point = getLaneViolation(
      pathCoordinates.map(el => ({
        latitude: el.lat,
        longitude: el.lng,
        gpsTime: el.gpsTime
      })),
      {
        ...afterExitPoint,
        latitude: afterExitPoint.lat,
        longitude: afterExitPoint.lng
      },
      {
        latitude: referencePoint.lat,
        longitude: referencePoint.lng
      },
      {
        ...endPoint,
        latitude: endPoint.lat,
        longitude: endPoint.lng
      }
    )

    if (!point) return

    if (point.distance > 300) {
      const deviation = point.distance - 300

      new google.maps.InfoWindow({
        position: { lat: point.latitude, lng: point.longitude },
        map: this.map,
        content: `Violation: ${Math.round(deviation * 10) / 10}m`
      })
    }
  }

  showDesignatedLane() {
    if (!this.mapData.referencePoint) return

    this.drawReferencePoint()

    let startPoint = {}
    if (this.mapData.designatedLaneStart === 'on_enter_window') {
      startPoint = this.mapData.startPoint
    } else {
      startPoint = this.mapData.afterExitPoint
    }

    const event = new CustomEvent('round-map:show-dl', {
      detail: {
        startPointPosition: new google.maps.LatLng(startPoint.lat, startPoint.lng),
        referencePointPosition: new google.maps.LatLng(
          this.mapData.referencePoint.lat,
          this.mapData.referencePoint.lng
        )
      },
      bubbles: true,
      cancelable: true
    })

    this.element.dispatchEvent(event)
  }

  drawReferencePoint() {
    new google.maps.Marker({
      position: this.mapData.referencePoint,
      map: this.map
    })
  }

  drawPolyline(path, color) {
    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    polyline.setMap(this.map)

    return polyline
  }

  drawPoint(position, color) {
    return new google.maps.Marker({
      position: position,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 5,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 1
      },
      map: this.map
    })
  }

  resize() {
    if (!this.map || !this.bounds) return

    google.maps.event.trigger(this.map, 'resize')
    this.map.fitBounds(this.bounds)
    this.map.setCenter(this.bounds.getCenter())
  }

  get bounds() {
    if (!this.mapData) return undefined
    if (this._bounds) return this._bounds

    const bounds = new google.maps.LatLngBounds()

    const startPoint = this.mapData.afterExitPoint
    let endPoint = this.mapData.endPoint
    if (this.mapData.referencePoint) endPoint = this.mapData.referencePoint

    bounds.extend(new google.maps.LatLng(Number(startPoint.lat), Number(startPoint.lng)))

    bounds.extend(new google.maps.LatLng(Number(endPoint.lat), Number(endPoint.lng)))

    this._bounds = bounds
    return this._bounds
  }

  get map() {
    return this.mapTarget.mapInstance
  }
}
