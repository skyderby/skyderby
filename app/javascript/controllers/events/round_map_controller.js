import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import mostDistantPoint from 'utils/checkLaneViolation'

const START_POINT_COLOR = '#ff1053'
const END_POINT_COLOR = '#5FAD41'
const AFTER_EXIT_POINT_COLOR = '#124E78'

export default class extends Controller {
  static targets = ['map', 'loading_placeholder', 'competitor']

  initialize() {
    this.linesByCompetitor = {}
    this.referencePoints = {}
    this.infoWindow = undefined
  }

  connect() {
    init_maps_api()
    this.fetchData()

    this.element.addEventListener(
      'round-map-competitor-row:show-dl',
      this.showDLForCompetitor.bind(this)
    )
  }

  toggleCompetitor(event) {
    const element = event.currentTarget
    const mapValue = element.checked ? this.map : undefined
    const graphics = Object.values(
      this.linesByCompetitor[element.getAttribute('data-competitor-id')]
    )
    graphics.forEach(item => item.setMap(mapValue))
  }

  toggleGroup(event) {
    if (this.infoWindow) this.infoWindow.close()

    event.preventDefault()
    const group = event.currentTarget.closest('.round-map-group')
    const container = group.closest('.round-map-competitors')
    const allGroups = container.querySelectorAll('.round-map-group')

    allGroups.forEach(currentGroup => {
      currentGroup
        .querySelectorAll('input')
        .forEach(item => this.changeCheckState(item, currentGroup === group))
    })
  }

  changeCheckState(item, state) {
    const wasChecked = item.checked
    item.checked = state
    if (wasChecked !== item.checked) item.dispatchEvent(new Event('change'))
  }

  showDLForCompetitor(originalEvent) {
    const { reference_point_id, competitor_id } = originalEvent.detail

    if (this.infoWindow) this.infoWindow.close()

    const referencePointPosition = this.referencePoints[reference_point_id].getPosition()

    let startPointType = null
    if (this.designatedLaneStart == 'on_enter_window') {
      startPointType = 'startPoint'
    } else {
      startPointType = 'afterExitPoint'
    }

    const startPointPosition = this.linesByCompetitor[competitor_id][
      startPointType
    ].getPosition()

    this.draw_most_distant_point(competitor_id, reference_point_id)

    const event = new CustomEvent('round-map:show-dl', {
      detail: {
        start_point_position: startPointPosition,
        reference_point_position: referencePointPosition
      },
      bubbles: true,
      cancelable: true
    })

    this.element.dispatchEvent(event)
  }

  draw_most_distant_point(competitorId, referencePointId) {
    const {
      path_coordinates: path,
      after_exit_point: afterExitPoint,
      end_point: endPoint
    } = this.mapData.competitors.find(
      el => el.competitor_id.toString() === competitorId.toString()
    )

    const {
      latitude: refPointLat,
      longitude: refPointLng
    } = this.mapData.reference_points.find(
      el => el.id.toString() === referencePointId.toString()
    )

    const point = mostDistantPoint(
      path,
      afterExitPoint,
      { lat: refPointLat, lng: refPointLng },
      endPoint
    )

    if (!point) return

    if (point.distance > 300) {
      const deviation = point.distance - 300

      this.infoWindow = new google.maps.InfoWindow({
        position: { lat: point.lat, lng: point.lng },
        map: this.map,
        content: `Deviation: ${Math.round(deviation * 10) / 10}m`
      })
    }
  }

  fetchData() {
    const url = this.element.getAttribute('data-url')

    fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(this.onDataReady)
  }

  onMapsReady = () => {
    this.mapsReady = true
    this.renderMap()
  }

  onMapsFailedLoad = () => {
    this.mapsReady = false
    this.loading_placeholderTarget.innerHTML =
      '<i class="fa fa-3x fa-exclamation-triangle text-danger"></i>' +
      '<p>Failed to load Google Maps API.</p>'
  }

  onDataReady = data => {
    this.mapData = data
    this.renderMap()
  }

  renderMap() {
    if (!this.mapsReady || !this.mapData) return

    const center = new google.maps.LatLng(
      this.mapData.place.latitude,
      this.mapData.place.longitude
    )

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: center
    }

    this.mapTarget.map_instance = new google.maps.Map(this.mapTarget, options)
    this.drawRoundMap()
  }

  drawRoundMap() {
    for (let competitorData of this.mapData.competitors) {
      const input = document.querySelector(
        `input[data-competitor-id="${competitorData.competitor_id}"][type="checkbox"]`
      )
      const visibility = input.checked

      const polyline = this.drawPolyline(
        competitorData.path_coordinates,
        competitorData.color,
        visibility
      )

      const hoverPolyline = this.drawHoverPolyline(
        competitorData.path_coordinates,
        competitorData.color,
        competitorData.competitor_id,
        visibility
      )

      const startPoint = this.drawPoint(
        competitorData.start_point,
        START_POINT_COLOR,
        visibility
      )

      const endPoint = this.drawPoint(
        competitorData.end_point,
        END_POINT_COLOR,
        visibility
      )

      const afterExitPoint = this.drawPoint(
        competitorData.after_exit_point,
        AFTER_EXIT_POINT_COLOR,
        visibility
      )

      this.linesByCompetitor[competitorData.competitor_id] = {
        polyline,
        hoverPolyline,
        afterExitPoint,
        startPoint,
        endPoint
      }
    }

    this.drawReferencePoints()

    this.resize()
  }

  drawReferencePoints() {
    for (let referencePoint of this.mapData.reference_points) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          referencePoint.latitude,
          referencePoint.longitude
        ),
        map: this.map
      })

      this.referencePoints[referencePoint.id] = marker
    }
  }

  drawPolyline(path, color, visibility) {
    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    polyline.setMap(visibility ? this.map : undefined)

    return polyline
  }

  drawHoverPolyline(path, color, id, visibility) {
    const hoverPolyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 0.0001,
      strokeWeight: 15
    })

    hoverPolyline.setMap(visibility ? this.map : undefined)

    google.maps.event.addListener(hoverPolyline, 'mouseover', () => {
      document
        .querySelectorAll(`.round-map-competitor[data-competitor-id="${id}"]`)
        .forEach(el => (el.style.backgroundColor = '#BCE7FD'))
    })

    google.maps.event.addListener(hoverPolyline, 'mouseout', () => {
      document
        .querySelectorAll(`.round-map-competitor[data-competitor-id="${id}"]`)
        .forEach(el => (el.style.backgroundColor = 'transparent'))
    })

    return hoverPolyline
  }

  drawPoint(position, color, visibility) {
    return new google.maps.Marker({
      position: position,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 5,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 1
      },
      map: visibility ? this.map : undefined
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

    const competitorData = this.mapData.competitors

    const startLats = competitorData.map(el => el.start_point.lat)
    const startLons = competitorData.map(el => el.start_point.lng)
    const endLats = competitorData.map(el => el.end_point.lat)
    const endLons = competitorData.map(el => el.end_point.lng)

    const latBounds = startLats.concat(endLats)
    const lonBounds = startLons.concat(endLons)

    latBounds.sort()
    lonBounds.sort()

    const bounds = new google.maps.LatLngBounds()

    bounds.extend(new google.maps.LatLng(Number(latBounds[0]), Number(lonBounds[0])))

    bounds.extend(
      new google.maps.LatLng(
        Number(latBounds[latBounds.length - 1]),
        Number(lonBounds[lonBounds.length - 1])
      )
    )

    this._bounds = bounds
    return this._bounds
  }

  get designatedLaneStart() {
    return this.element.getAttribute('data-dl-start')
  }

  get map() {
    return this.mapTarget.map_instance
  }
}
