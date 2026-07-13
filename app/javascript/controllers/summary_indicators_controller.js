import { Controller } from '@hotwired/stimulus'
import { convertSpeed, convertLength, speedUnitLabel, lengthUnitLabel } from 'utils/units'

export default class extends Controller {
  static targets = [
    'distance',
    'groundSpeed',
    'groundSpeedMin',
    'groundSpeedMax',
    'glideRatio',
    'glideRatioMin',
    'glideRatioMax',
    'elevation',
    'verticalSpeed',
    'verticalSpeedMin',
    'verticalSpeedMax',
    'duration',
    'windEffectContainerDistance',
    'windEffectDistance',
    'windEffectDistanceWind',
    'windEffectDistancePercent',
    'windEffectDistanceWindPercent',
    'windEffectContainerSpeed',
    'windEffectSpeed',
    'windEffectSpeedWind',
    'windEffectSpeedPercent',
    'windEffectSpeedWindPercent',
    'windEffectContainerGlideRatio',
    'windEffectGlideRatio',
    'windEffectGlideRatioWind',
    'windEffectGlideRatioPercent',
    'windEffectGlideRatioWindPercent'
  ]

  update(summary, units = 'metric') {
    if (!summary) return

    this.applyUnitLabels(units)

    const speed = value => convertSpeed(value, units)
    const length = value => convertLength(value, units)

    this.setText('distance', Math.floor(length(summary.distance)))
    this.setText('glideRatio', this.formatGlideRatio(summary.glideRatio.avg))
    this.setText('glideRatioMin', this.formatGlideRatio(summary.glideRatio.min))
    this.setText('glideRatioMax', this.formatGlideRatio(summary.glideRatio.max))
    this.setText('groundSpeed', speed(summary.horizontalSpeed.avg).toFixed(0))
    this.setText('groundSpeedMin', speed(summary.horizontalSpeed.min).toFixed(0))
    this.setText('groundSpeedMax', speed(summary.horizontalSpeed.max).toFixed(0))
    this.setText('elevation', length(summary.elevation).toFixed(0))
    this.setText('verticalSpeed', speed(summary.verticalSpeed.avg).toFixed(0))
    this.setText('verticalSpeedMin', speed(summary.verticalSpeed.min).toFixed(0))
    this.setText('verticalSpeedMax', speed(summary.verticalSpeed.max).toFixed(0))
    this.setText('duration', summary.time.toFixed(1))

    this.updateWindEffect('Distance', summary.distanceWindEffect, 0, length)
    this.updateWindEffect('Speed', summary.horizontalSpeedWindEffect, 0, speed)
    this.updateWindEffect('GlideRatio', summary.glideRatioWindEffect, 2)
  }

  updateWindEffect(key, effect, decimals, convert = value => value) {
    if (!effect || effect.value === null) return
    if (!this[`hasWindEffectContainer${key}Target`]) return

    this[`windEffectContainer${key}Target`].style.display = ''

    this[`windEffect${key}Target`].innerText = convert(effect.value).toFixed(decimals)
    this[`windEffect${key}WindTarget`].innerText =
      effect.windEffect > 0
        ? `+${convert(effect.windEffect).toFixed(decimals)}`
        : convert(effect.windEffect).toFixed(decimals)

    const absPercent = Math.abs(effect.windEffectPercent)
    const clampedValuePercent = Math.max(0, Math.min(100, 100 - absPercent))
    const clampedWindPercent = Math.max(0, Math.min(100, absPercent))

    this[`windEffect${key}PercentTarget`].style.width = `${clampedValuePercent}%`
    this[`windEffect${key}WindPercentTarget`].style.width = `${clampedWindPercent}%`
  }

  applyUnitLabels(units) {
    this.element.querySelectorAll('[data-unit="speed"]').forEach(el => {
      el.textContent = speedUnitLabel(units)
    })
    this.element.querySelectorAll('[data-unit="length"]').forEach(el => {
      el.textContent = lengthUnitLabel(units)
    })
  }

  setText(name, value) {
    const cap = name[0].toUpperCase() + name.slice(1)
    if (this[`has${cap}Target`]) {
      this[`${name}Target`].innerText = value
    }
  }

  formatGlideRatio(value) {
    if (value === null || value === undefined || !isFinite(value)) return '--'
    if (value >= 10) return '≥ 10'
    return value.toFixed(2)
  }
}
