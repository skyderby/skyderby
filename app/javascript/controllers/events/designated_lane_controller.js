import { Controller } from '@hotwired/stimulus'
import DesignatedLane from 'utils/designatedLane'
import Geospatial from 'utils/geospatial'

const DEFAULT_DL_DIRECTION = 0
const DEFAULT_DL_LENGTH = 7000
const DEFAULT_DL_WIDTH = 1200

export default class extends Controller {
  static targets = ['map', 'button', 'length', 'width', 'direction']

  connect() {
    this.directionTarget.value = localStorage.lastUsedDlDirection || DEFAULT_DL_DIRECTION
    this.lengthTarget.value = localStorage.lastUsedDlLength || DEFAULT_DL_LENGTH
    this.widthTarget.value = localStorage.lastUsedDlWidth || DEFAULT_DL_WIDTH
  }

  toggle() {
    this.button.blur()
    this.button.classList.toggle('active')

    this.toggleDl()
  }

  onChangeLength(event) {
    const length = Number(event.currentTarget.value)
    localStorage.lastUsedDlLength = length

    this.designatedLane.setLength(length)
  }

  onChangeWidth(event) {
    const width = Number(event.currentTarget.value)
    localStorage.lastUsedDlWidth = width

    this.designatedLane.setWidth(width)
  }

  onChangeDirection(event) {
    const direction = Number(event.currentTarget.value)
    localStorage.lastUsedDlDirection = direction

    this.designatedLane.setDirection(direction)
  }

  showDl(event) {
    const { referencePointPosition, startPointPosition } = event.detail
    const middlePointLat = (startPointPosition.lat() + referencePointPosition.lat()) / 2
    const middlePointLon = (startPointPosition.lng() + referencePointPosition.lng()) / 2
    const direction = Geospatial.bearing(
      middlePointLat,
      middlePointLon,
      referencePointPosition.lat(),
      referencePointPosition.lng()
    )
    this.directionTarget.value = Math.round(direction * 10) / 10

    const setDlPosition = () => {
      this.designatedLane.setPosition(middlePointLat, middlePointLon)
      this.designatedLane.setDirection(direction)
    }

    if (!this.button.classList.contains('active')) {
      this.mapTarget.addEventListener('map:dl-shown', setDlPosition, { once: true })

      this.button.classList.add('active')
      this.enable()
    } else {
      setDlPosition()
    }
  }

  toggleDl() {
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

    if (!this.designatedLane) {
      this.designatedLane = new DesignatedLane(
        google,
        this.map,
        this.widthTarget.value,
        this.lengthTarget.value,
        this.directionTarget.value,
        {
          onRotate: angle => {
            this.directionTarget.value = angle
            localStorage.lastUsedDlDirection = angle
          }
        }
      )
    }

    this.designatedLane.show()
  }

  disable() {
    this.lengthTarget.disabled = true
    this.widthTarget.disabled = true
    this.directionTarget.disabled = true

    this.designatedLane.hide()
  }

  get button() {
    return this.buttonTarget
  }

  get map() {
    return this.mapTarget.mapInstance
  }
}
