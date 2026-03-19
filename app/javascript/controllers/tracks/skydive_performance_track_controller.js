import { Controller } from '@hotwired/stimulus'
import { initGlideChart, initSpeedsChart, initAccuracyChart } from 'charts'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import cropPoints from 'utils/cropPoints'
import downsamplePoints from 'utils/downsamplePoints'
import calculateWindCancellation from 'utils/windCancellation'
import RangeSummary from 'charts/RangeSummary'
import { createDesignatedLane } from 'utils/laneValidation/designatedLane'
import { interpolatePointByTime } from 'utils/laneValidation/utils'
import { detectFlares, drawFlares } from 'utils/tracks/flareDetection'
import debounce from 'lodash.debounce'

const CHART_PADDING = { left: 60, right: 20, top: 10, bottom: 10 }

export default class extends Controller {
  static targets = [
    'sideProjection',
    'grid',
    'trajectory',
    'glideChart',
    'speedChart',
    'map',
    'playButton',
    'playbackSlider',
    'playbackIndicators',
    'comparePlaybackIndicators',
    'fullSpeedAccel',
    'hSpeedAccel',
    'vSpeedAccel',
    'distance',
    'groundSpeed',
    'groundSpeedMax',
    'groundSpeedMin',
    'summaryGlideRatio',
    'glideRatioMax',
    'glideRatioMin',
    'elevation',
    'verticalSpeed',
    'verticalSpeedMax',
    'verticalSpeedMin',
    'duration',
    'range3000to2000',
    'range2500to1500',
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
    'designatedLaneToggle',
    'straightLineToggle',
    'sepChart',
    'compareModal',
    'compareSearchInput',
    'compareResults',
    'compareMap',
    'compareDistance',
    'compareGroundSpeed',
    'compareGroundSpeedMax',
    'compareGroundSpeedMin',
    'compareSummaryGlideRatio',
    'compareGlideRatioMax',
    'compareGlideRatioMin',
    'compareElevation',
    'compareVerticalSpeed',
    'compareVerticalSpeedMax',
    'compareVerticalSpeedMin',
    'compareDuration',
    'compareWindEffectContainerDistance',
    'compareWindEffectDistancePercent',
    'compareWindEffectDistanceWindPercent',
    'compareWindEffectDistance',
    'compareWindEffectDistanceWind',
    'compareWindEffectContainerSpeed',
    'compareWindEffectSpeedPercent',
    'compareWindEffectSpeedWindPercent',
    'compareWindEffectSpeed',
    'compareWindEffectSpeedWind',
    'compareWindEffectContainerGlideRatio',
    'compareWindEffectGlideRatioPercent',
    'compareWindEffectGlideRatioWindPercent',
    'compareWindEffectGlideRatio',
    'compareWindEffectGlideRatioWind'
  ]

  static outlets = ['tracks--range-selector']

  static values = {
    pointsUrl: String,
    locationArrowUrl: String,
    weatherUrl: String,
    referencePointUrl: String,
    comparePointsUrl: String,
    compareTrackName: String,
    trackId: Number,
    searchUrl: String
  }

  connect() {
    this.playing = false
    this.currentIndex = 0
    this.referencePointData = null
    this.comparePoints = null
    this.searchCompareTracks = debounce(this.searchCompareTracks.bind(this), 300)
    this.initializeStraightLine()

    const fetches = [
      this.fetchPoints(),
      this.fetchWeather(),
      this.fetchReferencePoint(),
      initMapsApi()
    ]

    if (this.hasComparePointsUrlValue) {
      fetches.push(this.fetchComparePoints())
    }

    Promise.all(fetches).then(
      ([pointsData, weatherData, referencePointData, _, compareData]) => {
        this.points = pointsData.points
        this.weatherData = weatherData
        this.referencePointData = referencePointData
        if (compareData) {
          this.comparePoints = compareData.points
        }
        this.initializeRange()
        this.updateView()
        this.initDesignatedLane()
      }
    )
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

    this.calculateRanges()

    this.destroyCharts()
    this.renderSideProjection()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initSepChart()
    this.renderMap()
    if (this.comparePoints) {
      this.renderCompareMap()
    }
    this.initPlayback()
    this.updateSummaryIndicators()
    if (this.comparePoints) {
      this.updateCompareSummaryIndicators()
    }
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
    if (this.chartPoints.length === 0) return []

    const startPoint = this.chartPoints[0]
    const startTime = startPoint.gpsTime.getTime()

    return this.chartPoints.map(point => {
      const gpsTime = point.gpsTime.getTime()
      const playerTime = (gpsTime - startTime) / 1000
      const distance = this.calculateDistance(point, startPoint)

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

  calculateRanges() {
    if (this.processedPoints.length === 0) {
      this.distanceRange = { min: 0, max: 1000 }
      this.timeRange = { min: 0, max: 60 }
      return
    }

    let minDist = 0
    let maxDist = 0
    let minTime = Infinity
    let maxTime = -Infinity

    this.processedPoints.forEach(p => {
      maxDist = Math.max(maxDist, p.distance)
      minTime = Math.min(minTime, p.playerTime)
      maxTime = Math.max(maxTime, p.playerTime)
    })

    if (this.compareProcessedPoints) {
      this.compareProcessedPoints.forEach(p => {
        maxDist = Math.max(maxDist, p.distance)
      })
    }

    this.distanceRange = { min: minDist - 50, max: maxDist + 100 }
    this.timeRange = { min: minTime, max: maxTime }
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

    const compareStartPoint = compareChartPoints[0]
    const compareDistances = compareChartPoints.map(point =>
      this.calculateDistance(point, compareStartPoint)
    )

    const compareEntryIndexInfo = this.findWindowEntryIndex(
      compareChartPoints,
      this.fromValue
    )
    let compareEntryDistance = 0
    if (compareEntryIndexInfo) {
      const { index, fraction } = compareEntryIndexInfo
      const d1 = compareDistances[index]
      const d2 = compareDistances[Math.min(index + 1, compareDistances.length - 1)]
      compareEntryDistance = d1 + (d2 - d1) * fraction
    }

    const distanceOffset = primaryEntryDistance - compareEntryDistance

    const primaryStartTime = this.chartPoints[0].gpsTime.getTime()

    this.compareProcessedPoints = compareChartPoints.map((point, idx) => {
      const adjustedGpsTime = point.gpsTime.getTime() + this.compareTimeOffset
      const playerTime = (adjustedGpsTime - primaryStartTime) / 1000
      const distance = compareDistances[idx] + distanceOffset

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
        gpsTime: adjustedGpsTime
      }
    })

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

  renderSideProjection() {
    if (!this.hasSideProjectionTarget || this.processedPoints.length === 0) return

    this.renderGrid()
    this.renderTrajectoryContent()
    this.renderZoomLens()
    this.setupInteraction()
  }

  renderGrid() {
    const grid = this.gridTarget
    grid.innerHTML = ''

    const { left, right, top, bottom } = CHART_PADDING

    const altitudeBuffer = (this.fromValue - this.toValue) * 0.1
    this.altitudeRange = {
      top: this.fromValue + altitudeBuffer,
      bottom: this.toValue - altitudeBuffer
    }

    const totalAltitudeRange = this.altitudeRange.top - this.altitudeRange.bottom
    const totalDistanceRange = this.distanceRange.max - this.distanceRange.min

    const baseHeight = 600
    const plotHeight = baseHeight - top - bottom
    const plotWidth = plotHeight * (totalDistanceRange / totalAltitudeRange)
    const width = plotWidth + left + right
    const height = baseHeight

    this.chartDimensions = { width, height, plotWidth, plotHeight }
    this.sideProjectionTarget.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const altitudeToY = altitude => {
      return top + ((this.altitudeRange.top - altitude) / totalAltitudeRange) * plotHeight
    }

    const windowStartY = altitudeToY(this.fromValue)
    const windowEndY = altitudeToY(this.toValue)

    const startLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    startLine.setAttribute('x1', left)
    startLine.setAttribute('y1', windowStartY)
    startLine.setAttribute('x2', width - right)
    startLine.setAttribute('y2', windowStartY)
    startLine.setAttribute('class', 'grid-line-window-start')
    grid.appendChild(startLine)

    const startLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    startLabel.setAttribute('x', left - 10)
    startLabel.setAttribute('y', windowStartY + 4)
    startLabel.setAttribute('class', 'grid-label grid-label-window')
    startLabel.textContent = this.fromValue
    grid.appendChild(startLabel)

    const endLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    endLine.setAttribute('x1', left)
    endLine.setAttribute('y1', windowEndY)
    endLine.setAttribute('x2', width - right)
    endLine.setAttribute('y2', windowEndY)
    endLine.setAttribute('class', 'grid-line-window-end')
    grid.appendChild(endLine)

    const endLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    endLabel.setAttribute('x', left - 10)
    endLabel.setAttribute('y', windowEndY + 4)
    endLabel.setAttribute('class', 'grid-label grid-label-window')
    endLabel.textContent = this.toValue
    grid.appendChild(endLabel)

    const gridLines = 5
    for (let i = 1; i < gridLines; i++) {
      const altitude = this.fromValue - ((this.fromValue - this.toValue) * i) / gridLines
      const y = altitudeToY(altitude)

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', left)
      line.setAttribute('y1', y)
      line.setAttribute('x2', width - right)
      line.setAttribute('y2', y)
      line.setAttribute('class', 'grid-line')
      grid.appendChild(line)

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', left - 10)
      label.setAttribute('y', y + 4)
      label.setAttribute('class', 'grid-label')
      label.textContent = Math.round(altitude)
      grid.appendChild(label)
    }

    this.renderDistanceGrid(grid, width, height, left, right, top, bottom)
  }

  renderDistanceGrid(grid, width, height, left, right, top, bottom) {
    const plotWidth = width - left - right
    const distanceStep = this.calculateDistanceStep()

    const minDist = Math.ceil(this.distanceRange.min / distanceStep) * distanceStep
    const maxDist = Math.floor(this.distanceRange.max / distanceStep) * distanceStep

    for (let dist = Math.max(0, minDist); dist <= maxDist; dist += distanceStep) {
      const x =
        left +
        ((dist - this.distanceRange.min) /
          (this.distanceRange.max - this.distanceRange.min)) *
          plotWidth

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', x)
      line.setAttribute('y1', top)
      line.setAttribute('x2', x)
      line.setAttribute('y2', height - bottom)
      line.setAttribute('class', 'grid-line-vertical')
      grid.appendChild(line)

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', x)
      label.setAttribute('y', height - bottom + 20)
      label.setAttribute('class', 'grid-label-distance')
      label.textContent = dist
      grid.appendChild(label)
    }
  }

  calculateDistanceStep() {
    const range = this.distanceRange.max - this.distanceRange.min
    if (range > 3000) return 500
    if (range > 1500) return 250
    if (range > 500) return 100
    return 50
  }

  renderTrajectoryContent() {
    const trajectoryGroup = this.trajectoryTarget
    trajectoryGroup.innerHTML = ''

    if (this.processedPoints.length === 0) return

    let defs = this.sideProjectionTarget.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      this.sideProjectionTarget.insertBefore(defs, this.sideProjectionTarget.firstChild)
    }
    defs.innerHTML = ''

    const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    contentGroup.setAttribute('id', 'trajectory-content')

    if (this.compareProcessedPoints && this.compareProcessedPoints.length > 0) {
      const comparePathData = this.compareProcessedPoints
        .map((point, index) => {
          const { x, y } = this.getChartCoordinates(point)
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
        })
        .join(' ')

      const comparePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      comparePath.setAttribute('d', comparePathData)
      comparePath.setAttribute('class', 'track-path--compare')
      contentGroup.appendChild(comparePath)
    }

    const pathData = this.processedPoints
      .map((point, index) => {
        const { x, y } = this.getChartCoordinates(point)
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      })
      .join(' ')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData)
    path.setAttribute('class', 'track-path')
    contentGroup.appendChild(path)

    this.renderFlares(contentGroup)

    defs.appendChild(contentGroup)

    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    useElement.setAttribute('href', '#trajectory-content')
    trajectoryGroup.appendChild(useElement)
  }

  renderFlares(container) {
    const flares = detectFlares(this.processedPoints)
    if (!flares.length) return

    const { plotWidth, plotHeight } = this.chartDimensions
    const { left, top } = CHART_PADDING
    const totalAltitudeRange = this.altitudeRange.top - this.altitudeRange.bottom

    const scaleX = distance => {
      return (
        left +
        ((distance - this.distanceRange.min) /
          (this.distanceRange.max - this.distanceRange.min)) *
          plotWidth
      )
    }

    const scaleY = altitude => {
      return top + ((this.altitudeRange.top - altitude) / totalAltitudeRange) * plotHeight
    }

    drawFlares(container, flares, scaleX, scaleY)
  }

  renderZoomLens() {
    const zoomAltitudeRange = 80
    const zoomStartAlt = this.fromValue
    const zoomEndAlt = this.fromValue - zoomAltitudeRange

    const zoomPoints = this.processedPoints.filter(
      p => p.altitude <= zoomStartAlt && p.altitude >= zoomEndAlt
    )

    if (zoomPoints.length < 2) return

    const startPoint = this.getChartCoordinates(zoomPoints[0])
    const endPoint = this.getChartCoordinates(zoomPoints[zoomPoints.length - 1])

    const minX = Math.min(startPoint.x, endPoint.x)
    const maxX = Math.max(startPoint.x, endPoint.x)
    const minY = Math.min(startPoint.y, endPoint.y)
    const maxY = Math.max(startPoint.y, endPoint.y)

    const padding = 10
    const viewBoxX = minX - padding
    const viewBoxY = minY - padding
    const viewBoxWidth = maxX - minX + padding * 2
    const viewBoxHeight = maxY - minY + padding * 2

    const { width, height } = this.chartDimensions
    const lensWidth = width * 0.5
    const lensHeight = height * 0.25
    const lensX = width - lensWidth - 10
    const lensY = 10

    const lensGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    lensGroup.setAttribute('class', 'zoom-lens')

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bg.setAttribute('x', lensX)
    bg.setAttribute('y', lensY)
    bg.setAttribute('width', lensWidth)
    bg.setAttribute('height', lensHeight)
    bg.setAttribute('fill', 'white')
    bg.setAttribute('fill-opacity', '0.95')
    bg.setAttribute('stroke', 'var(--gray-40)')
    bg.setAttribute('stroke-width', '1')
    bg.setAttribute('rx', '4')
    lensGroup.appendChild(bg)

    const nestedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    nestedSvg.setAttribute('x', lensX)
    nestedSvg.setAttribute('y', lensY)
    nestedSvg.setAttribute('width', lensWidth)
    nestedSvg.setAttribute('height', lensHeight)
    nestedSvg.setAttribute(
      'viewBox',
      `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
    )
    nestedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    const windowEntryY = this.getChartCoordinates({
      altitude: this.fromValue,
      distance: 0
    }).y
    const windowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    windowLine.setAttribute('x1', viewBoxX)
    windowLine.setAttribute('y1', windowEntryY)
    windowLine.setAttribute('x2', viewBoxX + viewBoxWidth)
    windowLine.setAttribute('y2', windowEntryY)
    windowLine.setAttribute('stroke', '#06D6A0')
    windowLine.setAttribute('stroke-width', '3')
    nestedSvg.appendChild(windowLine)

    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    useElement.setAttribute('href', '#trajectory-content')
    nestedSvg.appendChild(useElement)

    lensGroup.appendChild(nestedSvg)

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', lensX + lensWidth / 2)
    label.setAttribute('y', lensY + lensHeight - 5)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', '10')
    label.setAttribute('fill', 'var(--gray-70)')
    label.textContent = `First ${zoomAltitudeRange}m`
    lensGroup.appendChild(label)

    this.sideProjectionTarget.appendChild(lensGroup)
  }

  getChartCoordinates(point) {
    const { width, height, plotWidth, plotHeight } = this.chartDimensions
    const { left, right, top, bottom } = CHART_PADDING

    const totalAltitudeRange = this.altitudeRange.top - this.altitudeRange.bottom

    const x =
      left +
      ((point.distance - this.distanceRange.min) /
        (this.distanceRange.max - this.distanceRange.min)) *
        plotWidth
    const y =
      top + ((this.altitudeRange.top - point.altitude) / totalAltitudeRange) * plotHeight

    return {
      x: Math.max(left, Math.min(width - right, x)),
      y: Math.max(top, Math.min(height - bottom, y))
    }
  }

  setupInteraction() {
    this.sideProjectionTarget.addEventListener('mousemove', e =>
      this.handleInteraction(e)
    )
    this.sideProjectionTarget.addEventListener('click', e => this.handleInteraction(e))
  }

  handleInteraction(e) {
    const svgRect = this.sideProjectionTarget.getBoundingClientRect()
    const viewBox = this.sideProjectionTarget.viewBox.baseVal
    const scaleX = viewBox.width / svgRect.width
    const svgX = (e.clientX - svgRect.left) * scaleX

    const { left } = CHART_PADDING
    const plotWidth = this.chartDimensions.plotWidth

    const relX = svgX - left
    const distanceRatio = relX / plotWidth
    const distance =
      this.distanceRange.min +
      distanceRatio * (this.distanceRange.max - this.distanceRange.min)

    const closestIndex = this.findClosestPointByDistance(distance)
    if (closestIndex >= 0) {
      this.currentIndex = closestIndex
      this.currentFraction = 0
      this.updatePlaybackPosition()
    }
  }

  findClosestPointByDistance(targetDistance) {
    let closestIndex = -1
    let minDiff = Infinity

    this.processedPoints.forEach((point, index) => {
      const diff = Math.abs(point.distance - targetDistance)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = index
      }
    })

    return closestIndex
  }

  initGlideChart() {
    if (!this.hasGlideChartTarget) return

    this.glideChartTarget.chart = initGlideChart(
      this.glideChartTarget,
      this.downsampledChartPoints,
      {
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        showTitle: false,
        showLegend: false,
        comparePoints: downsamplePoints(this.compareChartPoints),
        compareTimeOffset: this.chartTimeOffset,
        compareTrackName: this.compareTrackNameValue
      }
    )
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    this.speedChartTarget.chart = initSpeedsChart(
      this.speedChartTarget,
      this.downsampledChartPoints,
      {
        plotBands: this.bufferPlotBands(),
        windCancellation: this.hasWeatherData,
        comparePoints: downsamplePoints(this.compareChartPoints),
        compareTimeOffset: this.chartTimeOffset,
        compareTrackName: this.compareTrackNameValue
      }
    )
  }

  initSepChart() {
    if (!this.hasSepChartTarget) return

    this.sepChartTarget.chart = initAccuracyChart(
      this.sepChartTarget,
      this.downsampledChartPoints,
      {
        plotBands: this.bufferPlotBands()
      }
    )
  }

  destroyCharts() {
    const charts = [
      this.hasGlideChartTarget && this.glideChartTarget.chart,
      this.hasSpeedChartTarget && this.speedChartTarget.chart,
      this.hasSepChartTarget && this.sepChartTarget.chart
    ]

    charts.filter(Boolean).forEach(chart => chart.destroy())
  }

  renderMap() {
    if (!this.hasMapTarget) return

    if (!this.map) {
      this.initMap()
    }

    this.clearMapPolylines()
    this.drawTrajectory()
    this.fitBounds()
  }

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: 'SKYDIVE_PERFORMANCE_MAP'
    })
    this.mapPolylines = []
  }

  clearMapPolylines() {
    if (this.mapPolylines) {
      this.mapPolylines.forEach(p => p.setMap(null))
      this.mapPolylines = []
    }
  }

  drawTrajectory() {
    const fullTrackPoints = this.points.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      hSpeed: p.hSpeed
    }))
    this.drawTrajectorySegment(fullTrackPoints, 3, 0.7)

    const windowPoints = this.windowPoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      hSpeed: p.hSpeed
    }))
    this.drawTrajectorySegment(windowPoints, 5, 1)
  }

  drawTrajectorySegment(points, strokeWeight, strokeOpacity) {
    if (points.length < 2) return

    const trajectory = new Trajectory(points)

    for (let { path, color } of trajectory.polylines) {
      const polyline = new google.maps.Polyline({
        path,
        strokeColor: color,
        strokeOpacity,
        strokeWeight
      })
      polyline.setMap(this.map)
      this.mapPolylines.push(polyline)
    }
  }

  fitBounds() {
    const mapPoints = this.points.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude
    }))

    if (mapPoints.length === 0) return

    const bounds = new Bounds(mapPoints)
    const mapBounds = new google.maps.LatLngBounds()

    mapBounds.extend(new google.maps.LatLng(bounds.minLatitude, bounds.minLongitude))
    mapBounds.extend(new google.maps.LatLng(bounds.maxLatitude, bounds.maxLongitude))

    this.map.fitBounds(mapBounds)
    this.map.setCenter(mapBounds.getCenter())
  }

  renderCompareMap() {
    if (!this.hasCompareMapTarget || !this.comparePoints) return

    if (!this.compareMap) {
      this.compareMap = new google.maps.Map(this.compareMapTarget, {
        zoom: 2,
        center: new google.maps.LatLng(20, 20),
        mapTypeId: 'terrain',
        mapId: 'SKYDIVE_PERFORMANCE_COMPARE_MAP'
      })
      this.compareMapPolylines = []
    }

    if (this.compareMapPolylines) {
      this.compareMapPolylines.forEach(p => p.setMap(null))
      this.compareMapPolylines = []
    }

    const fullTrackPoints = this.comparePoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      hSpeed: p.hSpeed
    }))
    this.drawCompareTrajectorySegment(fullTrackPoints, 3, 0.7)

    const compareWindowPoints = cropPoints(
      this.comparePoints,
      this.fromValue,
      this.toValue
    )
    const windowPoints = compareWindowPoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      hSpeed: p.hSpeed
    }))
    this.drawCompareTrajectorySegment(windowPoints, 5, 1)

    this.fitCompareBounds()
  }

  drawCompareTrajectorySegment(points, strokeWeight, strokeOpacity) {
    if (points.length < 2) return

    const trajectory = new Trajectory(points)

    for (let { path, color } of trajectory.polylines) {
      const polyline = new google.maps.Polyline({
        path,
        strokeColor: color,
        strokeOpacity,
        strokeWeight
      })
      polyline.setMap(this.compareMap)
      this.compareMapPolylines.push(polyline)
    }
  }

  fitCompareBounds() {
    const mapPoints = this.comparePoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude
    }))

    if (mapPoints.length === 0) return

    const bounds = new Bounds(mapPoints)
    const mapBounds = new google.maps.LatLngBounds()

    mapBounds.extend(new google.maps.LatLng(bounds.minLatitude, bounds.minLongitude))
    mapBounds.extend(new google.maps.LatLng(bounds.maxLatitude, bounds.maxLongitude))

    this.compareMap.fitBounds(mapBounds)
    this.compareMap.setCenter(mapBounds.getCenter())
  }

  initPlayback() {
    if (!this.hasPlaybackSliderTarget || this.processedPoints.length === 0) return

    this.playbackSliderTarget.max = this.processedPoints.length - 1
    this.playbackSliderTarget.value = 0
    this.currentIndex = 0
    this.createMapMarker()
    this.createCrosshair()
  }

  createMapMarker() {
    if (!this.map || this.processedPoints.length === 0) return

    if (this.mapMarker) {
      this.mapMarker.map = null
    }

    const firstPoint = this.processedPoints[0]

    const img = document.createElement('img')
    img.src = this.locationArrowUrlValue
    img.style.width = '24px'
    img.style.height = '24px'
    img.style.transform = 'translateY(50%) rotate(-45deg)'

    this.mapMarker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: { lat: firstPoint.latitude, lng: firstPoint.longitude },
      content: img
    })

    this.markerElement = img
  }

  createCrosshair() {
    if (this.crosshairGroup) {
      this.crosshairGroup.remove()
    }

    const contentGroup = this.sideProjectionTarget.querySelector('#trajectory-content')
    if (!contentGroup) return

    this.crosshairGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.crosshairGroup.setAttribute('class', 'crosshair-group')
    this.crosshairGroup.style.display = 'none'

    this.crosshairVLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    this.crosshairVLine.setAttribute('class', 'crosshair')
    this.crosshairGroup.appendChild(this.crosshairVLine)

    this.crosshairHLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    this.crosshairHLine.setAttribute('class', 'crosshair')
    this.crosshairGroup.appendChild(this.crosshairHLine)

    this.crosshairMarker = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    )
    this.crosshairMarker.setAttribute('class', 'crosshair-marker')
    this.crosshairMarker.setAttribute('r', '6')
    this.crosshairGroup.appendChild(this.crosshairMarker)

    if (this.compareProcessedPoints?.length) {
      this.compareCrosshairMarker = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      )
      this.compareCrosshairMarker.setAttribute('class', 'crosshair-marker--compare')
      this.compareCrosshairMarker.setAttribute('r', '5')
      this.crosshairGroup.appendChild(this.compareCrosshairMarker)

      this.createComparisonTooltip()
    }

    contentGroup.appendChild(this.crosshairGroup)
  }

  createComparisonTooltip() {
    if (this.comparisonTooltip) {
      this.comparisonTooltip.remove()
    }

    this.comparisonTooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.comparisonTooltip.setAttribute('class', 'comparison-tooltip')
    this.comparisonTooltip.style.display = 'none'

    this.tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this.tooltipBg.setAttribute('rx', '12')
    this.tooltipBg.setAttribute('fill', '#fff')
    this.tooltipBg.setAttribute('stroke', 'var(--gray-70)')
    this.tooltipBg.setAttribute('stroke-width', '2')
    this.comparisonTooltip.appendChild(this.tooltipBg)

    this.tooltipText1 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    this.tooltipText1.setAttribute('fill', 'var(--gray-90)')
    this.tooltipText1.setAttribute('font-size', '36')
    this.tooltipText1.setAttribute('font-weight', '500')
    this.comparisonTooltip.appendChild(this.tooltipText1)

    this.tooltipText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    this.tooltipText2.setAttribute('fill', 'var(--gray-90)')
    this.tooltipText2.setAttribute('font-size', '36')
    this.tooltipText2.setAttribute('font-weight', '500')
    this.comparisonTooltip.appendChild(this.tooltipText2)

    this.sideProjectionTarget.appendChild(this.comparisonTooltip)
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

    this.showCrosshair(this.currentIndex)
    this.updateHighchartsCrosshair(this.currentIndex)
    this.updatePlaybackIndicators(this.currentIndex, 0)
    this.updateMapMarkerAtIndex(this.currentIndex)
  }

  updatePlaybackPositionInterpolated() {
    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = this.currentIndex
    }

    this.showCrosshairInterpolated(this.currentIndex, this.currentFraction)
    this.updateHighchartsCrosshair(this.currentIndex)
    this.updatePlaybackIndicators(this.currentIndex, this.currentFraction)
    this.updateMapMarkerInterpolated()
  }

  showCrosshair(index) {
    if (!this.crosshairGroup || index < 0 || index >= this.processedPoints.length) return

    const point = this.processedPoints[index]
    this.showCrosshairAtPosition(point, point.playerTime)
  }

  showCrosshairInterpolated(index, fraction) {
    if (!this.crosshairGroup || index < 0 || index >= this.processedPoints.length) return

    const curr = this.processedPoints[index]
    const next =
      this.processedPoints[Math.min(index + 1, this.processedPoints.length - 1)]

    const interpolatedPoint = {
      distance: curr.distance + (next.distance - curr.distance) * fraction,
      altitude: curr.altitude + (next.altitude - curr.altitude) * fraction,
      playerTime: curr.playerTime + (next.playerTime - curr.playerTime) * fraction
    }

    this.showCrosshairAtPosition(interpolatedPoint, interpolatedPoint.playerTime)
  }

  showCrosshairAtPosition(point, playerTime) {
    const { x, y } = this.getChartCoordinates(point)
    const { width, height } = this.chartDimensions
    const { left, right, top, bottom } = CHART_PADDING

    this.crosshairVLine.setAttribute('x1', x)
    this.crosshairVLine.setAttribute('y1', top)
    this.crosshairVLine.setAttribute('x2', x)
    this.crosshairVLine.setAttribute('y2', height - bottom)

    this.crosshairHLine.setAttribute('x1', left)
    this.crosshairHLine.setAttribute('y1', y)
    this.crosshairHLine.setAttribute('x2', width - right)
    this.crosshairHLine.setAttribute('y2', y)

    this.crosshairMarker.setAttribute('cx', x)
    this.crosshairMarker.setAttribute('cy', y)

    this.crosshairGroup.style.display = ''

    this.updateComparisonCrosshair(point, playerTime, x, y)
  }

  updateComparisonCrosshair(primaryPoint, playerTime, primaryX, primaryY) {
    if (!this.compareCrosshairMarker || !this.compareProcessedPoints?.length) return

    const comparePoint = this.findComparePointAtPlayerTime(playerTime)
    if (!comparePoint) {
      this.compareCrosshairMarker.style.display = 'none'
      this.comparisonTooltip.style.display = 'none'
      return
    }

    const { x: compareX, y: compareY } = this.getChartCoordinates(comparePoint)

    this.compareCrosshairMarker.setAttribute('cx', compareX)
    this.compareCrosshairMarker.setAttribute('cy', compareY)
    this.compareCrosshairMarker.style.display = ''

    const altDiff = primaryPoint.altitude - comparePoint.altitude
    const distDiff = primaryPoint.distance - comparePoint.distance

    const altText =
      Math.abs(altDiff) < 1
        ? 'same altitude'
        : `${Math.abs(Math.round(altDiff))}m ${altDiff > 0 ? 'above' : 'below'}`
    const distText =
      Math.abs(distDiff) < 1
        ? 'same distance'
        : `${Math.abs(Math.round(distDiff))}m ${distDiff > 0 ? 'ahead' : 'behind'}`

    this.tooltipText1.textContent = altText
    this.tooltipText2.textContent = distText

    const padding = 24
    const lineHeight = 48
    const text1Width = this.tooltipText1.getBBox().width || 240
    const text2Width = this.tooltipText2.getBBox().width || 240
    const tooltipWidth = Math.max(text1Width, text2Width) + padding * 2
    const tooltipHeight = lineHeight * 2 + padding * 2

    const tooltipX = Math.min(
      primaryX + 10,
      this.chartDimensions.width - tooltipWidth - 10
    )
    const tooltipY = Math.max(primaryY - tooltipHeight - 10, 10)

    this.tooltipBg.setAttribute('x', tooltipX)
    this.tooltipBg.setAttribute('y', tooltipY)
    this.tooltipBg.setAttribute('width', tooltipWidth)
    this.tooltipBg.setAttribute('height', tooltipHeight)

    this.tooltipText1.setAttribute('x', tooltipX + padding)
    this.tooltipText1.setAttribute('y', tooltipY + padding + 36)

    this.tooltipText2.setAttribute('x', tooltipX + padding)
    this.tooltipText2.setAttribute('y', tooltipY + padding + 36 + lineHeight)

    this.comparisonTooltip.style.display = ''
  }

  updateSummaryIndicators() {
    if (!this.rangeSummary) return

    if (this.hasDistanceTarget) {
      this.distanceTarget.innerText = Math.floor(this.rangeSummary.distance)
    }
    if (this.hasSummaryGlideRatioTarget) {
      this.summaryGlideRatioTarget.innerText = this.formatGlideRatio(
        this.rangeSummary.glideRatio.avg
      )
    }
    if (this.hasGlideRatioMinTarget) {
      this.glideRatioMinTarget.innerText = this.formatGlideRatio(
        this.rangeSummary.glideRatio.min
      )
    }
    if (this.hasGlideRatioMaxTarget) {
      this.glideRatioMaxTarget.innerText = this.formatGlideRatio(
        this.rangeSummary.glideRatio.max
      )
    }
    if (this.hasGroundSpeedTarget) {
      this.groundSpeedTarget.innerText = this.rangeSummary.horizontalSpeed.avg.toFixed(0)
    }
    if (this.hasGroundSpeedMinTarget) {
      this.groundSpeedMinTarget.innerText =
        this.rangeSummary.horizontalSpeed.min.toFixed(0)
    }
    if (this.hasGroundSpeedMaxTarget) {
      this.groundSpeedMaxTarget.innerText =
        this.rangeSummary.horizontalSpeed.max.toFixed(0)
    }
    if (this.hasElevationTarget) {
      this.elevationTarget.innerText = this.rangeSummary.elevation.toFixed(0)
    }
    if (this.hasVerticalSpeedTarget) {
      this.verticalSpeedTarget.innerText = this.rangeSummary.verticalSpeed.avg.toFixed(0)
    }
    if (this.hasVerticalSpeedMinTarget) {
      this.verticalSpeedMinTarget.innerText =
        this.rangeSummary.verticalSpeed.min.toFixed(0)
    }
    if (this.hasVerticalSpeedMaxTarget) {
      this.verticalSpeedMaxTarget.innerText =
        this.rangeSummary.verticalSpeed.max.toFixed(0)
    }
    if (this.hasDurationTarget) {
      this.durationTarget.innerText = this.rangeSummary.time.toFixed(1)
    }

    if (this.hasWeatherData) this.updateWindEffectIndicators()
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

  formatGlideRatio(value) {
    if (value === null || value === undefined || !isFinite(value)) return '--'
    return value.toFixed(2)
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
      const compareData = this.findComparePointAtPlayerTime(targetTime)
      if (compareData) {
        const compareController = this.getPlaybackIndicatorsController(
          this.comparePlaybackIndicatorsTarget
        )
        if (compareController) compareController.update(compareData)
      }
    }
  }

  getPlaybackIndicatorsController(element) {
    return this.application.getControllerForElementAndIdentifier(
      element,
      'playback-indicators'
    )
  }

  findComparePointAtPlayerTime(targetTime) {
    if (!this.compareProcessedPoints || this.compareProcessedPoints.length === 0)
      return null

    for (let i = 0; i < this.compareProcessedPoints.length - 1; i++) {
      const curr = this.compareProcessedPoints[i]
      const next = this.compareProcessedPoints[i + 1]

      if (targetTime >= curr.playerTime && targetTime < next.playerTime) {
        const fraction =
          (targetTime - curr.playerTime) / (next.playerTime - curr.playerTime)
        return {
          altitude: curr.altitude + (next.altitude - curr.altitude) * fraction,
          distance: curr.distance + (next.distance - curr.distance) * fraction,
          fullSpeed: curr.fullSpeed + (next.fullSpeed - curr.fullSpeed) * fraction,
          hSpeed: curr.hSpeed + (next.hSpeed - curr.hSpeed) * fraction,
          vSpeed: curr.vSpeed + (next.vSpeed - curr.vSpeed) * fraction,
          glideRatio:
            (curr.glideRatio ?? 0) +
            ((next.glideRatio ?? 0) - (curr.glideRatio ?? 0)) * fraction
        }
      }
    }

    if (targetTime < this.compareProcessedPoints[0].playerTime) {
      return this.compareProcessedPoints[0]
    }

    return this.compareProcessedPoints[this.compareProcessedPoints.length - 1]
  }

  updateAccelerationIndicators(index, fraction) {
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

    const fullSpeedAccel = (futureFullSpeed - currFullSpeed) / deltaTime
    const hSpeedAccel = (futureHSpeed - currHSpeed) / deltaTime
    const vSpeedAccel = (futureVSpeed - currVSpeed) / deltaTime

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

  updateHighchartsCrosshair(index) {
    const charts = [
      this.glideChartTarget?.chart,
      this.speedChartTarget?.chart,
      this.sepChartTarget?.chart
    ].filter(Boolean)

    charts.forEach(chart => {
      if (!chart.series?.[0]?.points?.[index]) return

      const points = chart.series
        .filter(series => series.visible)
        .map(series => series.points[index])
        .filter(Boolean)

      if (points.length > 0) {
        points[0].onMouseOver()
        chart.tooltip.refresh(points)
        chart.xAxis[0].drawCrosshair(null, points[0])
      }
    })
  }

  updateMapMarkerAtIndex(index) {
    if (!this.mapMarker || !this.markerElement) return

    const point = this.processedPoints[index]
    if (!point) return

    this.mapMarker.position = { lat: point.latitude, lng: point.longitude }

    const targetIndex = this.findTargetIndexFrom(index)
    const targetPoint = this.processedPoints[targetIndex]
    const rotation = this.calculateBearing(point, targetPoint)

    this.markerElement.style.transform = `translateY(50%) rotate(${rotation - 45}deg)`
  }

  updateMapMarkerInterpolated() {
    if (!this.mapMarker || !this.markerElement) return

    const curr = this.processedPoints[this.currentIndex]
    const next =
      this.processedPoints[
        Math.min(this.currentIndex + 1, this.processedPoints.length - 1)
      ]
    const fraction = this.currentFraction

    const lat = curr.latitude + (next.latitude - curr.latitude) * fraction
    const lng = curr.longitude + (next.longitude - curr.longitude) * fraction

    this.mapMarker.position = { lat, lng }

    const targetIndex = this.findTargetIndexFrom(this.currentIndex)
    const targetPoint = this.processedPoints[targetIndex]
    const rotation = this.calculateBearing({ latitude: lat, longitude: lng }, targetPoint)

    this.markerElement.style.transform = `translateY(50%) rotate(${rotation - 45}deg)`
  }

  findTargetIndexFrom(fromIndex) {
    const currentTime = this.processedPoints[fromIndex].gpsTime
    const targetTime = currentTime + 3000

    for (let i = fromIndex + 1; i < this.processedPoints.length; i++) {
      if (this.processedPoints[i].gpsTime >= targetTime) {
        return i
      }
    }

    return this.processedPoints.length - 1
  }

  calculateBearing(from, to) {
    const lat1 = (from.latitude * Math.PI) / 180
    const lat2 = (to.latitude * Math.PI) / 180
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180

    const y = Math.sin(dLon) * Math.cos(lat2)
    const x =
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

    const bearing = (Math.atan2(y, x) * 180) / Math.PI
    return (bearing + 360) % 360
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
      referencePoint = {
        latitude: dlStartPoint.latitude,
        longitude: dlStartPoint.longitude
      }
    }

    const isEditable = this.referencePointData?.editable ?? false

    this.designatedLane = createDesignatedLane(
      this.map,
      dlStartPoint,
      dlStartPoint,
      null,
      referencePoint,
      [],
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

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: new google.maps.LatLng(referencePoint.latitude, referencePoint.longitude),
      content: pin.element,
      gmpDraggable: isEditable
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
    if (!this.compareRangeSummary) return

    if (this.hasCompareDistanceTarget) {
      this.compareDistanceTarget.innerText = Math.floor(this.compareRangeSummary.distance)
    }
    if (this.hasCompareSummaryGlideRatioTarget) {
      this.compareSummaryGlideRatioTarget.innerText = this.formatGlideRatio(
        this.compareRangeSummary.glideRatio.avg
      )
    }
    if (this.hasCompareGlideRatioMinTarget) {
      this.compareGlideRatioMinTarget.innerText = this.formatGlideRatio(
        this.compareRangeSummary.glideRatio.min
      )
    }
    if (this.hasCompareGlideRatioMaxTarget) {
      this.compareGlideRatioMaxTarget.innerText = this.formatGlideRatio(
        this.compareRangeSummary.glideRatio.max
      )
    }
    if (this.hasCompareGroundSpeedTarget) {
      this.compareGroundSpeedTarget.innerText =
        this.compareRangeSummary.horizontalSpeed.avg.toFixed(0)
    }
    if (this.hasCompareGroundSpeedMinTarget) {
      this.compareGroundSpeedMinTarget.innerText =
        this.compareRangeSummary.horizontalSpeed.min.toFixed(0)
    }
    if (this.hasCompareGroundSpeedMaxTarget) {
      this.compareGroundSpeedMaxTarget.innerText =
        this.compareRangeSummary.horizontalSpeed.max.toFixed(0)
    }
    if (this.hasCompareElevationTarget) {
      this.compareElevationTarget.innerText =
        this.compareRangeSummary.elevation.toFixed(0)
    }
    if (this.hasCompareVerticalSpeedTarget) {
      this.compareVerticalSpeedTarget.innerText =
        this.compareRangeSummary.verticalSpeed.avg.toFixed(0)
    }
    if (this.hasCompareVerticalSpeedMinTarget) {
      this.compareVerticalSpeedMinTarget.innerText =
        this.compareRangeSummary.verticalSpeed.min.toFixed(0)
    }
    if (this.hasCompareVerticalSpeedMaxTarget) {
      this.compareVerticalSpeedMaxTarget.innerText =
        this.compareRangeSummary.verticalSpeed.max.toFixed(0)
    }
    if (this.hasCompareDurationTarget) {
      this.compareDurationTarget.innerText = this.compareRangeSummary.time.toFixed(1)
    }

    if (this.hasWeatherData) this.updateCompareWindEffectIndicators()
  }

  updateCompareWindEffectIndicators() {
    const distanceEffect = this.compareRangeSummary.distanceWindEffect
    if (
      distanceEffect?.value !== null &&
      this.hasCompareWindEffectContainerDistanceTarget
    ) {
      this.compareWindEffectContainerDistanceTarget.style.display = ''
      this.updateWindEffectValues(
        distanceEffect,
        this.compareWindEffectDistanceTarget,
        this.compareWindEffectDistanceWindTarget,
        this.compareWindEffectDistancePercentTarget,
        this.compareWindEffectDistanceWindPercentTarget,
        0
      )
    }

    const speedEffect = this.compareRangeSummary.horizontalSpeedWindEffect
    if (speedEffect?.value !== null && this.hasCompareWindEffectContainerSpeedTarget) {
      this.compareWindEffectContainerSpeedTarget.style.display = ''
      this.updateWindEffectValues(
        speedEffect,
        this.compareWindEffectSpeedTarget,
        this.compareWindEffectSpeedWindTarget,
        this.compareWindEffectSpeedPercentTarget,
        this.compareWindEffectSpeedWindPercentTarget,
        0
      )
    }

    const glideEffect = this.compareRangeSummary.glideRatioWindEffect
    if (
      glideEffect?.value !== null &&
      this.hasCompareWindEffectContainerGlideRatioTarget
    ) {
      this.compareWindEffectContainerGlideRatioTarget.style.display = ''
      this.updateWindEffectValues(
        glideEffect,
        this.compareWindEffectGlideRatioTarget,
        this.compareWindEffectGlideRatioWindTarget,
        this.compareWindEffectGlideRatioPercentTarget,
        this.compareWindEffectGlideRatioWindPercentTarget,
        2
      )
    }
  }

  openCompareModal() {
    if (!this.hasCompareModalTarget) return

    this.compareModalTarget.showModal()
    document.body.classList.add('overflow-hidden')

    if (this.hasCompareSearchInputTarget) {
      this.compareSearchInputTarget.focus()
    }
  }

  closeCompareModal() {
    if (!this.hasCompareModalTarget) return

    this.compareModalTarget.close()
    document.body.classList.remove('overflow-hidden')
  }

  searchCompareTracks(event) {
    const term = event.target.value.trim()

    if (term.length < 2) {
      this.compareResultsTarget.innerHTML = `
        <div class="comparison-results-placeholder">
          Enter at least 2 characters to search
        </div>
      `
      return
    }

    this.compareResultsTarget.innerHTML = `
      <div class="comparison-loading">
        <span>Searching...</span>
      </div>
    `

    const url = new URL(this.searchUrlValue, window.location.origin)
    url.searchParams.set('term', term)

    fetch(url, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.renderCompareResults(data)
      })
      .catch(() => {
        this.compareResultsTarget.innerHTML = `
          <div class="comparison-results-placeholder">
            Error searching tracks
          </div>
        `
      })
  }

  renderCompareResults(tracks) {
    if (!tracks || tracks.length === 0) {
      this.compareResultsTarget.innerHTML = `
        <div class="comparison-results-placeholder">
          No tracks found
        </div>
      `
      return
    }

    const filteredTracks = tracks.filter(track => track.id !== this.trackIdValue)

    const html = filteredTracks
      .map(
        track => `
        <div class="comparison-result-item"
             data-action="click->tracks--skydive-performance-track#selectCompareTrack"
             data-track-id="${track.id}">
          ${
            track.pilot?.userpic_url
              ? `<img src="${track.pilot.userpic_url}" class="comparison-result-item-photo loading-bg" alt="">`
              : ''
          }
          <div class="comparison-result-item-info">
            <div class="comparison-result-item-name">${track.pilot?.name || track.name || `Track #${track.id}`}</div>
            <div class="comparison-result-item-details">
              ${track.suit?.name || ''}
              ${track.place?.name ? `• ${track.place.name}` : ''}
            </div>
          </div>
        </div>
      `
      )
      .join('')

    this.compareResultsTarget.innerHTML = html
  }

  selectCompareTrack(event) {
    const trackId = event.currentTarget.dataset.trackId
    const url = new URL(window.location)
    url.searchParams.set('compare_id', trackId)
    window.location.href = url.toString()
  }

  disconnect() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    this.destroyCharts()
  }
}
