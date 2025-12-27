import { Controller } from '@hotwired/stimulus'
import I18n from 'i18n'
import {
  findPositionForAltitude,
  initAccuracyChart,
  initGlideChart,
  initSpeedsChart,
  initAltitudeDistanceChart,
  initCombinedChart
} from 'charts'
import cropPoints from 'utils/cropPoints'
import RangeSummary from 'charts/RangeSummary'

export default class PerformanceFlyingChartsController extends Controller {
  static targets = [
    'accuracyChart',
    'glideChart',
    'speedChart',
    'altitudeDistanceChart',
    'combinedChart',
    // Track indicators targets
    'distance',
    'groundSpeed',
    'groundSpeedMax',
    'groundSpeedMin',
    'glideRatio',
    'glideRatioMax',
    'glideRatioMin',
    'elevation',
    'verticalSpeed',
    'verticalSpeedMax',
    'verticalSpeedMin',
    'duration',
    // Wind effect targets
    'windEffectContainerDistance',
    'windEffectDistancePercent',
    'windEffectDistanceWindPercent',
    'windEffectDistance',
    'windEffectDistanceWind',
    'windEffectContainerSpeed',
    'windEffectSpeedPercent',
    'windEffectSpeedWindPercent',
    'windEffectSpeed',
    'windEffectSpeedWind',
    'windEffectContainerGlideRatio',
    'windEffectGlideRatioPercent',
    'windEffectGlideRatioWindPercent',
    'windEffectGlideRatio',
    'windEffectGlideRatioWind'
  ]

  connect() {
    this.trackId = this.element.dataset.trackId
    this.result = Number(this.element.dataset.result)
    this.exitAltitude = Number(this.element.dataset.exitAltitude)
    this.windowStartAltitude = Number(this.element.dataset.windowStart)
    this.windowEndAltitude = Number(this.element.dataset.windowEnd)
    this.chartType = this.element.dataset.chartType
    const initCharts =
      this.chartType === 'separate'
        ? this.initSeparateCharts.bind(this)
        : this.initCombinedCharts.bind(this)

    this.fetchPoints(this.trackId).then(data => {
      this.points = data.points
      this.windowPoints = cropPoints(
        this.points,
        this.windowStartAltitude,
        this.windowEndAltitude
      )
      this.rangeSummary = new RangeSummary(this.windowPoints, { straightLine: true })
      this.windCancellation = data.windCancellation

      initCharts()
      this.updateTrackIndicators()
    })
  }

  fetchPoints(trackId) {
    return fetch(`/tracks/${trackId}/points?original_frequency=true`, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        data.points.forEach(point => {
          point.gpsTime = new Date(point.gpsTime)
          point.hSpeed = point.hSpeed * 3.6
          point.vSpeed = point.vSpeed * 3.6
          point.fullSpeed = point.fullSpeed * 3.6
          if (point.zerowindHSpeed) point.zerowindHSpeed = point.zerowindHSpeed * 3.6
        })

        return data
      })
  }

  updateTrackIndicators() {
    this.distanceTarget.innerText = Math.floor(this.rangeSummary.distance)
    this.glideRatioTarget.innerText = this.formatGlideRatio(this.rangeSummary.glideRatio.avg)
    this.glideRatioMinTarget.innerText = this.formatGlideRatio(this.rangeSummary.glideRatio.min)
    this.glideRatioMaxTarget.innerText = this.formatGlideRatio(this.rangeSummary.glideRatio.max)
    this.groundSpeedTarget.innerText = this.rangeSummary.horizontalSpeed.avg.toFixed(0)
    this.groundSpeedMinTarget.innerText = this.rangeSummary.horizontalSpeed.min.toFixed(0)
    this.groundSpeedMaxTarget.innerText = this.rangeSummary.horizontalSpeed.max.toFixed(0)
    this.elevationTarget.innerText = this.rangeSummary.elevation.toFixed(0)
    this.verticalSpeedTarget.innerText = this.rangeSummary.verticalSpeed.avg.toFixed(0)
    this.verticalSpeedMinTarget.innerText = this.rangeSummary.verticalSpeed.min.toFixed(0)
    this.verticalSpeedMaxTarget.innerText = this.rangeSummary.verticalSpeed.max.toFixed(0)
    this.durationTarget.innerText = this.rangeSummary.time.toFixed(1)

    if (this.windCancellation) this.updateWindEffectIndicators()
  }

  updateWindEffectIndicators() {
    const distanceEffect = this.rangeSummary.distanceWindEffect
    if (distanceEffect.value !== null) {
      this.updateWindEffectValues(
        distanceEffect,
        this.windEffectDistanceTarget,
        this.windEffectDistanceWindTarget,
        this.windEffectDistancePercentTarget,
        this.windEffectDistanceWindPercentTarget,
        0
      )
    }

    const speedEffect = this.rangeSummary.horizontalSpeedWindEffect
    if (speedEffect.value !== null) {
      this.updateWindEffectValues(
        speedEffect,
        this.windEffectSpeedTarget,
        this.windEffectSpeedWindTarget,
        this.windEffectSpeedPercentTarget,
        this.windEffectSpeedWindPercentTarget,
        0
      )
    }

    const glideEffect = this.rangeSummary.glideRatioWindEffect
    if (glideEffect.value !== null) {
      this.updateWindEffectValues(
        glideEffect,
        this.windEffectGlideRatioTarget,
        this.windEffectGlideRatioWindTarget,
        this.windEffectGlideRatioPercentTarget,
        this.windEffectGlideRatioWindPercentTarget,
        2
      )
    }
  }

  updateWindEffectValues(effect, valueEl, windEl, percentEl, windPercentEl, decimals) {
    valueEl.innerText = effect.value.toFixed(decimals)
    windEl.innerText =
      effect.windEffect > 0
        ? `+${effect.windEffect.toFixed(decimals)}`
        : effect.windEffect.toFixed(decimals)

    const absPercent = Math.abs(effect.windEffectPercent)
    const valuePercent = 100 - absPercent

    const clampedValuePercent = Math.max(0, Math.min(100, valuePercent))
    const clampedWindPercent = Math.max(0, Math.min(100, absPercent))

    percentEl.style.width = `${clampedValuePercent}%`
    windPercentEl.style.width = `${clampedWindPercent}%`
  }

  initSeparateCharts() {
    this.initAccuracyChart()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initAltitudeDistanceChart()
  }

  initCombinedCharts() {
    this.combinedChartTarget.chart = initCombinedChart(
      this.combinedChartTarget,
      this.points,
      {
        plotLines: this.windowPlotLines({ includeLabels: true }),
        windCancellation: this.windCancellation,
        chartName: 'PerformanceFlyingCombinedChart'
      }
    )
  }

  initAccuracyChart() {
    this.accuracyChartTarget.chart = initAccuracyChart(
      this.accuracyChartTarget,
      this.points,
      { plotLines: this.windowPlotLines() }
    )
  }

  initGlideChart() {
    this.glideChartTarget.chart = initGlideChart(this.glideChartTarget, this.points, {
      plotLines: this.windowPlotLines({ includeLabels: true }),
      windCancellation: this.windCancellation
    })
  }

  initSpeedsChart() {
    this.speedChartTarget.chart = initSpeedsChart(this.speedChartTarget, this.points, {
      plotLines: this.windowPlotLines(),
      windCancellation: this.windCancellation
    })
  }

  initAltitudeDistanceChart() {
    this.altitudeDistanceChartTarget.chart = initAltitudeDistanceChart(
      this.altitudeDistanceChartTarget,
      this.points,
      { plotLines: this.windowPlotLines() }
    )
  }

  formatGlideRatio(value) {
    return value > 10 ? '≥10' : value.toFixed(2)
  }

  windowPlotLines({ includeLabels } = {}) {
    if (!this.windowPlotLinePositions) {
      this.windowPlotLinePositions = [
        this.windowStartAltitude,
        this.windowEndAltitude
      ].map(altitude => [altitude, findPositionForAltitude(this.points, altitude)])
    }

    return this.windowPlotLinePositions.map(([altitude, position]) => ({
      value: position,
      width: 1,
      color: 'red',
      ...(includeLabels
        ? {
            label: {
              text: `${altitude.toFixed()} ${I18n.t('units.m')}`,
              style: { color: 'red' },
              y: 10
            }
          }
        : {})
    }))
  }
}
