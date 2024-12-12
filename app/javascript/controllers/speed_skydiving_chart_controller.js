import { Controller } from 'stimulus'

export default class SpeedSkydivingChart extends Controller {
  connect() {
    this.trackId = this.element.getAttribute('data-track-id')
    this.fetchPoints(this.trackId).then(this.initChart)
  }

  fetchPoints(trackId) {
    return fetch(`/tracks/${trackId}/points`).then(response => response.json())
  }

  initChart(points) {
    console.log(points)
  }
}
