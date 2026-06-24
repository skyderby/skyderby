import { Controller } from '@hotwired/stimulus'
import {
  initGlideChart,
  initSpeedsChart,
  initAccuracyChart,
  initAltitudeDistanceChart,
  initCombinedChart,
  findPositionForAltitude
} from 'charts'
import { lengthUnitLabel } from 'utils/units'
import initMapsApi from 'utils/google_maps_api'
import cropPoints from 'utils/cropPoints'
import downsamplePoints from 'utils/downsamplePoints'
import calculateWindCancellation, { WeatherData } from 'utils/windCancellation'
import RangeSummary from 'charts/RangeSummary'
import { createDesignatedLane } from 'utils/laneValidation/designatedLane'
import { interpolatePointByTime } from 'utils/laneValidation/utils'
import { computeBestWindows } from 'utils/tracks/bestWindows'
import SkydivePerformanceSideView from 'utils/tracks/SkydivePerformanceSideView'
import SkydivePerformancePolar from 'utils/tracks/SkydivePerformancePolar'
import TrackMap from 'utils/tracks/map/TrackMap'
import {
  calculateBearing,
  targetIndexFrom,
  closestIndexByPlayerTime,
  interpolateByPlayerTime
} from 'utils/tracks/pointHelpers'

export default class extends Controller {
  static targets = [
    'sideProjection',
    'grid',
    'trajectory',
    'glideChart',
    'speedChart',
    'polarChart',
    'stageToggle',
    'polarPanel',
    'mapPanel',
    'map',
    'playButton',
    'playbackSlider',
    'playbackIndicators',
    'comparePlaybackIndicators',
    'summaryIndicators',
    'compareSummaryIndicators',
    'range3000to2000',
    'range2500to1500',
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
    'compareModal'
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
    trackId: Number
  }

  connect() {
    this.playing = false
    this.currentIndex = 0
    this.referencePointData = null
    this.comparePoints = null
    this.initializeStraightLine()
    this.initializeChartsMode()
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
            this.showEmptyState()
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
        this.showEmptyState()
      })
  }

  showEmptyState() {
    if (this.hasEmptyStateTarget) {
      this.emptyStateTarget.classList.remove('hidden')
    }
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
        value: Math.round(result.speed.value)
      },
      {
        target: this.hasBestDistanceTarget && this.bestDistanceTarget,
        window: result.distance,
        value: Math.round(result.distance.value)
      },
      {
        target: this.hasBestTimeTarget && this.bestTimeTarget,
        window: result.time,
        value: result.time.value.toFixed(1)
      }
    ]

    shortcuts.forEach(({ target, window, value }) => {
      if (!target) return
      target.dataset.from = window.from
      target.dataset.to = window.to
      target.querySelector('[data-best-window-range]').textContent =
        `${window.from} — ${window.to}`
      target.querySelector('[data-best-window-value]').textContent = value
      target.classList.remove('hidden')
    })
  }

  initDesignatedLane() {
    if (this.referencePointData?.reference_point && this.hasDesignatedLaneToggleTarget) {
      this.designatedLaneToggleTarget.checked = true
      this.showDesignatedLane()
    }
  }

  initializeStraightLine() {
    const url = new URL(window.location)
    this.straightLine = url.searchParams.get('straight-line') === 'true'
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
    event.currentTarget.closest('[popover]')?.hidePopover()
    this.updateChartsModeUI()

    if (!this.points || this.points.length === 0) return

    this.destroyCharts()
    this.renderCharts()
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
      let compareWindowPoints = cropPoints(
        this.comparePoints,
        this.fromValue,
        this.toValue
      )
      if (compareWindowPoints.length > 0) {
        if (this.hasWeatherData) {
          compareWindowPoints = calculateWindCancellation(
            compareWindowPoints,
            this.weatherData
          )
        }
        this.compareRangeSummary = new RangeSummary(compareWindowPoints, {
          straightLine: this.straightLine
        })
      }
    }
    this.updateSummaryIndicators()
    if (this.comparePoints) {
      this.updateCompareSummaryIndicators()
    }
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
        })
        return data
      })
  }

  fetchWeather() {
    if (!this.hasWeatherUrlValue) return Promise.resolve([])

    return fetch(this.weatherUrlValue, {
      headers: { Accept: 'application/json' }
    })
      .then(response => {
        if (!response.ok) return []
        return response.json()
      })
      .catch(() => [])
  }

  fetchCompareWeather() {
    if (!this.hasCompareWeatherUrlValue) return Promise.resolve([])

    return fetch(this.compareWeatherUrlValue, {
      headers: { Accept: 'application/json' }
    })
      .then(response => {
        if (!response.ok) return []
        return response.json()
      })
      .catch(() => [])
  }

  fetchReferencePoint() {
    if (!this.hasReferencePointUrlValue) return Promise.resolve(null)

    return fetch(this.referencePointUrlValue, {
      headers: { Accept: 'application/json' }
    })
      .then(response => {
        if (!response.ok) return null
        return response.json()
      })
      .catch(() => null)
  }

  fetchComparePoints() {
    if (!this.hasComparePointsUrlValue) return Promise.resolve(null)

    return fetch(this.comparePointsUrlValue, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        data.points.forEach(point => {
          point.gpsTime = new Date(point.gpsTime)
          point.hSpeed = point.hSpeed * 3.6
          point.vSpeed = point.vSpeed * 3.6
          point.fullSpeed = point.fullSpeed * 3.6
        })
        return data
      })
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
    this.updateView()
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
    this.updateView()
  }

  resetRange() {
    this.fromValue = this.maxAltitude
    this.toValue = this.minAltitude

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.updateSlider(this.maxAltitude, this.minAltitude)
    }

    this.clearRangeUrl()
    this.updateView()
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

  updateView() {
    this.windowPoints = cropPoints(this.points, this.fromValue, this.toValue)

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
      compareReferenceTime: this.comparePoints?.[0]?.gpsTime
    })
  }

  handleSideViewSeek(index) {
    this.currentIndex = index
    this.currentFraction = 0
    this.updatePlaybackPosition()
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

  processPoints() {
    if (this.points.length === 0 || this.chartPoints.length === 0) return []

    let points = this.points
    if (this.hasWeatherData) {
      points = calculateWindCancellation(points, this.weatherData)
    }

    return this.buildPoints(points, this.chartPoints[0])
  }

  buildPoints(points, timeAnchor) {
    const startTime = timeAnchor.gpsTime.getTime()

    let distance = 0

    return points.map((point, index) => {
      const gpsTime = point.gpsTime.getTime()
      const playerTime = (gpsTime - startTime) / 1000
      if (index > 0) {
        distance += this.calculateDistance(point, points[index - 1])
      }

      return {
        playerTime,
        altitude: point.altitude,
        distance,
        latitude: point.latitude,
        longitude: point.longitude,
        hSpeed: point.hSpeed,
        vSpeed: point.vSpeed,
        fullSpeed: point.fullSpeed,
        glideRatio: point.glideRatio,
        gpsTime
      }
    })
  }

  buildCompareProcessedPoints(primaryEntryDistance) {
    const primaryStartTime = this.chartPoints[0].gpsTime.getTime()

    let distance = 0
    const points = this.comparePoints.map((point, index) => {
      if (index > 0) {
        distance += this.calculateDistance(point, this.comparePoints[index - 1])
      }
      const srcGpsTime = point.gpsTime.getTime()
      const gpsTime = srcGpsTime + this.compareTimeOffset

      return {
        playerTime: (gpsTime - primaryStartTime) / 1000,
        altitude: point.altitude,
        distance,
        latitude: point.latitude,
        longitude: point.longitude,
        hSpeed: point.hSpeed,
        vSpeed: point.vSpeed,
        fullSpeed: point.fullSpeed,
        glideRatio: point.glideRatio,
        gpsTime,
        srcGpsTime
      }
    })

    const compareEntryDistance = this.findDistanceAtWindowEntry(points, this.fromValue)
    const distanceOffset = primaryEntryDistance - compareEntryDistance
    points.forEach(point => {
      point.distance += distanceOffset
    })

    return points
  }

  calculateDistance(point, startPoint) {
    const R = 6371000
    const lat1 = (startPoint.latitude * Math.PI) / 180
    const lat2 = (point.latitude * Math.PI) / 180
    const deltaLat = ((point.latitude - startPoint.latitude) * Math.PI) / 180
    const deltaLon = ((point.longitude - startPoint.longitude) * Math.PI) / 180

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  processCompareTrack() {
    if (!this.comparePoints || this.comparePoints.length === 0) return

    const primaryWindowEntry = this.findWindowEntryTime(this.points, this.fromValue)
    const compareWindowEntry = this.findWindowEntryTime(
      this.comparePoints,
      this.fromValue
    )

    if (!primaryWindowEntry || !compareWindowEntry) {
      this.compareChartPoints = []
      this.compareProcessedPoints = []
      this.compareRangeSummary = null
      return
    }

    this.compareTimeOffset = primaryWindowEntry - compareWindowEntry

    const rangeStartTime = this.windowPoints[0].gpsTime.getTime()
    const rangeEndTime = this.windowPoints.at(-1).gpsTime.getTime()
    const bufferSeconds = 3

    const adjustedStartTime =
      rangeStartTime - this.compareTimeOffset - bufferSeconds * 1000
    const adjustedEndTime = rangeEndTime - this.compareTimeOffset + bufferSeconds * 1000

    let compareChartPoints = this.comparePoints.filter(
      point =>
        point.gpsTime.getTime() >= adjustedStartTime &&
        point.gpsTime.getTime() <= adjustedEndTime
    )

    if (compareChartPoints.length === 0) {
      this.compareChartPoints = []
      this.compareProcessedPoints = []
      this.compareRangeSummary = null
      return
    }

    this.compareChartPoints = compareChartPoints

    const primaryEntryFlTime = this.findFlTimeAtWindowEntry(
      this.chartPoints,
      this.fromValue
    )
    const compareEntryFlTime = this.findFlTimeAtWindowEntry(
      compareChartPoints,
      this.fromValue
    )
    const primaryChartStartTime = this.chartPoints[0].flTime
    const primaryEntryX = primaryEntryFlTime - primaryChartStartTime
    const compareEntryX = compareEntryFlTime - compareChartPoints[0].flTime
    this.chartTimeOffset = primaryEntryX - compareEntryX

    const primaryEntryDistance = this.findDistanceAtWindowEntry(
      this.processedPoints,
      this.fromValue
    )

    this.compareProcessedPoints = this.buildCompareProcessedPoints(primaryEntryDistance)

    let compareWindowPoints = cropPoints(this.comparePoints, this.fromValue, this.toValue)
    if (compareWindowPoints.length > 0) {
      if (this.hasWeatherData) {
        compareWindowPoints = calculateWindCancellation(
          compareWindowPoints,
          this.weatherData
        )
      }
      this.compareRangeSummary = new RangeSummary(compareWindowPoints, {
        straightLine: this.straightLine
      })
    }
  }

  findFlTimeAtWindowEntry(points, windowAltitude) {
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (curr.altitude >= windowAltitude && next.altitude < windowAltitude) {
        const fraction =
          (curr.altitude - windowAltitude) / (curr.altitude - next.altitude)
        return curr.flTime + (next.flTime - curr.flTime) * fraction
      }
    }
    return points[0]?.flTime || 0
  }

  findDistanceAtWindowEntry(processedPoints, windowAltitude) {
    for (let i = 0; i < processedPoints.length - 1; i++) {
      const curr = processedPoints[i]
      const next = processedPoints[i + 1]

      if (curr.altitude >= windowAltitude && next.altitude < windowAltitude) {
        const fraction =
          (curr.altitude - windowAltitude) / (curr.altitude - next.altitude)
        return curr.distance + (next.distance - curr.distance) * fraction
      }
    }
    return processedPoints[0]?.distance || 0
  }

  findWindowEntryIndex(points, windowAltitude) {
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (curr.altitude >= windowAltitude && next.altitude < windowAltitude) {
        const fraction =
          (curr.altitude - windowAltitude) / (curr.altitude - next.altitude)
        return { index: i, fraction }
      }
    }
    return null
  }

  findWindowEntryTime(points, windowAltitude) {
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (curr.altitude >= windowAltitude && next.altitude < windowAltitude) {
        const fraction =
          (curr.altitude - windowAltitude) / (curr.altitude - next.altitude)
        const entryTime =
          curr.gpsTime.getTime() +
          fraction * (next.gpsTime.getTime() - curr.gpsTime.getTime())
        return entryTime
      }
    }
    return null
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

    const index = closestIndexByPlayerTime(this.processedPoints, point.x)
    if (index < 0) return

    this.currentIndex = index
    this.currentFraction = 0
    this.updatePlaybackPosition()
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
        xOffset: this.chartXOffset
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
        xOffset: this.chartXOffset
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
        xOffset: this.chartXOffset
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
        xOffset: this.chartXOffset
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
        xOffset: this.chartXOffset
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
              text: `${altitude} ${lengthUnitLabel('metric')}`,
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

  toggleStagePanel(event) {
    const showMap = event.currentTarget.checked

    if (this.hasPolarPanelTarget) {
      this.polarPanelTarget.classList.toggle('hidden', showMap)
    }
    if (this.hasMapPanelTarget) {
      this.mapPanelTarget.classList.toggle('hidden', !showMap)
    }

    if (showMap) this.showMap()
  }

  showMap() {
    if (!this.hasMapTarget) return

    if (this.mapReady) {
      this.updateMapMarkerAtIndex(this.currentIndex)
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
        this.updateMapMarkerAtIndex(this.currentIndex)
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
    if (!this.hasPlaybackSliderTarget || this.processedPoints.length === 0) return

    this.playbackSliderTarget.max = this.processedPoints.length - 1
    this.playbackSliderTarget.value = 0
    this.currentIndex = 0
  }

  togglePlay() {
    this.playing = !this.playing

    if (this.hasPlayButtonTarget) {
      this.playButtonTarget.classList.toggle('playing', this.playing)
    }

    if (this.playing) {
      const firstPointTime = this.processedPoints[0].gpsTime
      const currentPointTime = this.processedPoints[this.currentIndex].gpsTime
      this.playbackOffset = currentPointTime - firstPointTime
      this.playbackStartTime = performance.now()
      this.animationFrame = requestAnimationFrame(t => this.animate(t))
    } else {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
    }
  }

  animate(timestamp) {
    if (!this.playing) return

    const elapsed = timestamp - this.playbackStartTime
    const firstPointTime = this.processedPoints[0].gpsTime
    const targetTime = firstPointTime + this.playbackOffset + elapsed
    const lastPointTime = this.processedPoints[this.processedPoints.length - 1].gpsTime

    if (targetTime >= lastPointTime) {
      this.playing = false
      this.currentIndex = this.processedPoints.length - 1
      if (this.hasPlayButtonTarget) {
        this.playButtonTarget.classList.remove('playing')
      }
      this.updatePlaybackPosition()
      return
    }

    const { index, fraction } = this.findPointAtTime(targetTime)
    this.currentIndex = index
    this.currentFraction = fraction
    this.updatePlaybackPositionInterpolated()

    this.animationFrame = requestAnimationFrame(t => this.animate(t))
  }

  findPointAtTime(targetTime) {
    for (let i = 0; i < this.processedPoints.length - 1; i++) {
      const currTime = this.processedPoints[i].gpsTime
      const nextTime = this.processedPoints[i + 1].gpsTime

      if (targetTime >= currTime && targetTime < nextTime) {
        const fraction = (targetTime - currTime) / (nextTime - currTime)
        return { index: i, fraction }
      }
    }

    return { index: this.processedPoints.length - 1, fraction: 0 }
  }

  onSliderInput() {
    this.currentIndex = parseInt(this.playbackSliderTarget.value, 10)
    this.currentFraction = 0
    this.updatePlaybackPosition()
  }

  updatePlaybackPosition() {
    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = this.currentIndex
    }

    this.sideView?.setPosition(this.currentIndex, 0, false)
    this.updateHighchartsCrosshair(this.currentIndex)
    this.updatePlaybackIndicators(this.currentIndex, 0)
    this.updateMapMarkerAtIndex(this.currentIndex)
    this.updatePolarMarker()
  }

  updatePlaybackPositionInterpolated() {
    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = this.currentIndex
    }

    this.sideView?.setPosition(this.currentIndex, this.currentFraction, true)
    this.updateHighchartsCrosshair(this.currentIndex)
    this.updatePlaybackIndicators(this.currentIndex, this.currentFraction)
    this.updateMapMarkerInterpolated()
    this.updatePolarMarker()
  }

  updatePolarMarker() {
    if (!this.polarView) return

    const point = this.processedPoints?.[this.currentIndex]
    this.polarView.setMarker(point ? point.gpsTime : null)

    if (point && this.compareProcessedPoints?.length) {
      const index = closestIndexByPlayerTime(
        this.compareProcessedPoints,
        point.playerTime
      )
      const comparePoint = this.compareProcessedPoints[index]
      this.polarView.setCompareMarker(comparePoint ? comparePoint.srcGpsTime : null)
    } else {
      this.polarView.setCompareMarker(null)
    }
  }

  updateSummaryIndicators() {
    if (!this.hasSummaryIndicatorsTarget) return

    this.summaryIndicatorsController(this.summaryIndicatorsTarget)?.update(
      this.rangeSummary
    )
  }

  summaryIndicatorsController(element) {
    return this.application.getControllerForElementAndIdentifier(
      element,
      'summary-indicators'
    )
  }

  updatePlaybackIndicators(index, fraction) {
    const curr = this.processedPoints[index]
    const next =
      this.processedPoints[Math.min(index + 1, this.processedPoints.length - 1)]

    const interpolate = (a, b) => a + (b - a) * fraction

    const primaryData = {
      altitude: interpolate(curr.altitude, next.altitude),
      fullSpeed: interpolate(curr.fullSpeed, next.fullSpeed),
      hSpeed: interpolate(curr.hSpeed, next.hSpeed),
      vSpeed: interpolate(curr.vSpeed, next.vSpeed),
      glideRatio: interpolate(curr.glideRatio ?? 0, next.glideRatio ?? 0)
    }

    if (this.hasPlaybackIndicatorsTarget) {
      const controller = this.getPlaybackIndicatorsController(
        this.playbackIndicatorsTarget
      )
      if (controller) controller.update(primaryData)
    }

    this.updateAccelerationIndicators(index, fraction)

    if (this.hasComparePlaybackIndicatorsTarget && this.compareProcessedPoints?.length) {
      const targetTime = curr.playerTime + (next.playerTime - curr.playerTime) * fraction
      const compareData = interpolateByPlayerTime(this.compareProcessedPoints, targetTime)
      if (compareData) {
        const compareController = this.getPlaybackIndicatorsController(
          this.comparePlaybackIndicatorsTarget
        )
        if (compareController) {
          compareController.update(compareData)

          const futureCompare = interpolateByPlayerTime(
            this.compareProcessedPoints,
            targetTime + 1
          )
          if (futureCompare) {
            compareController.updateAcceleration({
              fullSpeedAccel: (futureCompare.fullSpeed - compareData.fullSpeed) / 3.6,
              hSpeedAccel: (futureCompare.hSpeed - compareData.hSpeed) / 3.6,
              vSpeedAccel: (futureCompare.vSpeed - compareData.vSpeed) / 3.6
            })
          }
        }
      }
    }
  }

  getPlaybackIndicatorsController(element) {
    return this.application.getControllerForElementAndIdentifier(
      element,
      'playback-indicators'
    )
  }

  updateAccelerationIndicators(index, fraction) {
    if (!this.hasPlaybackIndicatorsTarget) return

    const controller = this.getPlaybackIndicatorsController(this.playbackIndicatorsTarget)
    if (!controller) return

    const futureIndex = this.findFutureIndexFrom(index, 1000)
    if (futureIndex === null) return

    const curr = this.processedPoints[index]
    const next =
      this.processedPoints[Math.min(index + 1, this.processedPoints.length - 1)]
    const future = this.processedPoints[futureIndex]

    const interpolate = (a, b) => a + (b - a) * fraction

    const currFullSpeed = interpolate(curr.fullSpeed, next.fullSpeed) / 3.6
    const currHSpeed = interpolate(curr.hSpeed, next.hSpeed) / 3.6
    const currVSpeed = interpolate(curr.vSpeed, next.vSpeed) / 3.6
    const futureFullSpeed = future.fullSpeed / 3.6
    const futureHSpeed = future.hSpeed / 3.6
    const futureVSpeed = future.vSpeed / 3.6

    const currTime = curr.gpsTime + fraction * (next.gpsTime - curr.gpsTime)
    const deltaTime = (future.gpsTime - currTime) / 1000

    controller.updateAcceleration({
      fullSpeedAccel: (futureFullSpeed - currFullSpeed) / deltaTime,
      hSpeedAccel: (futureHSpeed - currHSpeed) / deltaTime,
      vSpeedAccel: (futureVSpeed - currVSpeed) / deltaTime
    })
  }

  findFutureIndexFrom(fromIndex, milliseconds) {
    const currentTime = this.processedPoints[fromIndex].gpsTime
    const targetTime = currentTime + milliseconds

    for (let i = fromIndex + 1; i < this.processedPoints.length; i++) {
      if (this.processedPoints[i].gpsTime >= targetTime) {
        return i
      }
    }

    return null
  }

  updateHighchartsCrosshair(index) {
    const point = this.processedPoints[index]
    if (!point) return

    const targetX = point.playerTime

    const charts = [
      this.glideChartTarget?.chart,
      this.speedChartTarget?.chart,
      this.sepChartTarget?.chart
    ].filter(Boolean)

    charts.forEach(chart => {
      const baseSeries = chart.series.find(
        series => series.visible && series.points?.length
      )
      if (!baseSeries) return

      const basePoints = baseSeries.points
      const firstX = basePoints[0].x
      const lastX = basePoints[basePoints.length - 1].x

      if (targetX < firstX || targetX > lastX) {
        chart.tooltip?.hide()
        chart.xAxis[0]?.hideCrosshair()
        return
      }

      const chartIndex = this.findNearestChartIndex(basePoints, targetX)
      const points = chart.series
        .filter(series => series.visible)
        .map(series => series.points[chartIndex])
        .filter(Boolean)

      if (points.length > 0) {
        points[0].onMouseOver()
        chart.tooltip.refresh(points)
        chart.xAxis[0].drawCrosshair(null, points[0])
      }
    })
  }

  findNearestChartIndex(points, targetX) {
    let nearestIndex = 0
    let minDiff = Infinity

    points.forEach((point, index) => {
      const diff = Math.abs(point.x - targetX)
      if (diff < minDiff) {
        minDiff = diff
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  updateMapMarkerAtIndex(index) {
    if (!this.trackMap) return

    const point = this.processedPoints[index]
    if (!point) return

    const targetIndex = targetIndexFrom(this.processedPoints, index)
    const heading = calculateBearing(point, this.processedPoints[targetIndex])

    this.trackMap.setPosition(point, heading)
  }

  updateMapMarkerInterpolated() {
    if (!this.trackMap) return

    const curr = this.processedPoints[this.currentIndex]
    const next =
      this.processedPoints[
        Math.min(this.currentIndex + 1, this.processedPoints.length - 1)
      ]
    const fraction = this.currentFraction

    const point = {
      latitude: curr.latitude + (next.latitude - curr.latitude) * fraction,
      longitude: curr.longitude + (next.longitude - curr.longitude) * fraction
    }

    const targetIndex = targetIndexFrom(this.processedPoints, this.currentIndex)
    const heading = calculateBearing(point, this.processedPoints[targetIndex])

    this.trackMap.setPosition(point, heading)
  }

  toggleDesignatedLane() {
    const enabled = this.designatedLaneToggleTarget.checked

    if (enabled) {
      this.showDesignatedLane()
    } else {
      this.hideDesignatedLane()
    }
  }

  showDesignatedLane() {
    if (!this.map || !this.points.length) return

    this.clearDesignatedLane()

    const exitPoint = this.findExitPoint()
    if (!exitPoint) return

    const exitTime = exitPoint.gpsTime.getTime()
    const dlStartTime = exitTime + 9000
    const dlStartPoint = interpolatePointByTime(this.points, dlStartTime)

    if (!dlStartPoint) return

    let referencePoint
    if (this.referencePointData?.reference_point) {
      referencePoint = {
        latitude: this.referencePointData.reference_point.latitude,
        longitude: this.referencePointData.reference_point.longitude
      }
    } else {
      const lastPoint = this.points.at(-1)
      referencePoint = {
        latitude: lastPoint.latitude,
        longitude: lastPoint.longitude
      }
    }

    const isEditable = this.referencePointData?.editable ?? false

    const windowEndPoint = this.points.at(-1)

    this.designatedLane = createDesignatedLane(
      this.map,
      dlStartPoint,
      windowEndPoint,
      windowEndPoint,
      referencePoint,
      this.points,
      'window_end'
    )

    this.createReferenceMarker(referencePoint, isEditable)
  }

  findExitPoint() {
    const verticalSpeedThreshold = 10 * 3.6
    const consecutiveRequired = 15

    for (let i = 0; i <= this.points.length - consecutiveRequired; i++) {
      const range = this.points.slice(i, i + consecutiveRequired)
      const allAboveThreshold = range.every(
        point => point.vSpeed > verticalSpeedThreshold
      )

      if (allAboveThreshold) {
        return this.points[i]
      }
    }

    return this.points[0]
  }

  createReferenceMarker(referencePoint, isEditable) {
    if (this.referencePointMarker) {
      this.referencePointMarker.map = null
    }

    const pin = new google.maps.marker.PinElement({
      background: '#FF5722',
      borderColor: '#E64A19',
      glyphColor: '#fff',
      scale: 0.7
    })

    const content = document.createElement('div')
    content.style.position = 'relative'
    if (isEditable) content.style.cursor = 'grab'

    if (isEditable) {
      const hitArea = document.createElement('div')
      hitArea.style.position = 'absolute'
      hitArea.style.left = '50%'
      hitArea.style.top = '50%'
      hitArea.style.width = '48px'
      hitArea.style.height = '48px'
      hitArea.style.borderRadius = '50%'
      hitArea.style.transform = 'translate(-50%, -50%)'
      content.appendChild(hitArea)
    }

    content.appendChild(pin.element)

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: new google.maps.LatLng(referencePoint.latitude, referencePoint.longitude),
      content,
      gmpDraggable: isEditable,
      zIndex: 1000
    })
    marker.pin = pin

    marker.addListener('dragend', () => {
      this.saveReferencePoint()
    })

    this.referencePointMarker = marker
  }

  hideDesignatedLane() {
    this.clearDesignatedLane()
    if (this.referencePointMarker) {
      this.referencePointMarker.map = null
    }
  }

  clearDesignatedLane() {
    if (this.designatedLane) {
      this.designatedLane.cleanup()
      this.designatedLane = null
    }
  }

  saveReferencePoint() {
    if (!this.referencePointMarker || !this.hasReferencePointUrlValue) return

    const position = this.referencePointMarker.position
    const hasExisting = this.referencePointData?.reference_point

    const method = hasExisting ? 'PATCH' : 'POST'

    fetch(this.referencePointUrlValue, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
      },
      body: JSON.stringify({
        reference_point: {
          latitude: position.lat,
          longitude: position.lng
        }
      })
    })
      .then(response => response.json())
      .then(data => {
        this.referencePointData = data
        if (this.designatedLaneToggleTarget.checked) {
          this.showDesignatedLane()
        }
      })
  }

  updateCompareSummaryIndicators() {
    if (!this.hasCompareSummaryIndicatorsTarget) return

    this.summaryIndicatorsController(this.compareSummaryIndicatorsTarget)?.update(
      this.compareRangeSummary
    )
  }

  compareModalTargetConnected(element) {
    this.compareModalObserver = new MutationObserver(() => {
      document.body.classList.toggle('overflow-hidden', element.open)
    })
    this.compareModalObserver.observe(element, { attributeFilter: ['open'] })
  }

  compareModalTargetDisconnected() {
    this.compareModalObserver?.disconnect()
    document.body.classList.remove('overflow-hidden')
  }

  openCompareModal() {
    if (!this.hasCompareModalTarget) return

    this.compareModalTarget.showModal()
  }

  selectCompareTrack(event) {
    const item = event.target.closest('a.tracks-item')
    if (!item) return

    event.preventDefault()

    const trackId = item.dataset.id
    if (!trackId || Number(trackId) === this.trackIdValue) return

    const url = new URL(window.location)
    url.searchParams.set('compare_id', trackId)

    if (!url.searchParams.has('f') && !url.searchParams.has('t')) {
      url.searchParams.set('f', 2500)
      url.searchParams.set('t', 1500)
    }

    Turbo.visit(url.toString())
  }

  disconnect() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    this.sideView?.destroy()
    this.polarView?.destroy()
    this.destroyCharts()
  }
}
