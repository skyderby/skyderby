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

export default class extends Controller {
  static targets = [
    'accuracyChart',
    'glideChart',
    'speedChart',
    'altitudeDistanceChart',
    'combinedChart',
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
    'windEffectGlideRatioWind',
    'range3000to2000',
    'range2500to1500',
    'straightLineButton'
  ]

  static outlets = ['tracks--range-selector']

  static values = {
    pointsUrl: String,
    chartType: { type: String, default: 'separate' }
  }

  connect() {
    this.initializeStraightLine()

    this.fetchPoints().then(data => {
      this.points = data.points
      this.windCancellation = data.windCancellation
      this.initializeRange()
      this.updateCharts()
    })
  }

  initializeStraightLine() {
    const url = new URL(window.location)
    this.straightLine = url.searchParams.get('straight-line') === 'true'
    this.updateStraightLineButton()
  }

  updateStraightLineButton() {
    if (!this.hasStraightLineButtonTarget) return
    this.straightLineButtonTarget.classList.toggle('active', this.straightLine)
  }

  toggleStraightLine() {
    this.straightLine = !this.straightLine
    this.updateStraightLineButton()
    this.updateStraightLineUrl()
    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })
    this.updateIndicators()
  }

  updateStraightLineUrl() {
    const url = new URL(window.location)
    if (this.straightLine) {
      url.searchParams.set('straight-line', 'true')
    } else {
      url.searchParams.delete('straight-line')
    }
    history.replaceState({}, '', url)
  }

  fetchPoints() {
    return fetch(this.pointsUrlValue, {
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

  initializeRange() {
    this.maxAltitude = this.points[0].altitude
    this.minAltitude = this.points.at(-1).altitude

    const url = new URL(window.location)
    const fromParam = url.searchParams.get('f')
    const toParam = url.searchParams.get('t')

    this.fromValue = fromParam ? Number(fromParam) : this.maxAltitude
    this.toValue = toParam ? Number(toParam) : this.minAltitude

    if (this.fromValue > this.maxAltitude) this.fromValue = this.maxAltitude
    if (this.toValue < this.minAltitude || this.toValue >= this.fromValue) {
      this.toValue = this.minAltitude
    }

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.initSlider(
        this.maxAltitude,
        this.minAltitude,
        this.fromValue,
        this.toValue
      )
    }

    this.showRangeShortcuts()
  }

  showRangeShortcuts() {
    if (
      this.hasRange3000to2000Target &&
      this.maxAltitude > 3000 &&
      this.minAltitude < 2000
    ) {
      this.range3000to2000Target.classList.remove('hidden')
    }
    if (
      this.hasRange2500to1500Target &&
      this.maxAltitude > 2500 &&
      this.minAltitude < 1500
    ) {
      this.range2500to1500Target.classList.remove('hidden')
    }
  }

  updateRange(event) {
    const [from, to] = event.detail.range
    this.fromValue = from
    this.toValue = to
    this.updateUrl(from, to)
    this.updateCharts()
  }

  setRange(event) {
    const from = Number(event.currentTarget.dataset.from)
    const to = Number(event.currentTarget.dataset.to)
    this.fromValue = from
    this.toValue = to

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.updateSlider(from, to)
    }

    this.updateUrl(from, to)
    this.updateCharts()
  }

  updateUrl(from, to) {
    const url = new URL(window.location)
    url.searchParams.set('f', from)
    url.searchParams.set('t', to)
    history.replaceState({}, '', url)
  }

  clearRangeUrl() {
    const url = new URL(window.location)
    url.searchParams.delete('f')
    url.searchParams.delete('t')
    history.replaceState({}, '', url)
  }

  resetRange() {
    this.fromValue = this.maxAltitude
    this.toValue = this.minAltitude

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.updateSlider(this.maxAltitude, this.minAltitude)
    }

    this.clearRangeUrl()
    this.updateCharts()
  }

  updateCharts() {
    this.windowPoints = cropPoints(this.points, this.fromValue, this.toValue)
    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })

    this.calculateChartPoints()
    this.destroyCharts()

    if (this.chartType === 'separate') {
      this.initSeparateCharts()
    } else {
      this.initCombinedChart()
    }

    this.updateIndicators()
  }

  get chartType() {
    return this.chartTypeValue
  }

  calculateChartPoints() {
    const bufferSeconds = 3
    const rangeStartTime = this.windowPoints[0].gpsTime.getTime()
    const rangeEndTime = this.windowPoints.at(-1).gpsTime.getTime()

    const bufferStartTime = rangeStartTime - bufferSeconds * 1000
    const bufferEndTime = rangeEndTime + bufferSeconds * 1000

    this.chartPoints = this.points.filter(
      point =>
        point.gpsTime.getTime() >= bufferStartTime &&
        point.gpsTime.getTime() <= bufferEndTime
    )

    if (this.chartPoints.length === 0) {
      this.chartPoints = this.windowPoints
    }

    const firstChartTime = this.chartPoints[0].flTime
    this.bufferStartPosition = rangeStartTime - this.chartPoints[0].gpsTime.getTime()
    this.bufferEndPosition = rangeEndTime - this.chartPoints[0].gpsTime.getTime()
    this.chartEndPosition = this.chartPoints.at(-1).flTime - firstChartTime
  }

  bufferPlotBands() {
    return [
      {
        from: 0,
        to: this.bufferStartPosition / 1000,
        color: 'rgba(200, 200, 200, 0.3)'
      },
      {
        from: this.bufferEndPosition / 1000,
        to: this.chartEndPosition,
        color: 'rgba(200, 200, 200, 0.3)'
      }
    ]
  }

  destroyCharts() {
    const charts = [
      this.hasAccuracyChartTarget && this.accuracyChartTarget.chart,
      this.hasGlideChartTarget && this.glideChartTarget.chart,
      this.hasSpeedChartTarget && this.speedChartTarget.chart,
      this.hasAltitudeDistanceChartTarget && this.altitudeDistanceChartTarget.chart,
      this.hasCombinedChartTarget && this.combinedChartTarget.chart
    ]

    charts.filter(Boolean).forEach(chart => chart.destroy())
  }

  initSeparateCharts() {
    this.initAccuracyChart()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initAltitudeDistanceChart()
  }

  updateIndicators() {
    this.distanceTarget.innerText = Math.floor(this.rangeSummary.distance)
    this.glideRatioTarget.innerText = this.formatGlideRatio(
      this.rangeSummary.glideRatio.avg
    )
    this.glideRatioMinTarget.innerText = this.formatGlideRatio(
      this.rangeSummary.glideRatio.min
    )
    this.glideRatioMaxTarget.innerText = this.formatGlideRatio(
      this.rangeSummary.glideRatio.max
    )
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
    if (distanceEffect?.value !== null) {
      this.windEffectContainerDistanceTarget.style.display = ''
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
    if (speedEffect?.value !== null) {
      this.windEffectContainerSpeedTarget.style.display = ''
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
    if (glideEffect?.value !== null) {
      this.windEffectContainerGlideRatioTarget.style.display = ''
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

  initCombinedChart() {
    this.combinedChartTarget.chart = initCombinedChart(
      this.combinedChartTarget,
      this.chartPoints,
      {
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.windCancellation,
        chartName: 'TrackCombinedChart'
      }
    )
  }

  initAccuracyChart() {
    this.accuracyChartTarget.chart = initAccuracyChart(
      this.accuracyChartTarget,
      this.chartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands()
      }
    )
  }

  initGlideChart() {
    this.glideChartTarget.chart = initGlideChart(
      this.glideChartTarget,
      this.chartPoints,
      {
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.windCancellation
      }
    )
  }

  initSpeedsChart() {
    this.speedChartTarget.chart = initSpeedsChart(
      this.speedChartTarget,
      this.chartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.windCancellation
      }
    )
  }

  initAltitudeDistanceChart() {
    this.altitudeDistanceChartTarget.chart = initAltitudeDistanceChart(
      this.altitudeDistanceChartTarget,
      this.chartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands()
      }
    )
  }

  formatGlideRatio(value) {
    return value > 10 ? '≥10' : value.toFixed(2)
  }

  altitudePlotLines({ includeLabels } = {}) {
    const minAltitude = this.chartPoints.at(-1).altitude
    const maxAltitude = this.chartPoints[0].altitude

    const startMark = Math.ceil(minAltitude / 500) * 500
    const endMark = Math.floor(maxAltitude / 500) * 500

    const positions = []
    for (let altitude = startMark; altitude <= endMark; altitude += 500) {
      const position = findPositionForAltitude(this.chartPoints, altitude)
      positions.push([altitude, position])
    }

    return positions.map(([altitude, position], idx) => ({
      id: `altitude-plot-line-${idx}`,
      value: position,
      width: 1,
      color: '#999',
      ...(includeLabels
        ? {
            label: {
              text: `${altitude} ${I18n.t('units.m')}`,
              style: { color: '#999' },
              y: 10
            }
          }
        : {})
    }))
  }
}
