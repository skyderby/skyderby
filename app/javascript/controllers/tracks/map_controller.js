import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'

export default class extends Controller {
  static targets = [ 'map', 'placeholder', 'data_loading_status', 'maps_loading_status' ]

  connect() {
    if (this.element.getAttribute('data-ready')) return

    init_maps_api()
    this.fetch_data()

    this.element.setAttribute('data-ready', true)
  }

  fetch_data() {
    fetch(this.element.getAttribute('data-url'), {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    }).then( response => { return response.json() } )
      .then( data => {
        this.maps_data = data
        this.set_data_loading_success()
        this.render_map()
      })
  }

  render_map() {
    if (!this.maps_ready || !this.maps_data) return

    this.hide_placeholder()

    this.draw_trajectory(this.maps_data.points, { stroke_opacity: 1, stroke_weight: 6 })
    this.draw_trajectory(this.maps_data.zerowind_points, { stroke_opacity: 0.4, stroke_weight: 7 })

    this.fit_bounds()
  }

  draw_trajectory(points, opts) {
    let trajectory = new Trajectory(points)

    for (let { path, color } of trajectory.polylines) {
      this.create_polyline(path, color, opts)
    }
  }

  create_polyline(path, color, opts) {
    let polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: opts.stroke_opacity,
      strokeWeight: opts.stroke_weight
    })

    polyline.setMap(this.map)
  }

  fit_bounds() {
    let bounds = new Bounds(this.maps_data.points)
    let map_bounds = new google.maps.LatLngBounds()

    map_bounds.extend(new google.maps.LatLng(bounds.min_latitude, bounds.min_longitude))
    map_bounds.extend(new google.maps.LatLng(bounds.max_latitude, bounds.max_longitude))

    this.map.fitBounds(map_bounds)
    this.map.setCenter(map_bounds.getCenter())
  }

  on_maps_ready() {
    this.maps_ready = true
    this.set_maps_loading_success()
    this.init_map()
    this.render_map()
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

  get maps_options() {
    return {
      'zoom': 2,
      'center': new google.maps.LatLng(20, 20),
      'mapTypeId': 'terrain'
    }
  }
}
