import { Controller } from '@hotwired/stimulus'
import { convertSpeed, convertLength, speedUnitLabel, lengthUnitLabel } from 'utils/units'

export default class extends Controller {
  static targets = [
    'altitude',
    'altitudeSpent',
    'fullSpeed',
    'fullSpeedAccel',
    'hSpeed',
    'hSpeedAccel',
    'vSpeed',
    'vSpeedAccel',
    'glideRatio',
    'angle'
  ]

  update(data, units = 'metric') {
    const { altitude, altitudeSpent, fullSpeed, hSpeed, vSpeed, glideRatio } = data
    const roundToStep = (value, step) => Math.round(value / step) * step

    this.applyUnitLabels(units)

    if (this.hasAltitudeTarget) {
      this.altitudeTarget.textContent = roundToStep(
        convertLength(altitude, units),
        10
      ).toFixed()
    }
    if (this.hasAltitudeSpentTarget && altitudeSpent !== undefined) {
      this.altitudeSpentTarget.textContent = roundToStep(
        convertLength(altitudeSpent, units),
        10
      ).toFixed()
    }
    if (this.hasFullSpeedTarget) {
      this.fullSpeedTarget.textContent = roundToStep(
        convertSpeed(fullSpeed, units),
        5
      ).toFixed()
    }
    if (this.hasHSpeedTarget) {
      this.hSpeedTarget.textContent = roundToStep(
        convertSpeed(hSpeed, units),
        5
      ).toFixed()
    }
    if (this.hasVSpeedTarget) {
      this.vSpeedTarget.textContent = roundToStep(
        convertSpeed(vSpeed, units),
        5
      ).toFixed()
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

  applyUnitLabels(units) {
    this.element.querySelectorAll('[data-unit="speed"]').forEach(el => {
      el.textContent = speedUnitLabel(units)
    })
    this.element.querySelectorAll('[data-unit="length"]').forEach(el => {
      el.textContent = lengthUnitLabel(units)
    })
  }

  updateAcceleration(data) {
    const { fullSpeedAccel, hSpeedAccel, vSpeedAccel } = data

    if (this.hasFullSpeedAccelTarget) {
      this.updateAccelIcons(this.fullSpeedAccelTarget, fullSpeedAccel)
    }
    if (this.hasHSpeedAccelTarget) {
      this.updateAccelIcons(this.hSpeedAccelTarget, hSpeedAccel)
    }
    if (this.hasVSpeedAccelTarget) {
      this.updateAccelIcons(this.vSpeedAccelTarget, vSpeedAccel)
    }
  }

  updateAccelIcons(container, acceleration) {
    const icons = container.querySelectorAll('.icon')
    icons.forEach(icon => icon.classList.remove('active'))

    const threshold = 4
    const smallThreshold = 0.5

    if (Math.abs(acceleration) < smallThreshold) {
      icons[2].classList.add('active')
    } else if (acceleration > 0) {
      icons[2].classList.add('active')
      icons[1].classList.add('active')
      if (acceleration >= threshold) {
        icons[0].classList.add('active')
      }
    } else {
      icons[2].classList.add('active')
      icons[3].classList.add('active')
      if (acceleration <= -threshold) {
        icons[4].classList.add('active')
      }
    }
  }
}
