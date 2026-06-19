import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = { units: String }
  static outlets = ['tracks--skydive-track']

  tracksSkydiveTrackOutletConnected(outlet) {
    outlet.applyUnits(this.unitsValue)
  }
}
