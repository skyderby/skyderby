import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['chart']

  connect() {
    this.element.addEventListener(
      'flight-profiles:track-checked',
      this.addTrack.bind(this)
    )
    this.element.addEventListener(
      'flight-profiles:track-unchecked',
      this.removeTrack.bind(this)
    )
    this.element.addEventListener(
      'flight-profiles:line-selected',
      this.showJumpProfile.bind(this)
    )
    this.element.addEventListener(
      'flight-profiles:line-unselected',
      this.removeJumpProfile.bind(this)
    )
  }

  addTrack(event) {
    this.chart.addTrack(event.detail)
  }

  removeTrack(event) {
    this.chart.removeTrack(event.detail.trackId)
  }

  showJumpProfile(event) {
    const { name, measurements } = event.detail
    this.chart.showJumpProfile(name, measurements)
  }

  removeJumpProfile() {
    this.chart.removeJumpProfile()
  }

  get chart() {
    return this.application.getControllerForElementAndIdentifier(
      this.chartTarget,
      'flight-profiles--chart'
    )
  }
}
