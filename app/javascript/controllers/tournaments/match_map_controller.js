import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import FinishLine from 'utils/tournaments/map/finish_line'
import CenterLine from 'utils/tournaments/map/center_line'
import Bounds from 'utils/tournaments/map/bounds'

const FINISH_LINE_COLOR = '#E84855'
const CENTER_LINE_COLOR = '#E84855'

export default class extends Controller {
  static targets = ['map', 'placeholder', 'data_loading_status', 'maps_loading_status']
  connect() {
    init_maps_api()
    this.fetch_data()
  }

  fetch_data() {
    fetch(this.element.getAttribute('data-url'), {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.maps_data = data
        this.set_data_loading_success()
        this.render_map()
      })
  }

  on_maps_api_ready() {
    this.maps_ready = true
    this.set_maps_loading_success()
    this.init_map()
    this.render_map()
  }

  render_map() {
    if (!this.maps_ready || !this.maps_data) return

    this.hide_placeholder()

    this.draw_finish_line()
    this.draw_center_line()

    for (let competitor_data of this.maps_data.competitors) {
      this.draw_trajectory(competitor_data.path, competitor_data.color)
    }

    this.fit_bounds()
  }

  draw_finish_line() {
    new google.maps.Polyline({
      path: this.finish_line.path,
      geodesic: true,
      strokeColor: FINISH_LINE_COLOR,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    })
  }

  draw_center_line() {
    new google.maps.Polyline({
      path: this.center_line.path,
      geodesic: true,
      strokeColor: CENTER_LINE_COLOR,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    })
  }

  draw_trajectory(path, color) {
    new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3,
      map: this.map
    })
  }

  fit_bounds() {
    const map_bounds = new google.maps.LatLngBounds()

    map_bounds.extend(
      new google.maps.LatLng(this.bounds.min_latitude, this.bounds.min_longitude)
    )
    map_bounds.extend(
      new google.maps.LatLng(this.bounds.max_latitude, this.bounds.max_longitude)
    )

    this.map.fitBounds(map_bounds)
    this.map.setCenter(map_bounds.getCenter())
  }

  init_map() {
    this.map = new google.maps.Map(this.mapTarget, this.maps_options)
  }

  hide_placeholder() {
    this.placeholderTarget.style.display = 'none'
  }

  on_maps_load_failed() {
    this.maps_ready = false
    this.set_maps_loading_failed()
  }

  set_data_loading_success() {
    this.data_loading_statusTarget.classList.remove('fa-spin', 'fa-circle-notch')
    this.data_loading_statusTarget.classList.add('fa-check')
  }

  set_maps_loading_success() {
    this.maps_loading_statusTarget.classList.remove('fa-spin', 'fa-circle-notch')
    this.maps_loading_statusTarget.classList.add('fa-check')
  }

  set_maps_loading_failed() {
    this.maps_loading_statusTarget.classList.remove('fa-spin', 'fa-circle-notch')
    this.maps_loading_statusTarget.classList.add('fa-exclamation-triange')
  }

  get center_line() {
    if (!this._center_line)
      this._center_line = new CenterLine(this.finish_line, this.maps_data.exit_point)

    return this._center_line
  }

  get finish_line() {
    if (!this._finish_line) this._finish_line = new FinishLine(this.maps_data.finish_line)

    return this._finish_line
  }

  get bounds() {
    if (!this._bounds) this._bounds = new Bounds(this.maps_data.competitors)

    return this._bounds
  }

  get maps_options() {
    return {
      zoom: 2,
      center: new google.maps.LatLng(26.703115, 22.08518),
      mapTypeId: 'terrain'
    }
  }
}
