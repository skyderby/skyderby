import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'profile' ]

  toggle(event) {
    if (event.target.checked) {
      this.on_track_checked()
    } else {
      this.on_track_unchecked()
    }
  }

  on_track_checked() {
    this.fetch_flight_profile()
      .then( (data) => { this.dispatch_check(data) })
  }

  fetch_flight_profile() {
    return new Promise((resolve) => {
      if (this.cached_flight_profile) {
        resolve(this.cached_flight_profile)
      } else {
        $.get('/tracks/' + this.track_id + '/flight_profile')
          .done( data => {
            this.cached_flight_profile = data
            resolve(data)
          })
      }
    })
  }

  dispatch_check(data) {
    const event = new CustomEvent('flight-profiles:track-checked', {
      detail: {
        track_id: this.track_id,
        name: `${this.name} - ${this.track_id}`,
        flight_profile: data
      },
      bubbles: true
    })
    this.element.dispatchEvent(event)
  }

  on_track_unchecked() {
    const event = new CustomEvent('flight-profiles:track-unchecked', {
      detail: {
        track_id: this.track_id
      },
      bubbles: true
    })
    this.element.dispatchEvent(event)
  }

  get track_id() {
    return this.element.getAttribute('data-track-id')
  }

  get name() {
    return this.profileTarget.innerText
  }
}
