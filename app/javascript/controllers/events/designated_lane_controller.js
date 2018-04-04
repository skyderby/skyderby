import { Controller } from 'stimulus'
import DesignatedLane from 'services/designated_lane'

export default class extends Controller {
  static targets = [ 'map', 'length', 'width', 'direction' ]

  toggle(event) {
    let button = event.currentTarget
    button.blur()
    button.classList.toggle('active')

    if (button.classList.contains('active')) {
      this.enable()
    } else {
      this.disable()
    }
  }

  on_change_length(event) {
    let length = Number(event.currentTarget.value)

    this.designated_lane.set_length(length)
  }

  on_change_width(event) {
    let width = Number(event.currentTarget.value)

    this.designated_lane.set_width(width)
  }

  on_change_direction(event) {
    let direction = Number(event.currentTarget.value)

    this.designated_lane.set_direction(direction)
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
        { on_rotate: (angle) => { this.directionTarget.value = angle } }
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

  get map() {
    return this.mapTarget.map_instance
  }
}
