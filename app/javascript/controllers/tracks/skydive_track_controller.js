import LabeledController from 'controllers/labeled_controller'
import { findPositionForAltitude } from 'charts'
import {
  buildSepChart,
  buildGlideChart,
  buildSpeedChart,
  buildAltitudeDistanceChart,
  buildCombinedChart
} from 'charts/timeSeriesCharts'
import ChartGroup from 'charts/ChartGroup'
import cropPoints from 'utils/cropPoints'
import downsamplePoints from 'utils/downsamplePoints'
import calculateWindCancellation from 'utils/windCancellation'
import RangeSummary from 'charts/RangeSummary'
import { convertSpeed, convertLength, lengthUnitLabel } from 'utils/units'
import { fetchTrackPoints, fetchTrackWeather } from 'utils/tracks/trackData'
import { readParam, updateParams } from 'utils/urlState'

const ALTITUDE_LINE_COLOR = '#999'

export default class extends LabeledController {
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

    'straightLineButton',
    'emptyState'
  ]

  static outlets = ['tracks--range-selector']

  static values = {
    pointsUrl: String,
    weatherUrl: String,
    chartType: { type: String, default: 'separate' },
    chartsUnits: { type: String, default: 'metric' }
  }

  connect() {
    this.chartGroup = new ChartGroup(() => this.charts)
    this.initializeStraightLine()

    Promise.all([
      fetchTrackPoints(this.pointsUrlValue, { convertSpeeds: true }),
      this.hasWeatherUrlValue
        ? fetchTrackWeather(this.weatherUrlValue)
        : Promise.resolve([])
    ])
      .then(([pointsData, weatherData]) => {
        if (!pointsData.points || pointsData.points.length === 0) {
          this.showEmptyState('no_data')
          return
        }

        this.points = pointsData.points
        this.weatherData = weatherData
        this.initializeRange()
        this.updateCharts()
      })
      .catch(() => this.showEmptyState('load_error'))
  }

  showEmptyState(messageKey) {
    if (!this.hasEmptyStateTarget) return

    this.emptyStateTarget.textContent = this.labels.t(`tracks.show.${messageKey}`)
    this.emptyStateTarget.classList.remove('hidden')
  }

  initializeStraightLine() {
    this.straightLine = readParam('straight-line') === 'true'
    this.updateStraightLineButton()
  }

  updateStraightLineButton() {
    if (!this.hasStraightLineButtonTarget) return
    this.straightLineButtonTarget.classList.toggle('active', this.straightLine)
  }

  toggleStraightLine() {
    if (!this.points) return

    this.straightLine = !this.straightLine
    this.updateStraightLineButton()
    this.updateStraightLineUrl()
    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })
    this.updateIndicators()
  }

  updateStraightLineUrl() {
    updateParams({ 'straight-line': this.straightLine })
  }

  initializeRange() {
    this.maxAltitude = Math.ceil(this.points[0].altitude)
    this.minAltitude = Math.floor(this.points.at(-1).altitude)

    const range = this.hasTracksRangeSelectorOutlet
      ? this.tracksRangeSelectorOutlet.init({
          max: this.maxAltitude,
          min: this.minAltitude
        })
      : { from: this.maxAltitude, to: this.minAltitude }

    this.fromValue = range.from
    this.toValue = range.to
  }

  updateRange(event) {
    ;[this.fromValue, this.toValue] = event.detail.range
    this.updateCharts()
  }

  setUnits(event) {
    this.applyUnits(event.detail.units)
  }

  applyUnits(units) {
    this.chartsUnitsValue = units
  }

  updateCharts() {
    if (!this.points) return

    this.windowPoints = cropPoints(this.points, this.fromValue, this.toValue)
    if (this.windowPoints.length === 0) return

    if (this.weatherData && this.weatherData.length > 0) {
      this.windowPoints = calculateWindCancellation(this.windowPoints, this.weatherData)
    }

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

  get units() {
    return this.chartsUnitsValue
  }

  chartsUnitsValueChanged(value, previousValue) {
    if (previousValue === undefined) return
    if (value === previousValue) return
    if (!this.points) return

    this.updateCharts()
  }

  get hasWeatherData() {
    return this.weatherData && this.weatherData.length > 0
  }

  calculateChartPoints() {
    const bufferSeconds = 3
    const rangeStartTime = this.windowPoints[0].gpsTime.getTime()
    const rangeEndTime = this.windowPoints.at(-1).gpsTime.getTime()

    const bufferStartTime = rangeStartTime - bufferSeconds * 1000
    const bufferEndTime = rangeEndTime + bufferSeconds * 1000

    let chartPoints = this.points.filter(
      point =>
        point.gpsTime.getTime() >= bufferStartTime &&
        point.gpsTime.getTime() <= bufferEndTime
    )

    if (chartPoints.length === 0) {
      chartPoints = this.windowPoints
    }

    if (this.hasWeatherData) {
      chartPoints = calculateWindCancellation(chartPoints, this.weatherData)
    }

    this.chartPoints = chartPoints
    this.downsampledChartPoints = downsamplePoints(this.chartPoints)

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

  get chartHosts() {
    return [
      this.hasAccuracyChartTarget && this.accuracyChartTarget,
      this.hasGlideChartTarget && this.glideChartTarget,
      this.hasSpeedChartTarget && this.speedChartTarget,
      this.hasAltitudeDistanceChartTarget && this.altitudeDistanceChartTarget,
      this.hasCombinedChartTarget && this.combinedChartTarget
    ].filter(Boolean)
  }

  get charts() {
    return this.chartHosts.map(target => target.chart)
  }

  destroyCharts() {
    this.chartHosts.forEach(target => {
      target.chart?.destroy()
      target.chart = null
    })
  }

  disconnect() {
    this.chartGroup.cancelHide()
    this.destroyCharts()
  }

  get chartOptions() {
    return {
      plotBands: this.bufferPlotBands(),
      units: this.units,
      labels: this.labels,
      onHover: (_index, time) => this.chartGroup.showTime(time),
      onLeave: () => this.chartGroup.scheduleHide()
    }
  }

  initSeparateCharts() {
    this.initAccuracyChart()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initAltitudeDistanceChart()
  }

  updateIndicators() {
    const { units } = this

    this.distanceTarget.innerText = Math.floor(
      convertLength(this.rangeSummary.distance, units)
    )
    this.glideRatioTarget.innerText = this.formatGlideRatio(
      this.rangeSummary.glideRatio.avg
    )
    this.glideRatioMinTarget.innerText = this.formatGlideRatio(
      this.rangeSummary.glideRatio.min
    )
    this.glideRatioMaxTarget.innerText = this.formatGlideRatio(
      this.rangeSummary.glideRatio.max
    )
    this.groundSpeedTarget.innerText = convertSpeed(
      this.rangeSummary.horizontalSpeed.avg,
      units
    ).toFixed(0)
    this.groundSpeedMinTarget.innerText = convertSpeed(
      this.rangeSummary.horizontalSpeed.min,
      units
    ).toFixed(0)
    this.groundSpeedMaxTarget.innerText = convertSpeed(
      this.rangeSummary.horizontalSpeed.max,
      units
    ).toFixed(0)
    this.elevationTarget.innerText = convertLength(
      this.rangeSummary.elevation,
      units
    ).toFixed(0)
    this.verticalSpeedTarget.innerText = convertSpeed(
      this.rangeSummary.verticalSpeed.avg,
      units
    ).toFixed(0)
    this.verticalSpeedMinTarget.innerText = convertSpeed(
      this.rangeSummary.verticalSpeed.min,
      units
    ).toFixed(0)
    this.verticalSpeedMaxTarget.innerText = convertSpeed(
      this.rangeSummary.verticalSpeed.max,
      units
    ).toFixed(0)
    this.durationTarget.innerText = this.rangeSummary.time.toFixed(1)

    if (this.hasWeatherData) this.updateWindEffectIndicators()
  }

  updateWindEffectIndicators() {
    const { units } = this

    const distanceEffect = this.rangeSummary.distanceWindEffect
    if (distanceEffect?.value !== null) {
      this.windEffectContainerDistanceTarget.style.display = ''
      this.updateWindEffectValues(
        distanceEffect,
        this.windEffectDistanceTarget,
        this.windEffectDistanceWindTarget,
        this.windEffectDistancePercentTarget,
        this.windEffectDistanceWindPercentTarget,
        0,
        value => convertLength(value, units)
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
        0,
        value => convertSpeed(value, units)
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

  updateWindEffectValues(
    effect,
    valueEl,
    windEl,
    percentEl,
    windPercentEl,
    decimals,
    convert = value => value
  ) {
    valueEl.innerText = convert(effect.value).toFixed(decimals)
    windEl.innerText =
      effect.windEffect > 0
        ? `+${convert(effect.windEffect).toFixed(decimals)}`
        : convert(effect.windEffect).toFixed(decimals)

    const absPercent = Math.abs(effect.windEffectPercent)
    const valuePercent = 100 - absPercent

    const clampedValuePercent = Math.max(0, Math.min(100, valuePercent))
    const clampedWindPercent = Math.max(0, Math.min(100, absPercent))

    percentEl.style.width = `${clampedValuePercent}%`
    windPercentEl.style.width = `${clampedWindPercent}%`
  }

  initCombinedChart() {
    this.combinedChartTarget.chart = buildCombinedChart(
      this.combinedChartTarget,
      this.downsampledChartPoints,
      {
        ...this.chartOptions,
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        windCancellation: this.hasWeatherData,
        straightLine: this.straightLine,
        rangeStartPosition: this.bufferStartPosition / 1000,
        chartName: 'TrackCombinedChart'
      }
    )
  }

  initAccuracyChart() {
    this.accuracyChartTarget.chart = buildSepChart(
      this.accuracyChartTarget,
      this.downsampledChartPoints,
      { ...this.chartOptions, plotLines: this.altitudePlotLines() }
    )
  }

  initGlideChart() {
    this.glideChartTarget.chart = buildGlideChart(
      this.glideChartTarget,
      this.downsampledChartPoints,
      {
        ...this.chartOptions,
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        windCancellation: this.hasWeatherData,
        title: true,
        legend: true
      }
    )
  }

  initSpeedsChart() {
    this.speedChartTarget.chart = buildSpeedChart(
      this.speedChartTarget,
      this.downsampledChartPoints,
      {
        ...this.chartOptions,
        plotLines: this.altitudePlotLines(),
        windCancellation: this.hasWeatherData,
        title: true
      }
    )
  }

  initAltitudeDistanceChart() {
    this.altitudeDistanceChartTarget.chart = buildAltitudeDistanceChart(
      this.altitudeDistanceChartTarget,
      this.downsampledChartPoints,
      {
        ...this.chartOptions,
        plotLines: this.altitudePlotLines(),
        straightLine: this.straightLine,
        rangeStartPosition: this.bufferStartPosition / 1000
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

    return positions.map(([altitude, position]) => ({
      value: position,
      color: ALTITUDE_LINE_COLOR,
      label: includeLabels
        ? `${altitude} ${lengthUnitLabel('metric', this.labels)}`
        : null
    }))
  }
}
