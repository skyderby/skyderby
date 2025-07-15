import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static outlets = ['map']
  static targets = ['latitude', 'longitude', 'name']

  connect() {
    const readOnly = this.element.getAttribute('data-readonly') === 'true'

    this.mapOutlet
      .createMarker(
        this.latitudeTarget.value,
        this.longitudeTarget.value,
        this.nameTarget.value,
        readOnly
      )
      .then(marker => {
        this.marker = marker
        marker.addListener('dragend', () => {
          const position = marker.position
          this.latitudeTarget.value = position.lat
          this.longitudeTarget.value = position.lng

          this.element.requestSubmit()
        })
      })
  }

  disconnect() {
    if (this.marker && this.hasMapOutlet) {
      this.mapOutlet.removeMarker(this.marker)
    }
  }

  onNameChange() {
    const pin = this.marker.pin
    pin.glyph = this.nameTarget.value

    this.marker.content = pin.element

    this.element.requestSubmit()
  }

  onPositionChange() {
    this.marker.position = {
      lat: Number(this.latitudeTarget.value),
      lng: Number(this.longitudeTarget.value)
    }

    this.element.requestSubmit()
  }
}
