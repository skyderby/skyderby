import LabeledController from 'controllers/labeled_controller'
import { fetchTrackPoints, fetchTrackWeather } from 'utils/tracks/trackData'
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
import calculateWindCancellation from 'utils/windCancellation'
import RangeSummary from 'charts/RangeSummary'

const WINDOW_LINE_COLOR = 'red'

export default class PerformanceFlyingChartsController extends LabeledController {
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
    this.chartGroup = new ChartGroup(() => this.charts)
    this.result = Number(this.element.dataset.result)
    this.exitAltitude = Number(this.element.dataset.exitAltitude)
    this.windowStartAltitude = Number(this.element.dataset.windowStart)
    this.windowEndAltitude = Number(this.element.dataset.windowEnd)
    this.chartType = this.element.dataset.chartType
    this.pointsUrl = this.element.dataset.pointsUrl
    this.weatherUrl = this.element.dataset.weatherUrl
    const initCharts =
      this.chartType === 'separate'
        ? this.initSeparateCharts.bind(this)
        : this.initCombinedCharts.bind(this)

    Promise.all([this.fetchPoints(), this.fetchWeather()])
      .then(([pointsData, weatherData]) => {
        this.points = pointsData.points
        this.weatherData = weatherData

        if (this.hasWeatherData) {
          this.points = calculateWindCancellation(this.points, this.weatherData)
        }

        this.windowPoints = cropPoints(
          this.points,
          this.windowStartAltitude,
          this.windowEndAltitude
        )
        this.rangeSummary = new RangeSummary(this.windowPoints, { straightLine: true })

        initCharts()
        this.updateTrackIndicators()
      })
      .catch(error => console.error('Failed to load performance flying charts', error))
  }

  disconnect() {
    this.chartGroup.cancelHide()
    this.charts.forEach(chart => chart.destroy())
  }

  get charts() {
    return [
      this.hasAccuracyChartTarget && this.accuracyChartTarget.chart,
      this.hasGlideChartTarget && this.glideChartTarget.chart,
      this.hasSpeedChartTarget && this.speedChartTarget.chart,
      this.hasAltitudeDistanceChartTarget && this.altitudeDistanceChartTarget.chart,
      this.hasCombinedChartTarget && this.combinedChartTarget.chart
    ].filter(Boolean)
  }

  get chartOptions() {
    return {
      labels: this.labels,
      onHover: (_index, time) => this.chartGroup.showTime(time),
      onLeave: () => this.chartGroup.scheduleHide()
    }
  }

  get hasWeatherData() {
    return this.weatherData && this.weatherData.length > 0
  }

  fetchPoints() {
    return fetchTrackPoints(this.pointsUrl, { convertSpeeds: true })
  }

  fetchWeather() {
    if (!this.weatherUrl) return Promise.resolve([])

    return fetchTrackWeather(this.weatherUrl)
  }

  updateTrackIndicators() {
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

    if (this.hasWeatherData) this.updateWindEffectIndicators()
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
    this.combinedChartTarget.chart = buildCombinedChart(
      this.combinedChartTarget,
      this.points,
      {
        ...this.chartOptions,
        plotLines: this.windowPlotLines({ includeLabels: true }),
        windCancellation: this.hasWeatherData,
        straightLine: true,
        chartName: 'PerformanceFlyingCombinedChart'
      }
    )
  }

  initAccuracyChart() {
    this.accuracyChartTarget.chart = buildSepChart(
      this.accuracyChartTarget,
      this.points,
      {
        ...this.chartOptions,
        plotLines: this.windowPlotLines()
      }
    )
  }

  initGlideChart() {
    this.glideChartTarget.chart = buildGlideChart(this.glideChartTarget, this.points, {
      ...this.chartOptions,
      plotLines: this.windowPlotLines({ includeLabels: true }),
      windCancellation: this.hasWeatherData,
      title: true,
      legend: true
    })
  }

  initSpeedsChart() {
    this.speedChartTarget.chart = buildSpeedChart(this.speedChartTarget, this.points, {
      ...this.chartOptions,
      plotLines: this.windowPlotLines(),
      windCancellation: this.hasWeatherData,
      title: true
    })
  }

  initAltitudeDistanceChart() {
    this.altitudeDistanceChartTarget.chart = buildAltitudeDistanceChart(
      this.altitudeDistanceChartTarget,
      this.points,
      { ...this.chartOptions, plotLines: this.windowPlotLines(), straightLine: true }
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
      color: WINDOW_LINE_COLOR,
      label: includeLabels ? `${altitude.toFixed()} ${this.labels.t('units.m')}` : null
    }))
  }
}
