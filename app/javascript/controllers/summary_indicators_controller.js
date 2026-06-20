import { Controller } from '@hotwired/stimulus'

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

  update(summary) {
    if (!summary) return

    this.setText('distance', Math.floor(summary.distance))
    this.setText('glideRatio', this.formatGlideRatio(summary.glideRatio.avg))
    this.setText('glideRatioMin', this.formatGlideRatio(summary.glideRatio.min))
    this.setText('glideRatioMax', this.formatGlideRatio(summary.glideRatio.max))
    this.setText('groundSpeed', summary.horizontalSpeed.avg.toFixed(0))
    this.setText('groundSpeedMin', summary.horizontalSpeed.min.toFixed(0))
    this.setText('groundSpeedMax', summary.horizontalSpeed.max.toFixed(0))
    this.setText('elevation', summary.elevation.toFixed(0))
    this.setText('verticalSpeed', summary.verticalSpeed.avg.toFixed(0))
    this.setText('verticalSpeedMin', summary.verticalSpeed.min.toFixed(0))
    this.setText('verticalSpeedMax', summary.verticalSpeed.max.toFixed(0))
    this.setText('duration', summary.time.toFixed(1))

    this.updateWindEffect('Distance', summary.distanceWindEffect, 0)
    this.updateWindEffect('Speed', summary.horizontalSpeedWindEffect, 0)
    this.updateWindEffect('GlideRatio', summary.glideRatioWindEffect, 2)
  }

  updateWindEffect(key, effect, decimals) {
    if (!effect || effect.value === null) return
    if (!this[`hasWindEffectContainer${key}Target`]) return

    this[`windEffectContainer${key}Target`].style.display = ''

    this[`windEffect${key}Target`].innerText = effect.value.toFixed(decimals)
    this[`windEffect${key}WindTarget`].innerText =
      effect.windEffect > 0
        ? `+${effect.windEffect.toFixed(decimals)}`
        : effect.windEffect.toFixed(decimals)

    const absPercent = Math.abs(effect.windEffectPercent)
    const clampedValuePercent = Math.max(0, Math.min(100, 100 - absPercent))
    const clampedWindPercent = Math.max(0, Math.min(100, absPercent))

    this[`windEffect${key}PercentTarget`].style.width = `${clampedValuePercent}%`
    this[`windEffect${key}WindPercentTarget`].style.width = `${clampedWindPercent}%`
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
