import { Controller } from '@hotwired/stimulus'
import {
  findPositionForAltitude,
  initAccuracyChart,
  initGlideChart,
  initSpeedsChart,
  initAltitudeDistanceChart,
  initCombinedChart
} from 'charts'
import cropPoints from 'utils/cropPoints'
import downsamplePoints from 'utils/downsamplePoints'
import calculateWindCancellation from 'utils/windCancellation'
import RangeSummary from 'charts/RangeSummary'
import { convertSpeed, convertLength, lengthUnitLabel } from 'utils/units'
import { fetchTrackPoints, fetchTrackWeather } from 'utils/tracks/trackData'
import I18n from 'i18n'

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

    this.emptyStateTarget.textContent = I18n.t(`tracks.show.${messageKey}`)
    this.emptyStateTarget.classList.remove('hidden')
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
    const url = new URL(window.location)
    if (this.straightLine) {
      url.searchParams.set('straight-line', 'true')
    } else {
      url.searchParams.delete('straight-line')
    }
    history.replaceState({}, '', url)
  }

  initializeRange() {
    this.maxAltitude = Math.ceil(this.points[0].altitude)
    this.minAltitude = Math.floor(this.points.at(-1).altitude)

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

  applyUnits(units) {
    this.chartsUnitsValue = units
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
    this.combinedChartTarget.chart = initCombinedChart(
      this.combinedChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        straightLine: this.straightLine,
        rangeStartPosition: this.bufferStartPosition / 1000,
        chartName: 'TrackCombinedChart',
        units: this.units
      }
    )
  }

  initAccuracyChart() {
    this.accuracyChartTarget.chart = initAccuracyChart(
      this.accuracyChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands(),
        units: this.units
      }
    )
  }

  initGlideChart() {
    this.glideChartTarget.chart = initGlideChart(
      this.glideChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        units: this.units
      }
    )
  }

  initSpeedsChart() {
    this.speedChartTarget.chart = initSpeedsChart(
      this.speedChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        units: this.units
      }
    )
  }

  initAltitudeDistanceChart() {
    this.altitudeDistanceChartTarget.chart = initAltitudeDistanceChart(
      this.altitudeDistanceChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands(),
        straightLine: this.straightLine,
        rangeStartPosition: this.bufferStartPosition / 1000,
        units: this.units
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
              text: `${altitude} ${lengthUnitLabel('metric')}`,
              style: { color: '#999' },
              y: 10
            }
          }
        : {})
    }))
  }
}
