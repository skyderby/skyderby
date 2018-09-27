import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'profile', 'place' ]

  toggle(event) {
    if (event.target.checked) {
      this.onTrackChecked()
    } else {
      this.onTrackUnchecked()
    }
  }

  onTrackChecked() {
    this.fetchFlightProfile()
      .then( (data) => { this.dispatchCheck(data) })
  }

  fetchFlightProfile() {
    return new Promise((resolve) => {
      if (this.cachedFlightProfile) {
        resolve(this.cachedFlightProfile)
      } else {
        $.get('/tracks/' + this.trackId + '/flight_profile')
          .done( data => {
            this.cachedFlightProfile = data
            resolve(data)
          })
      }
    })
  }

  dispatchCheck(data) {
    const event = new CustomEvent('flight-profiles:track-checked', {
      detail: {
        trackId: this.trackId,
        name: `${this.name} - ${this.trackId}`,
        place: this.place,
        flightProfile: data
      },
      bubbles: true
    })
    this.element.dispatchEvent(event)
  }

  onTrackUnchecked() {
    const event = new CustomEvent('flight-profiles:track-unchecked', {
      detail: {
        trackId: this.trackId
      },
      bubbles: true
    })
    this.element.dispatchEvent(event)
  }

  get trackId() {
    return this.element.getAttribute('data-track-id')
  }

  get name() {
    return this.profileTarget.innerText
  }

  get place() {
    return this.placeTarget.innerText.trim()
  }
}
