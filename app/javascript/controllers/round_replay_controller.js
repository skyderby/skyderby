import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import amplitude from 'utils/amplitude'

const COLORS = ['#470FF4', '#F24C00', '#AA3E98', '#247BA0']
const CHART_PADDING = { left: 60, right: 20, top: 20, bottom: 35 }
const TIME_BEFORE_WINDOW = 5
const TIME_AFTER_WINDOW = 2
const ALTITUDE_BUFFER_RATIO = 0.3

const PENALTY_THRESHOLD = 300

export default class extends Controller {
  static targets = [
    'checkbox',
    'counter',
    'playButton',
    'slider',
    'sideView',
    'loading',
    'placeholder',
    'chart',
    'grid',
    'tracks',
    'referencePoints',
    'topView',
    'roadsContainer',
    'roadTemplate'
  ]

  static values = {
    maxSelection: { type: Number, default: 4 },
    competitionId: Number,
    round: String,
    windowStart: Number,
    windowEnd: Number,
    discipline: String,
    dlStart: String
  }

  connect() {
    this.pointsCache = new Map()
    this.processedData = []
    this.playing = false
    this.playerTime = 0
    this.animationId = null
    this.loadReferencePoints()
    this.restoreSelectionFromUrl()
    this.updateSelectionState()
  }

  loadReferencePoints() {
    try {
      const data = this.referencePointsTarget.textContent
      this.referencePoints = JSON.parse(data)
    } catch (error) {
      console.error('Failed to load reference points:', error)
      this.referencePoints = []
    }
  }

  disconnect() {
    this.stopPlayback()
  }

  handleSelectionChange() {
    this.updateSelectionState()
    this.updateUrl()
    this.stopPlayback()
    this.clearChart()
  }

  restoreSelectionFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const trackIds = params.getAll('tracks[]')

    if (trackIds.length === 0) return

    trackIds.slice(0, this.maxSelectionValue).forEach(trackId => {
      const checkbox = this.checkboxTargets.find(cb => cb.dataset.trackId === trackId)
      if (checkbox) checkbox.checked = true
    })
  }

  updateUrl() {
    const selectedTracks = this.getSelectedTracks()
    const url = new URL(window.location.href)

    url.searchParams.delete('tracks[]')
    selectedTracks.forEach(track => {
      url.searchParams.append('tracks[]', track.trackId)
    })

    window.history.replaceState({}, '', url)
  }

  updateSelectionState() {
    const selectedCount = this.getSelectedCount()
    this.counterTarget.textContent = selectedCount

    const isMaxSelected = selectedCount >= this.maxSelectionValue

    this.checkboxTargets.forEach(checkbox => {
      if (!checkbox.checked) {
        checkbox.disabled = isMaxSelected
      }
    })

    this.updatePlaceholderVisibility()
  }

  updatePlaceholderVisibility() {
    const hasSelection = this.getSelectedCount() > 0
    this.placeholderTarget.style.display = hasSelection ? 'none' : 'flex'
    this.chartTarget.style.display = hasSelection ? 'block' : 'none'
  }

  getSelectedCount() {
    return this.checkboxTargets.filter(cb => cb.checked).length
  }

  getSelectedTracks() {
    return this.checkboxTargets
      .filter(cb => cb.checked)
      .map((cb, index) => ({
        trackId: cb.dataset.trackId,
        resultId: cb.dataset.resultId,
        pointsUrl: cb.dataset.pointsUrl,
        referencePointId: cb.dataset.referencePointId,
        exitedAt: cb.dataset.exitedAt,
        competitorName: cb.dataset.competitorName,
        result: cb.dataset.result,
        color: COLORS[index]
      }))
  }

  async togglePlay() {
    if (this.playing) {
      this.stopPlayback()
      return
    }

    const selectedTracks = this.getSelectedTracks()
    if (selectedTracks.length === 0) return

    amplitude.track('performance_competition_round_replay_play', {
      competition_id: this.competitionIdValue,
      round: this.roundValue,
      selected_names: selectedTracks.map(t => t.competitorName)
    })

    if (this.processedData.length > 0) {
      this.resumePlayback()
      return
    }

    this.showLoading()

    try {
      await this.loadTracksData(selectedTracks)
      this.renderGrid()
      this.renderTopViewRoad()
      this.startPlayback()
    } catch (error) {
      console.error('Failed to load tracks:', error)
      this.hideLoading()
    }
  }

  showLoading() {
    this.loadingTarget.style.display = 'flex'
    this.placeholderTarget.style.display = 'none'
    this.chartTarget.style.display = 'none'
  }

  hideLoading() {
    this.loadingTarget.style.display = 'none'
    this.chartTarget.style.display = 'block'
  }

  async loadTracksData(selectedTracks) {
    const loadPromises = selectedTracks.map(async track => {
      const rawPoints = await this.fetchPoints(track.pointsUrl)
      const referencePoint = this.referencePoints.find(
        rp => rp.id == track.referencePointId
      )
      const processedPoints = this.processPoints(rawPoints)
      const laneStartPoint = this.calculateLaneStartPoint(rawPoints, track.exitedAt)
      const pointsWithDeviation = this.processLaneDeviation(
        processedPoints,
        laneStartPoint,
        referencePoint
      )
      const violation = this.findLaneViolation(pointsWithDeviation)

      return {
        ...track,
        points: pointsWithDeviation,
        referencePoint,
        violation
      }
    })

    this.processedData = await Promise.all(loadPromises)
    this.calculateRanges()
  }

  async fetchPoints(pointsUrl) {
    if (this.pointsCache.has(pointsUrl)) {
      return this.pointsCache.get(pointsUrl)
    }

    const params = new URLSearchParams({
      original_frequency: true,
      'trimmed[seconds_before_start]': 5,
      'trimmed[seconds_after_end]': 10
    })

    const response = await get(`${pointsUrl}?${params}`, {
      responseKind: 'json'
    })
    const data = await response.json

    const points = data.points.map(p => ({ ...p, gpsTime: new Date(p.gpsTime) }))

    this.pointsCache.set(pointsUrl, points)
    return points
  }

  findWindowPoints(points) {
    let startPoint = null
    let endPoint = null

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]

      if (
        !startPoint &&
        current.altitude >= this.windowStartValue &&
        next.altitude < this.windowStartValue
      ) {
        startPoint = this.interpolatePoint(current, next, this.windowStartValue)
      }

      if (
        !endPoint &&
        current.altitude >= this.windowEndValue &&
        next.altitude < this.windowEndValue
      ) {
        endPoint = this.interpolatePoint(current, next, this.windowEndValue)
      }

      if (startPoint && endPoint) break
    }

    return { startPoint, endPoint }
  }

  interpolatePoint(p1, p2, altitude) {
    const ratio = (p1.altitude - altitude) / (p1.altitude - p2.altitude)
    return {
      latitude: p1.latitude + (p2.latitude - p1.latitude) * ratio,
      longitude: p1.longitude + (p2.longitude - p1.longitude) * ratio,
      altitude,
      gpsTime: new Date(
        p1.gpsTime.getTime() + (p2.gpsTime.getTime() - p1.gpsTime.getTime()) * ratio
      )
    }
  }

  processPoints(points) {
    const { startPoint, endPoint } = this.findWindowPoints(points)

    if (!startPoint) {
      console.warn('Could not find window start point')
      return []
    }

    const startTime = startPoint.gpsTime.getTime()
    const endTime = endPoint ? endPoint.gpsTime.getTime() : startTime + 60000

    return points
      .map(point => {
        const gpsTime = point.gpsTime.getTime()
        const playerTime = (gpsTime - startTime) / 1000
        const absDistance = this.calculateDistance(point, startPoint)
        const distance = gpsTime < startTime ? -absDistance : absDistance

        return {
          playerTime,
          altitude: point.altitude,
          distance,
          latitude: point.latitude,
          longitude: point.longitude,
          hSpeed: point.hSpeed || 0,
          vSpeed: point.vSpeed || 0,
          gpsTime,
          startTime,
          endTime
        }
      })
      .filter(
        p =>
          p.playerTime >= -TIME_BEFORE_WINDOW &&
          p.altitude >
            this.windowEndValue -
              (this.windowStartValue - this.windowEndValue) * ALTITUDE_BUFFER_RATIO
      )
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
    let minDist = Infinity
    let maxDist = -Infinity
    let minTime = Infinity
    let maxTime = -Infinity

    this.processedData.forEach(({ points }) => {
      points.forEach(p => {
        minDist = Math.min(minDist, p.distance)
        maxDist = Math.max(maxDist, p.distance)
        minTime = Math.min(minTime, p.playerTime)
        maxTime = Math.max(maxTime, p.playerTime)
      })
    })

    this.distanceRange = { min: minDist - 100, max: maxDist + 100 }
    this.timeRange = {
      min: Math.max(minTime, -TIME_BEFORE_WINDOW),
      max: maxTime + TIME_AFTER_WINDOW
    }
  }

  renderGrid() {
    const grid = this.gridTarget
    grid.innerHTML = ''

    const { left, right, top, bottom } = CHART_PADDING

    const windowRange = this.windowStartValue - this.windowEndValue
    const bufferTop = windowRange * ALTITUDE_BUFFER_RATIO
    const bufferBottom = windowRange * ALTITUDE_BUFFER_RATIO

    this.altitudeRange = {
      top: this.windowStartValue + bufferTop,
      bottom: this.windowEndValue - bufferBottom
    }

    const totalAltitudeRange = this.altitudeRange.top - this.altitudeRange.bottom
    const totalDistanceRange = this.distanceRange.max - this.distanceRange.min

    const baseHeight = 600
    const plotHeight = baseHeight - top - bottom
    const plotWidth = plotHeight * (totalDistanceRange / totalAltitudeRange)
    const width = plotWidth + left + right
    const height = baseHeight

    this.chartDimensions = { width, height, plotWidth, plotHeight }
    this.chartTarget.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const altitudeToY = altitude => {
      return top + ((this.altitudeRange.top - altitude) / totalAltitudeRange) * plotHeight
    }

    const windowStartY = altitudeToY(this.windowStartValue)
    const windowEndY = altitudeToY(this.windowEndValue)

    const startLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    startLine.setAttribute('x1', left)
    startLine.setAttribute('y1', windowStartY)
    startLine.setAttribute('x2', width - right)
    startLine.setAttribute('y2', windowStartY)
    startLine.setAttribute('class', 'grid-line-window-start')
    grid.appendChild(startLine)

    const endLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    endLine.setAttribute('x1', left)
    endLine.setAttribute('y1', windowEndY)
    endLine.setAttribute('x2', width - right)
    endLine.setAttribute('y2', windowEndY)
    endLine.setAttribute('class', 'grid-line-window-end')
    grid.appendChild(endLine)

    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const altitude =
        this.windowStartValue -
        ((this.windowStartValue - this.windowEndValue) * i) / gridLines
      const y = altitudeToY(altitude)

      if (i > 0 && i < gridLines) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', left)
        line.setAttribute('y1', y)
        line.setAttribute('x2', width - right)
        line.setAttribute('y2', y)
        line.setAttribute('class', 'grid-line')
        grid.appendChild(line)
      }

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
    const distanceStep = 500

    const minDist = Math.ceil(this.distanceRange.min / distanceStep) * distanceStep
    const maxDist = Math.floor(this.distanceRange.max / distanceStep) * distanceStep

    for (let dist = minDist; dist <= maxDist; dist += distanceStep) {
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
      label.setAttribute('y', height - bottom + 15)
      label.setAttribute('class', 'grid-label-distance')
      label.textContent = dist
      grid.appendChild(label)
    }
  }

  startPlayback() {
    this.hideLoading()
    this.playerTime = this.timeRange.min
    this.resumePlayback()
  }

  resumePlayback() {
    this.playing = true
    this.playButtonTarget.classList.add('playing')
    this.lastFrameTime = performance.now()
    this.animationId = requestAnimationFrame(this.animate.bind(this))
  }

  stopPlayback() {
    this.playing = false
    this.playButtonTarget.classList.remove('playing')
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  animate(currentTime) {
    if (!this.playing) return

    const deltaTime = (currentTime - this.lastFrameTime) / 1000
    this.lastFrameTime = currentTime
    this.playerTime += deltaTime

    if (this.playerTime > this.timeRange.max) {
      this.playerTime = this.timeRange.min
    }

    this.updateSlider()
    this.renderTracks()
    this.renderTopView()

    this.animationId = requestAnimationFrame(this.animate.bind(this))
  }

  updateSlider() {
    const duration = this.timeRange.max - this.timeRange.min
    const progress = ((this.playerTime - this.timeRange.min) / duration) * 100
    this.sliderTarget.value = Math.min(100, Math.max(0, progress))
  }

  onSliderInput() {
    const progress = this.sliderTarget.value / 100
    const duration = this.timeRange.max - this.timeRange.min
    this.playerTime = this.timeRange.min + progress * duration
    this.renderTracks()
    this.renderTopView()
  }

  renderTracks() {
    const tracks = this.tracksTarget
    tracks.innerHTML = ''

    this.processedData.forEach(({ points, color }) => {
      const { visiblePoints, currentPoint, isComplete } = this.getPointsUntilTime(
        points,
        this.playerTime
      )
      if (visiblePoints.length === 0 && !currentPoint) return

      const allPoints = currentPoint ? [...visiblePoints, currentPoint] : visiblePoints
      const pathData = this.buildPathData(allPoints)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', pathData)
      path.setAttribute('class', 'track-path')
      path.setAttribute('stroke', color)
      tracks.appendChild(path)

      if (!isComplete) {
        const markerPoint = currentPoint || visiblePoints[visiblePoints.length - 1]
        if (markerPoint) {
          const { x, y } = this.getChartCoordinates(markerPoint)

          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          circle.setAttribute('cx', x)
          circle.setAttribute('cy', y)
          circle.setAttribute('r', 8)
          circle.setAttribute('class', 'track-marker')
          circle.setAttribute('fill', color)
          tracks.appendChild(circle)
        }
      }
    })
  }

  getPointsUntilTime(points, time) {
    const visiblePoints = []
    let currentPoint = null
    let isComplete = false

    for (let i = 0; i < points.length; i++) {
      const point = points[i]

      if (point.playerTime <= time) {
        visiblePoints.push(point)
      } else {
        if (visiblePoints.length > 0) {
          const prevPoint = visiblePoints[visiblePoints.length - 1]
          currentPoint = this.interpolateByTime(prevPoint, point, time)
        }
        break
      }
    }

    if (visiblePoints.length === points.length && !currentPoint) {
      isComplete = true
    }

    return { visiblePoints, currentPoint, isComplete }
  }

  interpolateByTime(p1, p2, time) {
    const ratio = (time - p1.playerTime) / (p2.playerTime - p1.playerTime)
    return {
      playerTime: time,
      altitude: p1.altitude + (p2.altitude - p1.altitude) * ratio,
      distance: p1.distance + (p2.distance - p1.distance) * ratio,
      laneDeviation: p1.laneDeviation + (p2.laneDeviation - p1.laneDeviation) * ratio,
      hSpeed: p1.hSpeed + (p2.hSpeed - p1.hSpeed) * ratio,
      vSpeed: p1.vSpeed + (p2.vSpeed - p1.vSpeed) * ratio
    }
  }

  buildPathData(points) {
    if (points.length === 0) return ''

    const commands = points.map((point, index) => {
      const { x, y } = this.getChartCoordinates(point)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })

    return commands.join(' ')
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

  clearChart() {
    this.tracksTarget.innerHTML = ''
    this.gridTarget.innerHTML = ''
    this.roadsContainerTarget.innerHTML = ''
    this.processedData = []
    this.playerTime = 0
    this.sliderTarget.value = 0
  }

  calculateLaneStartPoint(rawPoints, exitedAt) {
    if (!exitedAt || !rawPoints || rawPoints.length === 0) {
      return this.interpolatePointByAltitude(rawPoints, this.windowStartValue)
    }

    if (this.dlStartValue === 'on_10_sec') {
      const exitedAtTime = new Date(exitedAt).getTime()
      const targetTime = exitedAtTime + 10000
      return this.interpolatePointByTime(rawPoints, targetTime)
    }

    if (this.dlStartValue === 'on_9_sec') {
      const exitedAtTime = new Date(exitedAt).getTime()
      const targetTime = exitedAtTime + 9000
      return this.interpolatePointByTime(rawPoints, targetTime)
    }

    return this.interpolatePointByAltitude(rawPoints, this.windowStartValue)
  }

  interpolatePointByAltitude(points, targetAltitude) {
    if (!points || points.length === 0) return null

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]

      if (current.altitude >= targetAltitude && next.altitude < targetAltitude) {
        const ratio =
          (current.altitude - targetAltitude) / (current.altitude - next.altitude)
        return {
          latitude: current.latitude + (next.latitude - current.latitude) * ratio,
          longitude: current.longitude + (next.longitude - current.longitude) * ratio,
          altitude: targetAltitude,
          gpsTime: new Date(
            current.gpsTime.getTime() +
              (next.gpsTime.getTime() - current.gpsTime.getTime()) * ratio
          )
        }
      }
    }
    return null
  }

  interpolatePointByTime(points, targetTime) {
    if (!points || points.length === 0) return null

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const currentTime = current.gpsTime.getTime()
      const nextTime = next.gpsTime.getTime()

      if (currentTime <= targetTime && nextTime > targetTime) {
        const ratio = (targetTime - currentTime) / (nextTime - currentTime)
        return {
          latitude: current.latitude + (next.latitude - current.latitude) * ratio,
          longitude: current.longitude + (next.longitude - current.longitude) * ratio,
          altitude: current.altitude + (next.altitude - current.altitude) * ratio,
          gpsTime: new Date(targetTime)
        }
      }
    }
    return null
  }

  processLaneDeviation(processedPoints, laneStartPoint, referencePoint) {
    if (!referencePoint || !laneStartPoint || processedPoints.length === 0) {
      return processedPoints.map(p => ({ ...p, laneDeviation: 0 }))
    }

    return processedPoints.map(point => {
      if (!point.latitude || !point.longitude) {
        return { ...point, laneDeviation: 0 }
      }

      const deviation = this.calculateLaneDeviation(point, laneStartPoint, referencePoint)
      return { ...point, laneDeviation: deviation }
    })
  }

  findLaneViolation(points) {
    const windowPoints = points.filter(
      p => p.altitude <= this.windowStartValue && p.altitude >= this.windowEndValue
    )

    let maxViolation = null
    let maxDeviation = 0

    windowPoints.forEach(point => {
      const absDeviation = Math.abs(point.laneDeviation)
      if (absDeviation > PENALTY_THRESHOLD && absDeviation > maxDeviation) {
        maxDeviation = absDeviation
        maxViolation = {
          ...point,
          penaltyDeviation: absDeviation - PENALTY_THRESHOLD
        }
      }
    })

    return maxViolation
  }

  calculateLaneDeviation(point, laneStart, referencePoint) {
    const toRad = deg => (deg * Math.PI) / 180
    const R = 6371000

    const lat1 = toRad(laneStart.latitude)
    const lon1 = toRad(laneStart.longitude)
    const lat2 = toRad(referencePoint.latitude)
    const lon2 = toRad(referencePoint.longitude)
    const lat3 = toRad(point.latitude)
    const lon3 = toRad(point.longitude)

    const d13 = this.haversineDistance(laneStart, point)
    const d12 = this.haversineDistance(laneStart, referencePoint)

    if (d12 === 0) return 0

    const bearing12 = Math.atan2(
      Math.sin(lon2 - lon1) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    )
    const bearing13 = Math.atan2(
      Math.sin(lon3 - lon1) * Math.cos(lat3),
      Math.cos(lat1) * Math.sin(lat3) -
        Math.sin(lat1) * Math.cos(lat3) * Math.cos(lon3 - lon1)
    )

    const crossTrackDistance =
      Math.asin(Math.sin(d13 / R) * Math.sin(bearing13 - bearing12)) * R

    return crossTrackDistance
  }

  haversineDistance(p1, p2) {
    const R = 6371000
    const toRad = deg => (deg * Math.PI) / 180

    const dLat = toRad(p2.latitude - p1.latitude)
    const dLon = toRad(p2.longitude - p1.longitude)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(p1.latitude)) *
        Math.cos(toRad(p2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  renderTopViewRoad() {
    this.roadsContainerTarget.innerHTML = ''
    this.roadElements = []

    this.processedData.forEach(trackData => {
      const roadDiv = this.roadTemplateTarget.content.cloneNode(true).firstElementChild
      this.roadsContainerTarget.appendChild(roadDiv)

      this.roadElements.push({ trackData, element: roadDiv })
    })
  }

  getRoadController(element) {
    return this.application.getControllerForElementAndIdentifier(element, 'road-view')
  }

  renderTopView() {
    if (!this.roadElements) return

    this.roadElements.forEach(({ trackData, element }) => {
      const controller = this.getRoadController(element)
      if (!controller) return

      const { points, violation, color, competitorName } = trackData
      const cameraDistance = this.getRoadCameraDistance(trackData)

      controller.setColor(color)
      controller.setName(competitorName)

      const { visiblePoints, currentPoint, isComplete } = this.getPointsUntilTime(
        points,
        this.playerTime
      )
      const allPoints = currentPoint ? [...visiblePoints, currentPoint] : visiblePoints
      const markerPoint = currentPoint || visiblePoints.at(-1)

      controller.renderMarkers(
        points,
        cameraDistance,
        this.windowStartValue,
        this.windowEndValue
      )
      controller.renderTrajectory(allPoints, cameraDistance, violation, visiblePoints)

      if (!isComplete && markerPoint) {
        const futureTime = this.playerTime + 3
        const futureData = this.getPointsUntilTime(points, futureTime)
        const futurePoint = futureData.currentPoint || futureData.visiblePoints.at(-1)
        controller.renderPilot(markerPoint, futurePoint, cameraDistance)
      } else {
        controller.renderPilot(null, null, cameraDistance)
      }

      if (markerPoint) {
        const altitude = Math.round(markerPoint.altitude)
        const groundSpeed = Math.round(markerPoint.hSpeed * 3.6)
        const verticalSpeed = Math.round(markerPoint.vSpeed * 3.6)
        const glideRatio =
          markerPoint.vSpeed > 0
            ? (markerPoint.hSpeed / markerPoint.vSpeed).toFixed(1)
            : '--'
        const laneDeviation = Math.round(markerPoint.laneDeviation || 0)
        controller.updateData({
          altitude,
          groundSpeed,
          verticalSpeed,
          glideRatio,
          laneDeviation
        })
      }
    })

    this.updatePositions()
  }

  updatePositions() {
    const competitorData = this.roadElements.map(({ trackData, element }) => {
      const controller = this.getRoadController(element)
      const { points, result: storedResult } = trackData
      const { visiblePoints, currentPoint } = this.getPointsUntilTime(
        points,
        this.playerTime
      )
      const markerPoint = currentPoint || visiblePoints.at(-1)

      const isBeforeWindow = this.playerTime < 0
      const isFinished = markerPoint && markerPoint.altitude <= this.windowEndValue

      let sortValue = 0

      if (markerPoint) {
        if (this.disciplineValue === 'distance') {
          sortValue = markerPoint.distance
        } else if (this.disciplineValue === 'speed') {
          sortValue = markerPoint.hSpeed
        } else if (this.disciplineValue === 'time') {
          sortValue = markerPoint.altitude
        }
      }

      return { controller, sortValue, isBeforeWindow, isFinished, storedResult }
    })

    const sorted = [...competitorData].sort((a, b) => b.sortValue - a.sortValue)

    competitorData.forEach(data => {
      if (!data.controller) return

      const position = sorted.indexOf(data) + 1

      if (data.isBeforeWindow) {
        data.controller.hidePosition()
      } else if (data.isFinished && data.storedResult) {
        data.controller.setResult(data.storedResult)
      } else {
        data.controller.setPosition(position)
      }
    })
  }

  getRoadCameraDistance(trackData) {
    const { visiblePoints, currentPoint } = this.getPointsUntilTime(
      trackData.points,
      this.playerTime
    )
    const markerPoint = currentPoint || visiblePoints[visiblePoints.length - 1]
    if (!markerPoint) return -600

    const cameraOffset = 500
    const pilotDistance = markerPoint.distance

    if (this.playerTime < 0) {
      return Math.min(pilotDistance - cameraOffset, -cameraOffset)
    }

    return pilotDistance - cameraOffset
  }
}
