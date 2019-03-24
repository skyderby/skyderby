import { Controller } from 'stimulus'
import DesignatedLane from 'utils/designated_lane'
import Geospatial from 'utils/geospatial'

const DEFAULT_DL_DIRECTION = 0
const DEFAULT_DL_LENGTH = 7000
const DEFAULT_DL_WIDTH = 1200

export default class extends Controller {
  static targets = [ 'map', 'button', 'length', 'width', 'direction' ]

  connect() {
    this.directionTarget.value = localStorage.last_used_dl_direction || DEFAULT_DL_DIRECTION
    this.lengthTarget.value = localStorage.last_used_dl_length || DEFAULT_DL_LENGTH
    this.widthTarget.value = localStorage.last_used_dl_width || DEFAULT_DL_WIDTH
  }

  toggle() {
    this.button.blur()
    this.button.classList.toggle('active')

    this.toggle_dl()
  }

  on_change_length(event) {
    let length = Number(event.currentTarget.value)
    localStorage.last_used_dl_length = length

    this.designated_lane.set_length(length)
  }

  on_change_width(event) {
    let width = Number(event.currentTarget.value)
    localStorage.last_used_dl_width = width

    this.designated_lane.set_width(width)
  }

  on_change_direction(event) {
    let direction = Number(event.currentTarget.value)
    localStorage.last_used_dl_direction = direction

    this.designated_lane.set_direction(direction)
  }

  show_dl(event) {
    const { reference_point_position, start_point_position } = event.detail
    const middle_point_lat = (start_point_position.lat() + reference_point_position.lat()) / 2
    const middle_point_lon = (start_point_position.lng() + reference_point_position.lng()) / 2
    const direction = Geospatial.bearing(middle_point_lat, middle_point_lon, reference_point_position.lat(), reference_point_position.lng())
    this.directionTarget.value = Math.round(direction * 10) / 10

    const set_dl_position = () => {
      this.designated_lane.set_position(middle_point_lat, middle_point_lon)
      this.designated_lane.set_direction(direction)
    }

    if (!this.button.classList.contains('active')) {
      this.mapTarget.addEventListener('map:dl-shown', set_dl_position, { once: true })

      this.button.classList.add('active')
      this.enable()
    } else {
      set_dl_position()
    }
  }

  toggle_dl() {
    if (this.button.classList.contains('active')) {
      this.enable()
    } else {
      this.disable()
    }
  }

  enable() {
    this.lengthTarget.disabled = false
    this.widthTarget.disabled = false
    this.directionTarget.disabled = false

    if (!this.designated_lane) {
      this.designated_lane = new DesignatedLane(
        google,
        this.map,
        this.widthTarget.value,
        this.lengthTarget.value,
        this.directionTarget.value,
        {
          on_rotate: (angle) => {
            this.directionTarget.value = angle
            localStorage.last_used_dl_direction = angle
          }
        }
      )
    }

    this.designated_lane.show()
  }

  disable() {
    this.lengthTarget.disabled = true
    this.widthTarget.disabled = true
    this.directionTarget.disabled = true

    this.designated_lane.hide()
  }

  get button() {
    return this.buttonTarget
  }

  get map() {
    return this.mapTarget.map_instance
  }
}
