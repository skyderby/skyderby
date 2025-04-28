import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static outlets = ['events--reference-points-map']
  static targets = ['latitude', 'longitude', 'name']

  connect() {
    const readOnly = this.element.getAttribute('data-readonly') === 'true'

    this.eventsReferencePointsMapOutlet
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
    if (this.marker && this.hasEventsReferencePointsMapOutlet) {
      this.eventsReferencePointsMapOutlet.removeMarker(this.marker)
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
