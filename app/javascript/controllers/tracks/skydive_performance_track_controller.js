import PlaybackController from '../playback_controller'
import {
  initGlideChart,
  initSpeedsChart,
  initAccuracyChart,
  initAltitudeDistanceChart,
  initCombinedChart,
  findPositionForAltitude
} from 'charts'
import { convertLength, lengthUnitLabel, convertSpeed, speedUnitLabel } from 'utils/units'
import { computeSegmentAnalysis } from 'utils/tracks/skydiveSegments'
import initMapsApi from 'utils/google_maps_api'
import { isTurboPreview } from 'utils/turbo_preview'
import cropPoints from 'utils/cropPoints'
import downsamplePoints from 'utils/downsamplePoints'
import calculateWindCancellation, { WeatherData } from 'utils/windCancellation'
import RangeSummary from 'charts/RangeSummary'
import { computeBestWindows } from 'utils/tracks/bestWindows'
import SkydivePerformanceSideView from 'utils/tracks/SkydivePerformanceSideView'
import SkydivePerformancePolar from 'utils/tracks/SkydivePerformancePolar'
import SegmentsPanel from 'utils/tracks/SegmentsPanel'
import TrackMap from 'utils/tracks/map/TrackMap'
import {
  closestIndexByPlayerTime,
  headingAtIndex,
  timeOf
} from 'utils/tracks/pointHelpers'
import { buildProcessedPoints, alignCompareTrack } from 'utils/tracks/compareAlignment'
import DesignatedLaneEditor, { findExitPoint } from 'utils/tracks/DesignatedLaneEditor'
import { syncCrosshairByX } from 'utils/tracks/playback/highchartsCrosshair'
import { fetchTrackPoints, fetchTrackWeather } from 'utils/tracks/trackData'
import { get } from '@rails/request.js'
import { readParam, updateParams } from 'utils/urlState'
import I18n from 'i18n'

export default class extends PlaybackController {
  static targets = [
    'sideProjection',
    'grid',
    'trajectory',
    'glideChart',
    'speedChart',
    'polarChart',
    'stageTab',
    'segmentsPanel',
    'segmentsContent',
    'segmentsEntryTemplate',
    'segmentsEntryCompareTemplate',
    'segmentsColumnsTemplate',
    'segmentTemplate',
    'segmentCompareTemplate',
    'panelContent',
    'polarPanel',
    'mapPanel',
    'map',
    'playButton',
    'playbackSlider',
    'playbackIndicators',
    'comparePlaybackIndicators',
    'summaryIndicators',
    'compareSummaryIndicators',

    'bestSpeed',
    'bestDistance',
    'bestTime',
    'designatedLaneToggle',
    'straightLineToggle',
    'emptyState',
    'sepChart',
    'altitudeDistanceChart',
    'combinedChart',
    'separateCharts',
    'chartsModeItem',
    'paddingItem'
  ]

  static outlets = ['tracks--range-selector']

  static values = {
    pointsUrl: String,
    locationArrowUrl: String,
    weatherUrl: String,
    referencePointUrl: String,
    comparePointsUrl: String,
    compareWeatherUrl: String,
    compareTrackName: String,
    chartsUnits: { type: String, default: 'metric' }
  }

  get units() {
    return this.chartsUnitsValue
  }

  setUnits(event) {
    this.chartsUnitsValue = event.detail.units
  }

  chartsUnitsValueChanged(value, previousValue) {
    if (previousValue === undefined || value === previousValue || !this.points) return
    this.updateView()
    this.updatePlaybackPosition()
    if (this.bestWindows) this.renderBestWindowShortcuts(this.bestWindows)
  }

  connect() {
    if (isTurboPreview()) return

    this.stage = 'segments'
    this.referencePointData = null
    this.comparePoints = null
    this.initializeStraightLine()
    this.initializeChartsMode()
    this.initializePadding()
    this.initSideView()
    this.initPolarView()

    const fetches = [this.fetchPoints(), this.fetchWeather(), this.fetchReferencePoint()]

    if (this.hasComparePointsUrlValue) {
      fetches.push(this.fetchComparePoints())
      fetches.push(this.fetchCompareWeather())
    }

    Promise.all(fetches)
      .then(
        ([
          pointsData,
          weatherData,
          referencePointData,
          compareData,
          compareWeatherData
        ]) => {
          this.points = pointsData.points
          this.weatherData = weatherData
          this.referencePointData = referencePointData
          if (compareData) {
            this.comparePoints = compareData.points
          }
          if (compareWeatherData) {
            this.compareWeatherData = compareWeatherData
          }

          if (!this.points || this.points.length === 0) {
            this.showEmptyState('no_data')
            return
          }

          this.initializeRange()
          this.updateView()
          this.initDesignatedLane()
          this.computeBestWindows()
        }
      )
      .catch(error => {
        console.error('Failed to initialize skydive performance view', error)
        this.showEmptyState('load_error')
      })
  }

  showEmptyState(messageKey = 'no_data') {
    if (!this.hasEmptyStateTarget) return

    this.emptyStateTarget.textContent = I18n.t(`tracks.show.${messageKey}`)
    this.emptyStateTarget.classList.remove('hidden')
  }

  computeBestWindows() {
    computeBestWindows(this.points)
      .then(result => {
        if (result) {
          this.bestWindows = result
          this.renderBestWindowShortcuts(result)
          this.renderPolarChart()
        }
      })
      .catch(() => {})

    if (this.comparePoints) {
      computeBestWindows(this.comparePoints)
        .then(result => {
          if (result) {
            this.compareBestWindows = result
            this.renderPolarChart()
          }
        })
        .catch(() => {})
    }
  }

  renderBestWindowShortcuts(result) {
    const shortcuts = [
      {
        target: this.hasBestSpeedTarget && this.bestSpeedTarget,
        window: result.speed,
        unit: speedUnitLabel(this.units),
        value: convertSpeed(result.speed.value, this.units).toFixed(0)
      },
      {
        target: this.hasBestDistanceTarget && this.bestDistanceTarget,
        window: result.distance,
        unit: lengthUnitLabel(this.units),
        value: String(Math.floor(convertLength(result.distance.value, this.units)))
      },
      {
        target: this.hasBestTimeTarget && this.bestTimeTarget,
        window: result.time,
        value: result.time.value.toFixed(1)
      }
    ]

    shortcuts.forEach(({ target, window, unit, value }) => {
      if (!target) return

      target.dataset.from = window.from
      target.dataset.to = window.to
      target.querySelector('[data-best-window-range]').textContent =
        `${window.from} — ${window.to}`
      target.querySelector('[data-best-window-value]').textContent = value

      const unitTarget = target.querySelector('[data-best-window-unit]')
      if (unitTarget && unit) unitTarget.textContent = unit

      target.classList.remove('hidden')
    })
  }

  initDesignatedLane() {
    if (this.referencePointData?.reference_point && this.hasDesignatedLaneToggleTarget) {
      this.designatedLaneToggleTarget.checked = true
      this.laneEditor?.show()
    }
  }

  initializeStraightLine() {
    const param = readParam('straight-line')
    this.straightLine = param !== null ? param === 'true' : this.hasComparePointsUrlValue
    if (this.hasStraightLineToggleTarget) {
      this.straightLineToggleTarget.checked = this.straightLine
    }
  }

  initializeChartsMode() {
    const stored = localStorage.getItem('SkydivePerformanceChartsMode')
    this.chartsMode = stored === 'single' ? 'single' : 'separate'
    this.updateChartsModeUI()
  }

  setChartsMode(event) {
    const mode = event.currentTarget.dataset.mode === 'single' ? 'single' : 'separate'
    if (mode === this.chartsMode) return

    this.chartsMode = mode
    localStorage.setItem('SkydivePerformanceChartsMode', mode)
    this.updateChartsModeUI()

    if (!this.points || this.points.length === 0) return

    this.destroyCharts()
    this.renderCharts()
  }

  initializePadding() {
    const stored = Number(localStorage.getItem('SkydivePerformancePadding'))
    this.padding = stored === 5 || stored === 15 ? stored : 15
    this.updatePaddingUI()
  }

  setPadding(event) {
    const padding = Number(event.currentTarget.dataset.padding)
    if (padding === this.padding) return

    this.padding = padding
    localStorage.setItem('SkydivePerformancePadding', String(padding))
    this.updatePaddingUI()

    if (!this.points || this.points.length === 0) return

    this.updateView()
  }

  updatePaddingUI() {
    this.paddingItemTargets.forEach(item =>
      item.classList.toggle('active', Number(item.dataset.padding) === this.padding)
    )
  }

  updateChartsModeUI() {
    if (this.hasSeparateChartsTarget) {
      this.separateChartsTarget.classList.toggle('hidden', this.chartsMode === 'single')
    }
    if (this.hasCombinedChartTarget) {
      this.combinedChartTarget.classList.toggle('hidden', this.chartsMode !== 'single')
    }
    this.chartsModeItemTargets.forEach(item => {
      item.classList.toggle('active', item.dataset.mode === this.chartsMode)
    })
  }

  renderCharts() {
    if (this.chartsMode === 'single') {
      this.initCombinedChart()
    } else {
      this.initGlideChart()
      this.initSpeedsChart()
      this.initAltitudeDistanceChart()
      this.initSepChart()
    }
  }

  toggleStraightLine() {
    this.straightLine = this.straightLineToggleTarget.checked
    this.updateStraightLineUrl()
    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })
    if (this.comparePoints) {
      this.compareRangeSummary = this.buildCompareRangeSummary()
    }
    this.updateSummaryIndicators()
    if (this.comparePoints) {
      this.updateCompareSummaryIndicators()
    }
  }

  updateStraightLineUrl() {
    updateParams({ 'straight-line': this.straightLine })
  }

  fetchPoints() {
    return fetchTrackPoints(this.pointsUrlValue, { convertSpeeds: true })
  }

  fetchWeather() {
    if (!this.hasWeatherUrlValue) return Promise.resolve([])

    return fetchTrackWeather(this.weatherUrlValue)
  }

  fetchCompareWeather() {
    if (!this.hasCompareWeatherUrlValue) return Promise.resolve([])

    return fetchTrackWeather(this.compareWeatherUrlValue)
  }

  fetchReferencePoint() {
    if (!this.hasReferencePointUrlValue) return Promise.resolve(null)

    return get(this.referencePointUrlValue, { responseKind: 'json' })
      .then(response => (response.ok ? response.json : null))
      .catch(() => null)
  }

  fetchComparePoints() {
    if (!this.hasComparePointsUrlValue) return Promise.resolve(null)

    return fetchTrackPoints(this.comparePointsUrlValue, { convertSpeeds: true }).catch(
      () => null
    )
  }

  get hasWeatherData() {
    return this.weatherData && this.weatherData.length > 0
  }

  get hasCompareWeatherData() {
    return this.compareWeatherData && this.compareWeatherData.length > 0
  }

  get compareWeather() {
    if (!this._compareWeather && this.hasCompareWeatherData) {
      this._compareWeather = new WeatherData(this.compareWeatherData)
    }
    return this._compareWeather
  }

  get map() {
    return this.trackMap?.map
  }

  initializeRange() {
    this.maxAltitude = Math.ceil(this.points[0].altitude)
    this.minAltitude = Math.floor(this.points.at(-1).altitude)

    const compareDefaults = this.hasComparePointsUrlValue
    const range = this.hasTracksRangeSelectorOutlet
      ? this.tracksRangeSelectorOutlet.init({
          max: this.maxAltitude,
          min: this.minAltitude,
          defaultFrom: compareDefaults ? 2500 : this.maxAltitude,
          defaultTo: compareDefaults ? 1500 : this.minAltitude
        })
      : { from: this.maxAltitude, to: this.minAltitude }

    this.fromValue = range.from
    this.toValue = range.to
  }

  updateRange(event) {
    ;[this.fromValue, this.toValue] = event.detail.range
    if (event.detail.straightLine) this.enableStraightLine()
    this.updateView()
  }

  enableStraightLine() {
    if (this.straightLine) return

    this.straightLine = true
    if (this.hasStraightLineToggleTarget) {
      this.straightLineToggleTarget.checked = true
    }
    this.updateStraightLineUrl()
  }

  updateView() {
    this.windowPoints = cropPoints(this.points, this.fromValue, this.toValue)
    if (this.windowPoints.length === 0) return

    if (this.hasWeatherData) {
      this.windowPoints = calculateWindCancellation(this.windowPoints, this.weatherData)
    }

    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })

    this.calculateChartPoints()
    this.processedPoints = this.processPoints()

    if (this.comparePoints) {
      this.processCompareTrack()
    }

    this.destroyCharts()
    this.renderSideView()
    this.renderPolarChart()
    this.renderSegments()
    this.updateChartsModeUI()
    this.renderCharts()
    if (this.mapReady) this.renderMap()
    this.initPlayback()
    this.updateSummaryIndicators()
    if (this.comparePoints) {
      this.updateCompareSummaryIndicators()
    }
  }

  initSideView() {
    if (!this.hasSideProjectionTarget) return

    this.sideView = new SkydivePerformanceSideView({
      svg: this.sideProjectionTarget,
      grid: this.gridTarget,
      trajectory: this.trajectoryTarget,
      onSeek: index => this.handleSideViewSeek(index)
    })
  }

  renderSideView() {
    if (!this.sideView) return

    this.sideView.render({
      processedPoints: this.processedPoints,
      compareProcessedPoints: this.compareProcessedPoints,
      fromValue: this.fromValue,
      toValue: this.toValue,
      maxAltitude: this.maxAltitude,
      minAltitude: this.minAltitude,
      weather: this.weather,
      compareWeather: this.compareWeather,
      compareReferenceTime: this.comparePoints?.[0]?.gpsTime,
      units: this.units
    })
  }

  handleSideViewSeek(index) {
    this.seekTo(index)
  }

  calculateChartPoints() {
    const leadSeconds = this.padding ?? 15
    const trailSeconds = 3
    const rangeStartTime = this.windowPoints[0].gpsTime.getTime()
    const rangeEndTime = this.windowPoints.at(-1).gpsTime.getTime()

    const leadStartTime = Math.max(rangeStartTime - leadSeconds * 1000, this.exitTime)
    const bufferStartTime = Math.min(leadStartTime, rangeStartTime)
    const bufferEndTime = rangeEndTime + trailSeconds * 1000

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

  processPoints() {
    if (this.points.length === 0 || this.chartPoints.length === 0) return []

    let points = this.points
    if (this.hasWeatherData) {
      points = calculateWindCancellation(points, this.weatherData)
    }

    return buildProcessedPoints(points, { startTime: timeOf(this.chartPoints[0]) })
  }

  processCompareTrack() {
    const alignment = alignCompareTrack({
      points: this.points,
      comparePoints: this.comparePoints,
      chartPoints: this.chartPoints,
      processedPoints: this.processedPoints,
      windowFrom: this.fromValue,
      windowStartTime: timeOf(this.windowPoints[0]),
      windowEndTime: timeOf(this.windowPoints.at(-1))
    })

    if (!alignment) {
      this.compareChartPoints = []
      this.compareProcessedPoints = []
      this.compareRangeSummary = null
      return
    }

    this.compareTimeOffset = alignment.timeOffset
    this.chartTimeOffset = alignment.chartTimeOffset
    this.compareChartPoints = alignment.compareChartPoints
    this.compareProcessedPoints = alignment.compareProcessedPoints
    this.compareRangeSummary = this.buildCompareRangeSummary()
  }

  buildCompareRangeSummary() {
    let compareWindowPoints = cropPoints(this.comparePoints, this.fromValue, this.toValue)
    if (compareWindowPoints.length === 0) return null

    if (this.hasCompareWeatherData) {
      compareWindowPoints = calculateWindCancellation(
        compareWindowPoints,
        this.compareWeatherData
      )
    }

    return new RangeSummary(compareWindowPoints, { straightLine: this.straightLine })
  }

  get weather() {
    if (!this._weather && this.hasWeatherData) {
      this._weather = new WeatherData(this.weatherData)
    }
    return this._weather
  }

  onChartHover(event) {
    if (!this.processedPoints || this.processedPoints.length === 0) return

    const chart = this.chartForHover()
    if (!chart?.pointer) return

    const normalized = chart.pointer.normalize(event)
    const series = chart.series.find(item => item.visible && item.points?.length)
    if (!series) return

    const point = series.searchPoint(normalized, true)
    if (!point) return

    const index = closestIndexByPlayerTime(
      this.processedPoints,
      point.x + this.chartXOffset
    )
    if (index < 0) return

    this.seekTo(index)
  }

  chartForHover() {
    return (
      (this.hasGlideChartTarget && this.glideChartTarget.chart) ||
      (this.hasSpeedChartTarget && this.speedChartTarget.chart) ||
      (this.hasAltitudeDistanceChartTarget && this.altitudeDistanceChartTarget.chart) ||
      (this.hasSepChartTarget && this.sepChartTarget.chart) ||
      (this.hasCombinedChartTarget && this.combinedChartTarget.chart)
    )
  }

  get chartXOffset() {
    return this.bufferStartPosition / 1000
  }

  initGlideChart() {
    if (!this.hasGlideChartTarget) return

    this.glideChartTarget.chart = initGlideChart(
      this.glideChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        showTitle: false,
        showLegend: false,
        comparePoints: downsamplePoints(this.compareChartPoints),
        compareTimeOffset: this.chartTimeOffset,
        compareTrackName: this.compareTrackNameValue,
        xOffset: this.chartXOffset,
        units: this.units
      }
    )
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    this.speedChartTarget.chart = initSpeedsChart(
      this.speedChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        comparePoints: downsamplePoints(this.compareChartPoints),
        compareTimeOffset: this.chartTimeOffset,
        compareTrackName: this.compareTrackNameValue,
        xOffset: this.chartXOffset,
        units: this.units
      }
    )
  }

  initAltitudeDistanceChart() {
    if (!this.hasAltitudeDistanceChartTarget) return

    this.altitudeDistanceChartTarget.chart = initAltitudeDistanceChart(
      this.altitudeDistanceChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands(),
        straightLine: this.straightLine,
        rangeStartPosition: this.bufferStartPosition / 1000,
        xOffset: this.chartXOffset,
        units: this.units
      }
    )
  }

  initSepChart() {
    if (!this.hasSepChartTarget) return

    this.sepChartTarget.chart = initAccuracyChart(
      this.sepChartTarget,
      this.downsampledChartPoints,
      {
        plotBands: this.bufferPlotBands(),
        xOffset: this.chartXOffset,
        units: this.units
      }
    )
  }

  initCombinedChart() {
    if (!this.hasCombinedChartTarget) return

    this.combinedChartTarget.chart = initCombinedChart(
      this.combinedChartTarget,
      this.downsampledChartPoints,
      {
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        straightLine: this.straightLine,
        rangeStartPosition: this.bufferStartPosition / 1000,
        chartName: 'SkydivePerformanceCombinedChart',
        xOffset: this.chartXOffset,
        units: this.units
      }
    )
  }

  altitudePlotLines({ includeLabels } = {}) {
    const minAltitude = this.chartPoints.at(-1).altitude
    const maxAltitude = this.chartPoints[0].altitude

    const startMark = Math.ceil(minAltitude / 500) * 500
    const endMark = Math.floor(maxAltitude / 500) * 500

    const positions = []
    for (let altitude = startMark; altitude <= endMark; altitude += 500) {
      const position = findPositionForAltitude(this.chartPoints, altitude)
      if (position != null) positions.push([altitude, position])
    }

    return positions.map(([altitude, position], idx) => ({
      id: `altitude-plot-line-${idx}`,
      value: position,
      width: 1,
      color: '#999',
      ...(includeLabels
        ? {
            label: {
              text: this.altitudeLabelText(altitude),
              style: { color: '#999' },
              y: 10
            }
          }
        : {})
    }))
  }

  initPolarView() {
    if (!this.hasPolarChartTarget) return

    this.polarView = new SkydivePerformancePolar({ svg: this.polarChartTarget })
  }

  renderPolarChart() {
    if (!this.polarView || !this.points) return

    this.polarView.render({
      points: this.points,
      fitRange: this.bestWindows?.distance,
      comparePoints: this.comparePoints,
      compareFitRange: this.compareBestWindows?.distance
    })
  }

  renderSegments() {
    if (this.stage !== 'segments') return
    if (!this.hasSegmentsContentTarget || !this.processedPoints?.length) return

    const window = { from: this.fromValue, to: this.toValue }
    const analysis = computeSegmentAnalysis(this.processedPoints, window)
    const compareAnalysis =
      analysis && this.comparePoints && this.compareProcessedPoints?.length
        ? computeSegmentAnalysis(this.compareProcessedPoints, window)
        : null

    this.segmentsPanel.render({ analysis, compareAnalysis, units: this.units })
  }

  get segmentsPanel() {
    this._segmentsPanel ??= new SegmentsPanel({
      container: this.segmentsContentTarget,
      templates: {
        entry: this.segmentsEntryTemplateTarget,
        entryCompare: this.segmentsEntryCompareTemplateTarget,
        columns: this.segmentsColumnsTemplateTarget,
        segment: this.segmentTemplateTarget,
        segmentCompare: this.segmentCompareTemplateTarget
      }
    })
    return this._segmentsPanel
  }

  selectStage(event) {
    const stage = event.currentTarget.dataset.stage
    if (!stage || stage === this.stage) return

    this.stage = stage

    this.stageTabTargets.forEach(tab =>
      tab.setAttribute('aria-pressed', tab.dataset.stage === stage ? 'true' : 'false')
    )

    if (this.hasSegmentsPanelTarget) {
      this.segmentsPanelTarget.classList.toggle('hidden', stage !== 'segments')
    }
    if (this.hasPanelContentTarget) {
      this.panelContentTarget.classList.toggle('hidden', stage === 'segments')
    }
    if (this.hasPolarPanelTarget) {
      this.polarPanelTarget.classList.toggle('hidden', stage !== 'polar')
    }
    if (this.hasMapPanelTarget) {
      this.mapPanelTarget.classList.toggle('hidden', stage !== 'map')
    }

    if (stage === 'segments') this.renderSegments()
    if (stage === 'map') this.showMap()
  }

  showMap() {
    if (!this.hasMapTarget) return

    if (this.mapReady) {
      this.updatePlaybackPosition()
      return
    }
    if (this.mapLoading) return

    this.mapLoading = true
    initMapsApi()
      .then(() => {
        this.mapReady = true
        this.mapLoading = false
        this.renderMap()
        this.initDesignatedLane()
        this.updatePlaybackPosition()
      })
      .catch(() => {
        this.mapLoading = false
      })
  }

  destroyCharts() {
    const targets = [
      this.hasGlideChartTarget && this.glideChartTarget,
      this.hasSpeedChartTarget && this.speedChartTarget,
      this.hasAltitudeDistanceChartTarget && this.altitudeDistanceChartTarget,
      this.hasSepChartTarget && this.sepChartTarget,
      this.hasCombinedChartTarget && this.combinedChartTarget
    ].filter(Boolean)

    targets.forEach(target => {
      if (!target.chart) return

      target.chart.destroy()
      target.chart = null
    })
  }

  renderMap() {
    if (!this.hasMapTarget) return

    if (!this.trackMap) {
      this.trackMap = new TrackMap({
        element: this.mapTarget,
        mapId: 'SKYDIVE_PERFORMANCE_MAP',
        markerImageUrl: this.locationArrowUrlValue
      })
    }

    this.trackMap.render(this.points, this.windowPoints)
  }

  initPlayback() {
    if (this.processedPoints.length === 0) return

    this.resetPlayback()
  }

  get playbackPoints() {
    return this.processedPoints
  }

  get playbackCharts() {
    return [
      this.glideChartTarget?.chart,
      this.speedChartTarget?.chart,
      this.sepChartTarget?.chart
    ]
  }

  syncPosition(index, fraction, interpolated) {
    const point = this.processedPoints[index]
    if (!point) return

    this.sideView?.setPosition(index, fraction, interpolated)
    syncCrosshairByX(this.playbackCharts, this.currentPlayerTime - this.chartXOffset)
    this.updatePlaybackIndicators(index, fraction)
    this.updateComparePlaybackIndicators(
      this.compareProcessedPoints,
      this.currentPlayerTime
    )
    this.updatePolarMarker()

    if (this.trackMap) {
      const heading = headingAtIndex(this.processedPoints, index, fraction)
      this.trackMap.setPosition(heading.point, heading.heading)
    }
  }

  updatePolarMarker() {
    if (!this.polarView) return

    const point = this.processedPoints?.[this.currentIndex]
    this.polarView.setMarker(point ? point.gpsTime.getTime() : null)

    if (point && this.compareProcessedPoints?.length) {
      const index = closestIndexByPlayerTime(
        this.compareProcessedPoints,
        point.playerTime
      )
      const comparePoint = this.compareProcessedPoints[index]
      this.polarView.setCompareMarker(
        comparePoint ? comparePoint.srcGpsTime.getTime() : null
      )
    } else {
      this.polarView.setCompareMarker(null)
    }
  }

  updateSummaryIndicators() {
    if (!this.hasSummaryIndicatorsTarget) return

    this.summaryIndicatorsController(this.summaryIndicatorsTarget)?.update(
      this.rangeSummary,
      this.units
    )
  }

  summaryIndicatorsController(element) {
    return this.application.getControllerForElementAndIdentifier(
      element,
      'summary-indicators'
    )
  }

  toggleDesignatedLane() {
    if (this.designatedLaneToggleTarget.checked) {
      this.laneEditor?.show()
    } else {
      this.laneEditor?.hide()
    }
  }

  get laneEditor() {
    if (!this.map || !this.points?.length) return null

    this._laneEditor ??= new DesignatedLaneEditor({
      map: this.map,
      points: this.points,
      referencePointUrl: this.hasReferencePointUrlValue
        ? this.referencePointUrlValue
        : null,
      referencePointData: this.referencePointData,
      formatAltitude: altitude => this.altitudeLabelText(altitude)
    })
    return this._laneEditor
  }

  get exitTime() {
    this._exitTime ??= timeOf(findExitPoint(this.points))
    return this._exitTime
  }

  altitudeLabelText(altitude) {
    return `${Math.round(convertLength(altitude, this.units))} ${lengthUnitLabel(this.units)}`
  }

  updateCompareSummaryIndicators() {
    if (!this.hasCompareSummaryIndicatorsTarget) return

    this.summaryIndicatorsController(this.compareSummaryIndicatorsTarget)?.update(
      this.compareRangeSummary,
      this.units
    )
  }

  disconnect() {
    this.stopPlaybackLoop()
    this._laneEditor?.destroy()
    this.sideView?.destroy()
    this.polarView?.destroy()
    this.destroyCharts()
  }
}
