import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['altitude', 'fullSpeed', 'hSpeed', 'vSpeed', 'glideRatio', 'angle']

  update(data) {
    const { altitude, fullSpeed, hSpeed, vSpeed, glideRatio } = data
    const roundToStep = (value, step) => Math.round(value / step) * step

    if (this.hasAltitudeTarget) {
      this.altitudeTarget.textContent = roundToStep(altitude, 10).toFixed()
    }
    if (this.hasFullSpeedTarget) {
      this.fullSpeedTarget.textContent = roundToStep(fullSpeed, 5).toFixed()
    }
    if (this.hasHSpeedTarget) {
      this.hSpeedTarget.textContent = roundToStep(hSpeed, 5).toFixed()
    }
    if (this.hasVSpeedTarget) {
      this.vSpeedTarget.textContent = roundToStep(vSpeed, 5).toFixed()
    }
    if (this.hasGlideRatioTarget) {
      this.glideRatioTarget.textContent = (glideRatio ?? 0).toFixed(1)
    }
    if (this.hasAngleTarget) {
      const angle = (90 * Math.PI) / 180 - Math.atan2(vSpeed, hSpeed)
      const startX = 15 * Math.sin(angle)
      const startY = 115 + 15 * Math.cos(angle)
      const endX = 65 * Math.sin(angle)
      const endY = 115 + 65 * Math.cos(angle)
      this.angleTarget.setAttribute('d', `M ${startX} ${startY} ${endX} ${endY}`)
    }
  }
}
