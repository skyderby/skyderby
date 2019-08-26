import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const START_POINT_COLOR = '#ff1053'
const END_POINT_COLOR = '#5FAD41'
const AFTER_EXIT_POINT_COLOR = '#124E78'
const LINE_COLOR = '#7cb5ec'

const MAPS_API_FAIL_TEMPLATE = `
  <i class="fa fa-3x fa-exclamation-triangle text-danger"></i>
  <p>Failed to load Google Maps API.</p>
`

export default class extends Controller {
  static targets = ['map', 'loading_placeholder']

  connect() {
    init_maps_api()
    this.fetch_data()
  }

  fetch_data() {
    const url = this.element.getAttribute('data-url')
    fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    })
      .then(response => {
        return response.json()
      })
      .then(this.on_data_ready)
  }

  on_maps_ready = () => {
    this.maps_ready = true
    this.render_map()
  }

  on_maps_failed_load = () => {
    this.maps_ready = false
    this.loading_placeholderTarget.innerHTML = MAPS_API_FAIL_TEMPLATE
  }

  on_data_ready = data => {
    this.map_data = data
    this.render_map()
  }

  render_map() {
    if (!this.maps_ready || !this.map_data) return

    const {
      place: { latitude, longitude }
    } = this.map_data
    var center = new google.maps.LatLng(latitude, longitude)

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: center
    }

    this.mapTarget.map_instance = new google.maps.Map(this.mapTarget, options)
    this.draw_map()
  }

  draw_map() {
    this.draw_polyline(this.map_data.path_coordinates, LINE_COLOR)

    this.draw_point(this.map_data.start_point, START_POINT_COLOR)
    this.draw_point(this.map_data.end_point, END_POINT_COLOR)
    this.draw_point(this.map_data.after_exit_point, AFTER_EXIT_POINT_COLOR)

    this.draw_most_distant_point()

    this.show_designated_lane()

    this.resize()
  }

  draw_most_distant_point() {
    const {
      after_exit_point,
      reference_point,
      end_point,
      path_coordinates
    } = this.map_data

    if (!after_exit_point || !reference_point) return

    const enterLaneCoordinates = new LatLon(after_exit_point.lat, after_exit_point.lng)
    const referencePointCoordinate = new LatLon(reference_point.lat, reference_point.lng)
    const distanceFromExitToReferencePoint = enterLaneCoordinates.distanceTo(
      referencePointCoordinate
    )

    const enterLaneTime = Date.parse(after_exit_point.gpsTime)
    const leaveWindowTime = Date.parse(end_point.gpsTime)

    const pointsWithDistancesToCenterline = path_coordinates.map(point => {
      const gpsTime = Date.parse(point.gpsTime)
      if (gpsTime < enterLaneTime || gpsTime > leaveWindowTime) {
        return { ...point, distanceToCenterLine: 0 }
      }

      const coordinates = new LatLon(point.lat, point.lng)

      const distanceFromEnterLane = coordinates.distanceTo(enterLaneCoordinates)
      const distanceToReferencePoint = coordinates.distanceTo(referencePointCoordinate)

      const halfPerimeter =
        (distanceFromExitToReferencePoint +
          distanceFromEnterLane +
          distanceToReferencePoint) /
        2

      const distanceToCenterLine =
        (2 *
          Math.sqrt(
            halfPerimeter *
              (halfPerimeter - distanceFromExitToReferencePoint) *
              (halfPerimeter - distanceFromEnterLane) *
              (halfPerimeter - distanceToReferencePoint)
          )) /
        distanceFromExitToReferencePoint

      return { ...point, distanceToCenterLine }
    })

    const mostDistantPoint = pointsWithDistancesToCenterline.reduce(
      (max, current) =>
        current.distanceToCenterLine > max.distanceToCenterLine ? current : max,
      pointsWithDistancesToCenterline[0]
    )

    if (mostDistantPoint.distanceToCenterLine > 300) {
      const deviation = mostDistantPoint.distanceToCenterLine - 300
      const { lat, lng } = mostDistantPoint

      new google.maps.InfoWindow({
        position: { lat, lng },
        map: this.map,
        content: `Deviation: ${Math.round(deviation * 10) / 10}m`
      })
    }
  }

  show_designated_lane() {
    if (!this.map_data.reference_point) return

    this.draw_reference_point()

    let start_point = {}
    if (this.map_data.designated_lane_start === 'designated_lane_start_on_enter_window') {
      start_point = this.map_data.start_point
    } else {
      start_point = this.map_data.after_exit_point
    }

    const event = new CustomEvent('round-map:show-dl', {
      detail: {
        start_point_position: new google.maps.LatLng(start_point.lat, start_point.lng),
        reference_point_position: new google.maps.LatLng(
          this.map_data.reference_point.lat,
          this.map_data.reference_point.lng
        )
      },
      bubbles: true,
      cancelable: true
    })

    this.element.dispatchEvent(event)
  }

  draw_reference_point() {
    new google.maps.Marker({
      position: this.map_data.reference_point,
      map: this.map
    })
  }

  draw_polyline(path, color) {
    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    polyline.setMap(this.map)

    return polyline
  }

  draw_point(position, color) {
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
    if (!this.map_data) return undefined
    if (this._bounds) return this._bounds

    const bounds = new google.maps.LatLngBounds()

    const start_point = this.map_data.after_exit_point
    let end_point = this.map_data.end_point
    if (this.map_data.reference_point) end_point = this.map_data.reference_point

    bounds.extend(
      new google.maps.LatLng(Number(start_point.lat), Number(start_point.lng))
    )

    bounds.extend(new google.maps.LatLng(Number(end_point.lat), Number(end_point.lng)))

    this._bounds = bounds
    return this._bounds
  }

  get map() {
    return this.mapTarget.map_instance
  }
}
