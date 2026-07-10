import { detectFlares, drawFlares } from 'utils/tracks/flareDetection'
import {
  calculateBearing,
  targetIndexFrom,
  closestIndexByPlayerTime,
  interpolateByPlayerTime
} from 'utils/tracks/pointHelpers'
import { LOCATION_ARROW_PATH } from 'utils/tracks/locationArrowPath'

const SVG_NS = 'http://www.w3.org/2000/svg'

const CHART_PADDING = { left: 100, right: 20, top: 10, bottom: 45 }

export default class SkydivePerformanceSideView {
  constructor({ svg, grid, trajectory, onSeek }) {
    this.svg = svg
    this.grid = grid
    this.trajectory = trajectory
    this.onSeek = onSeek

    this.processedPoints = []
    this.compareProcessedPoints = null
    this.currentIndex = 0

    this.handleInteraction = this.handleInteraction.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.svg.addEventListener('mousemove', this.handleInteraction)
    this.svg.addEventListener('click', this.handleInteraction)
    this.svg.addEventListener('mouseleave', this.handleMouseLeave)

    this.createTooltip()
  }

  destroy() {
    this.svg.removeEventListener('mousemove', this.handleInteraction)
    this.svg.removeEventListener('click', this.handleInteraction)
    this.svg.removeEventListener('mouseleave', this.handleMouseLeave)
    this.tooltip?.remove()
  }

  createTooltip() {
    this.container = this.svg.parentElement
    if (!this.container) return

    this.tooltip = document.createElement('div')
    this.tooltip.className = 'skydive-side-tooltip'
    this.tooltip.style.display = 'none'
    this.container.appendChild(this.tooltip)
  }

  render({
    processedPoints,
    compareProcessedPoints,
    fromValue,
    toValue,
    maxAltitude,
    minAltitude,
    weather,
    compareWeather,
    compareReferenceTime
  }) {
    this.processedPoints = processedPoints || []
    this.compareProcessedPoints = compareProcessedPoints || null
    this.fromValue = fromValue
    this.toValue = toValue
    this.maxAltitude = maxAltitude
    this.minAltitude = minAltitude
    this.weather = weather
    this.compareWeather = compareWeather
    this.compareReferenceTime = compareReferenceTime

    if (this.processedPoints.length === 0) return

    this.windowEntryTime = this.calculateWindowEntryTime()
    this.calculateRanges()
    this.renderGrid()
    this.renderTrajectoryContent()
    this.renderMaxSpeedMarker()
    this.renderWindIndicator()
    this.createCrosshair()
  }

  setPosition(index, fraction = 0, interpolated = false) {
    this.currentIndex = index

    if (interpolated) {
      this.showCrosshairInterpolated(index, fraction)
    } else {
      this.showCrosshair(index)
    }

    this.updateWindIndicators(index)
  }

  calculateWindowEntryTime() {
    const points = this.processedPoints

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (curr.altitude >= this.fromValue && next.altitude < this.fromValue) {
        const fraction =
          (curr.altitude - this.fromValue) / (curr.altitude - next.altitude)
        return curr.playerTime + (next.playerTime - curr.playerTime) * fraction
      }
    }

    return points[0]?.playerTime || 0
  }

  calculateRanges() {
    let maxDist = 0

    this.processedPoints.forEach(p => {
      maxDist = Math.max(maxDist, p.distance)
    })

    if (this.compareProcessedPoints) {
      this.compareProcessedPoints.forEach(p => {
        maxDist = Math.max(maxDist, p.distance)
      })
    }

    this.distanceRange = { min: -50, max: maxDist + 100 }
  }

  renderGrid() {
    const grid = this.grid
    grid.innerHTML = ''

    const { left, right, top, bottom } = CHART_PADDING

    const altitudeBuffer = (this.maxAltitude - this.minAltitude) * 0.05
    this.altitudeRange = {
      top: this.maxAltitude + altitudeBuffer,
      bottom: this.minAltitude - altitudeBuffer
    }

    const totalAltitudeRange = this.altitudeRange.top - this.altitudeRange.bottom
    const totalDistanceRange = this.distanceRange.max - this.distanceRange.min

    const baseHeight = 600
    const plotHeight = baseHeight - top - bottom
    const plotWidth = plotHeight * (totalDistanceRange / totalAltitudeRange)
    const width = plotWidth + left + right
    const height = baseHeight

    this.chartDimensions = { width, height, plotWidth, plotHeight }
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const altitudeToY = altitude => {
      return top + ((this.altitudeRange.top - altitude) / totalAltitudeRange) * plotHeight
    }

    const windowStartY = altitudeToY(this.fromValue)
    const windowEndY = altitudeToY(this.toValue)

    const startLine = document.createElementNS(SVG_NS, 'line')
    startLine.setAttribute('x1', left)
    startLine.setAttribute('y1', windowStartY)
    startLine.setAttribute('x2', width - right)
    startLine.setAttribute('y2', windowStartY)
    startLine.setAttribute('class', 'grid-line-window-start')
    grid.appendChild(startLine)

    const startLabel = document.createElementNS(SVG_NS, 'text')
    startLabel.setAttribute('x', left - 10)
    startLabel.setAttribute('y', windowStartY + 4)
    startLabel.setAttribute('class', 'grid-label grid-label-window')
    startLabel.textContent = this.fromValue
    grid.appendChild(startLabel)

    const endLine = document.createElementNS(SVG_NS, 'line')
    endLine.setAttribute('x1', left)
    endLine.setAttribute('y1', windowEndY)
    endLine.setAttribute('x2', width - right)
    endLine.setAttribute('y2', windowEndY)
    endLine.setAttribute('class', 'grid-line-window-end')
    grid.appendChild(endLine)

    const endLabel = document.createElementNS(SVG_NS, 'text')
    endLabel.setAttribute('x', left - 10)
    endLabel.setAttribute('y', windowEndY + 4)
    endLabel.setAttribute('class', 'grid-label grid-label-window')
    endLabel.textContent = this.toValue
    grid.appendChild(endLabel)

    const altitudeStep = 250
    const labelGap = 30
    const firstLine = Math.ceil(this.minAltitude / altitudeStep) * altitudeStep
    for (
      let altitude = firstLine;
      altitude <= this.maxAltitude;
      altitude += altitudeStep
    ) {
      const y = altitudeToY(altitude)

      if (Math.abs(y - windowStartY) < labelGap || Math.abs(y - windowEndY) < labelGap) {
        continue
      }

      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', left)
      line.setAttribute('y1', y)
      line.setAttribute('x2', width - right)
      line.setAttribute('y2', y)
      line.setAttribute('class', 'grid-line')
      grid.appendChild(line)

      const label = document.createElementNS(SVG_NS, 'text')
      label.setAttribute('x', left - 10)
      label.setAttribute('y', y + 4)
      label.setAttribute('class', 'grid-label')
      label.textContent = altitude
      grid.appendChild(label)
    }

    this.renderDistanceGrid(grid, width, height, left, right, top, bottom)
  }

  renderDistanceGrid(grid, width, height, left, right, top, bottom) {
    const plotWidth = width - left - right
    const lineStep = this.calculateLineStep()
    const labelStep = this.calculateLabelStep(plotWidth, lineStep)

    const minDist = Math.ceil(this.distanceRange.min / lineStep) * lineStep
    const maxDist = Math.floor(this.distanceRange.max / lineStep) * lineStep

    for (let dist = Math.max(0, minDist); dist <= maxDist; dist += lineStep) {
      const x =
        left +
        ((dist - this.distanceRange.min) /
          (this.distanceRange.max - this.distanceRange.min)) *
          plotWidth

      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', x)
      line.setAttribute('y1', top)
      line.setAttribute('x2', x)
      line.setAttribute('y2', height - bottom)
      line.setAttribute('class', 'grid-line-vertical')
      grid.appendChild(line)

      if (dist % labelStep !== 0) continue

      const label = document.createElementNS(SVG_NS, 'text')
      label.setAttribute('x', x)
      label.setAttribute('y', height - bottom + 20)
      label.setAttribute('class', 'grid-label-distance')
      label.textContent = dist
      grid.appendChild(label)
    }
  }

  calculateLineStep() {
    const range = this.distanceRange.max - this.distanceRange.min
    if (range > 3000) return 500
    if (range > 1500) return 250
    if (range > 500) return 100
    return 50
  }

  calculateLabelStep(plotWidth, lineStep) {
    const range = this.distanceRange.max - this.distanceRange.min
    const minLabelSpacing = 110
    const minStep = (range / plotWidth) * minLabelSpacing

    const niceSteps = [50, 100, 250, 500, 1000, 2000, 2500, 5000, 10000]
    return (
      niceSteps.find(step => step >= minStep && step % lineStep === 0) ||
      niceSteps[niceSteps.length - 1]
    )
  }

  renderTrajectoryContent() {
    const trajectoryGroup = this.trajectory
    trajectoryGroup.innerHTML = ''

    if (this.processedPoints.length === 0) return

    const contentGroup = document.createElementNS(SVG_NS, 'g')
    contentGroup.setAttribute('id', 'trajectory-content')

    if (this.compareProcessedPoints && this.compareProcessedPoints.length > 0) {
      const comparePathData = this.compareProcessedPoints
        .map((point, index) => {
          const { x, y } = this.getChartCoordinates(point)
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
        })
        .join(' ')

      const comparePath = document.createElementNS(SVG_NS, 'path')
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

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', pathData)
    path.setAttribute('class', 'track-path')
    contentGroup.appendChild(path)

    this.renderFlares(contentGroup)

    trajectoryGroup.appendChild(contentGroup)
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

    drawFlares(container, flares, scaleX, scaleY, this.viewBoxFontSize(14))
  }

  renderMaxSpeedMarker() {
    this.renderMaxSpeedFor(this.processedPoints, 'max-speed-marker')

    if (this.compareProcessedPoints && this.compareProcessedPoints.length > 0) {
      this.renderMaxSpeedFor(this.compareProcessedPoints, 'max-speed-marker--compare')
    }
  }

  renderMaxSpeedFor(points, className) {
    const candidates = points.filter(p => p.altitude >= this.toValue)
    if (candidates.length === 0) return

    const maxPoint = candidates.reduce((max, p) =>
      p.fullSpeed > max.fullSpeed ? p : max
    )

    const { x, y } = this.getChartCoordinates(maxPoint)
    const fontSize = this.viewBoxFontSize(14)

    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', className)

    const marker = document.createElementNS(SVG_NS, 'circle')
    marker.setAttribute('cx', x)
    marker.setAttribute('cy', y)
    marker.setAttribute('r', 6)
    group.appendChild(marker)

    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('x', x)
    label.setAttribute('y', y - fontSize * 0.7)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', fontSize)
    label.textContent = `${Math.round(maxPoint.fullSpeed)} km/h`
    group.appendChild(label)

    this.trajectory.appendChild(group)
  }

  renderWindIndicator() {
    if (!this.weather || this.processedPoints.length === 0) return

    const { width } = this.chartDimensions
    const radius = 42
    const margin = 10
    const cx = width - margin - radius

    this.windIndicators = []

    this.windIndicators.push(
      this.buildWindIndicator(cx, margin + radius, radius, 'wind-indicator-pilot', {
        points: this.processedPoints,
        weather: this.weather,
        referenceTime: this.processedPoints[0].gpsTime
      })
    )

    if (this.compareWeather && this.compareProcessedPoints?.length) {
      const fontSize = this.viewBoxFontSize(12)
      const secondCy = margin + radius + (radius * 2 + margin + fontSize * 1.4)
      this.windIndicators.push(
        this.buildWindIndicator(cx, secondCy, radius, 'wind-indicator-pilot--compare', {
          points: this.compareProcessedPoints,
          weather: this.compareWeather,
          referenceTime: this.compareReferenceTime,
          byPlayerTime: true
        })
      )
    }

    this.updateWindIndicators(this.currentIndex || 0)
  }

  buildWindIndicator(cx, cy, radius, pilotClass, source) {
    const fontSize = this.viewBoxFontSize(12)

    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', 'wind-indicator')

    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('cx', cx)
    circle.setAttribute('cy', cy)
    circle.setAttribute('r', radius)
    circle.setAttribute('class', 'wind-indicator-circle')
    group.appendChild(circle)

    const diagonal = radius * Math.SQRT1_2
    ;[
      [cx - diagonal, cy - diagonal, cx + diagonal, cy + diagonal],
      [cx - diagonal, cy + diagonal, cx + diagonal, cy - diagonal]
    ].forEach(([x1, y1, x2, y2]) => {
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', x1)
      line.setAttribute('y1', y1)
      line.setAttribute('x2', x2)
      line.setAttribute('y2', y2)
      line.setAttribute('class', 'wind-indicator-sector')
      group.appendChild(line)
    })

    const iconSize = 30
    const scale = iconSize / 640
    const pilot = document.createElementNS(SVG_NS, 'path')
    pilot.setAttribute('d', LOCATION_ARROW_PATH)
    pilot.setAttribute('class', pilotClass)
    pilot.setAttribute(
      'transform',
      `translate(${cx} ${cy}) rotate(45) scale(${scale}) translate(-320 -320)`
    )
    group.appendChild(pilot)

    const arrow = document.createElementNS(SVG_NS, 'path')
    arrow.setAttribute('d', 'M -10 -7 L 5 0 L -10 7 Z')
    arrow.setAttribute('class', 'wind-indicator-arrow')
    group.appendChild(arrow)

    const makeLabel = (x, y) => {
      const text = document.createElementNS(SVG_NS, 'text')
      text.setAttribute('x', x)
      text.setAttribute('y', y)
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'central')
      text.setAttribute('font-size', fontSize)
      text.setAttribute('class', 'wind-indicator-component')
      group.appendChild(text)
      return text
    }

    const labelRadius = radius * 0.62
    const headText = makeLabel(cx + labelRadius, cy)
    const tailText = makeLabel(cx - labelRadius, cy)
    const leftText = makeLabel(cx, cy - labelRadius)
    const rightText = makeLabel(cx, cy + labelRadius)
    const totalText = makeLabel(cx, cy + radius + fontSize * 0.55)
    totalText.classList.add('wind-indicator-total')

    this.trajectory.appendChild(group)

    return {
      center: { cx, cy, radius },
      arrow,
      headText,
      tailText,
      leftText,
      rightText,
      totalText,
      ...source
    }
  }

  updateWindIndicators(index) {
    if (!this.windIndicators) return

    this.windIndicators.forEach(indicator => {
      let pointIndex = index
      if (indicator.byPlayerTime) {
        const playerTime = this.processedPoints[index]?.playerTime
        if (playerTime === undefined) return
        pointIndex = closestIndexByPlayerTime(indicator.points, playerTime)
      }
      this.updateWindIndicator(indicator, pointIndex)
    })
  }

  updateWindIndicator(indicator, index) {
    const { points, weather, referenceTime } = indicator
    if (!weather) return

    const point = points[index]
    if (!point) return

    const targetIndex = targetIndexFrom(points, index)
    const heading = calculateBearing(point, points[targetIndex])

    const { windSpeed, windDirection } = weather.weatherOn(referenceTime, point.altitude)

    const relativeFrom = (((windDirection - heading) % 360) + 360) % 360
    const angle = (relativeFrom * Math.PI) / 180

    const dx = Math.cos(angle)
    const dy = Math.sin(angle)

    const { cx, cy, radius } = indicator.center
    const px = cx + radius * dx
    const py = cy + radius * dy
    const rotation = (Math.atan2(-dy, -dx) * 180) / Math.PI

    indicator.arrow.setAttribute(
      'transform',
      `translate(${px} ${py}) rotate(${rotation})`
    )

    const speedKmh = windSpeed * 3.6
    const head = Math.round(speedKmh * Math.cos(angle))
    const side = Math.round(speedKmh * Math.sin(angle))
    const total = Math.round(speedKmh)

    indicator.headText.textContent = head > 0 ? `${head}` : ''
    indicator.tailText.textContent = head < 0 ? `${-head}` : ''
    indicator.leftText.textContent = side < 0 ? `${-side}` : ''
    indicator.rightText.textContent = side > 0 ? `${side}` : ''
    indicator.totalText.textContent = total > 0 ? `${total} km/h` : ''
  }

  viewBoxFontSize(remPx) {
    const rect = this.svg.getBoundingClientRect()
    const viewBox = this.svg.viewBox.baseVal
    if (!rect.width || !viewBox.width) return remPx

    const scale = Math.min(rect.width / viewBox.width, rect.height / viewBox.height)
    return scale > 0 ? remPx / scale : remPx
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

  handleInteraction(e) {
    const ctm = this.svg.getScreenCTM()
    if (!ctm) return

    const point = this.svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    const svgX = point.matrixTransform(ctm.inverse()).x

    const { left } = CHART_PADDING
    const plotWidth = this.chartDimensions.plotWidth

    const relX = svgX - left
    const distanceRatio = relX / plotWidth
    const distance =
      this.distanceRange.min +
      distanceRatio * (this.distanceRange.max - this.distanceRange.min)

    const closestIndex = this.findClosestPointByDistance(distance)
    if (closestIndex >= 0) {
      this.onSeek(closestIndex)
      this.showTooltip(closestIndex, e)
    }
  }

  handleMouseLeave() {
    if (this.tooltip) this.tooltip.style.display = 'none'
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

  createCrosshair() {
    if (this.crosshairGroup) {
      this.crosshairGroup.remove()
    }

    const contentGroup = this.svg.querySelector('#trajectory-content')
    if (!contentGroup) return

    this.crosshairGroup = document.createElementNS(SVG_NS, 'g')
    this.crosshairGroup.setAttribute('class', 'crosshair-group')
    this.crosshairGroup.style.display = 'none'

    this.crosshairVLine = document.createElementNS(SVG_NS, 'line')
    this.crosshairVLine.setAttribute('class', 'crosshair')
    this.crosshairGroup.appendChild(this.crosshairVLine)

    this.crosshairHLine = document.createElementNS(SVG_NS, 'line')
    this.crosshairHLine.setAttribute('class', 'crosshair')
    this.crosshairGroup.appendChild(this.crosshairHLine)

    this.crosshairMarker = document.createElementNS(SVG_NS, 'circle')
    this.crosshairMarker.setAttribute('class', 'crosshair-marker')
    this.crosshairMarker.setAttribute('r', '6')
    this.crosshairGroup.appendChild(this.crosshairMarker)

    if (this.compareProcessedPoints?.length) {
      this.compareCrosshairMarker = document.createElementNS(SVG_NS, 'circle')
      this.compareCrosshairMarker.setAttribute('class', 'crosshair-marker--compare')
      this.compareCrosshairMarker.setAttribute('r', '5')
      this.crosshairGroup.appendChild(this.compareCrosshairMarker)
    }

    contentGroup.appendChild(this.crosshairGroup)
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

    this.updateComparisonCrosshair(playerTime)
  }

  updateComparisonCrosshair(playerTime) {
    if (!this.compareCrosshairMarker || !this.compareProcessedPoints?.length) return

    const comparePoint = interpolateByPlayerTime(this.compareProcessedPoints, playerTime)
    if (!comparePoint) {
      this.compareCrosshairMarker.style.display = 'none'
      return
    }

    const { x: compareX, y: compareY } = this.getChartCoordinates(comparePoint)

    this.compareCrosshairMarker.setAttribute('cx', compareX)
    this.compareCrosshairMarker.setAttribute('cy', compareY)
    this.compareCrosshairMarker.style.display = ''
  }

  showTooltip(index, event) {
    if (!this.tooltip) return

    const point = this.processedPoints[index]
    if (!point) return

    const comparePoint = this.compareProcessedPoints?.length
      ? interpolateByPlayerTime(this.compareProcessedPoints, point.playerTime)
      : null

    this.tooltip.innerHTML = this.buildTooltipHtml(point, comparePoint)
    this.positionTooltip(event)
    this.tooltip.style.display = 'block'
  }

  buildTooltipHtml(point, comparePoint) {
    const num = (value, digits = 0) =>
      value == null || Number.isNaN(value) ? '—' : value.toFixed(digits)
    const time = Math.round(point.playerTime - (this.windowEntryTime || 0))

    if (!comparePoint) {
      return `
        <div><b>Time:</b> ${time} s</div>
        <div><b>Distance:</b> ${Math.round(point.distance)} m</div>
        <div><b>Altitude:</b> ${Math.round(point.altitude)} m</div>
        <div><b>H speed:</b> ${Math.round(point.hSpeed)} km/h</div>
        <div><b>V speed:</b> ${Math.round(point.vSpeed)} km/h</div>
        <div><b>Glide:</b> ${num(point.glideRatio, 2)}</div>
      `
    }

    const rows = [
      ['Distance, m', Math.round(point.distance), Math.round(comparePoint.distance)],
      ['Altitude, m', Math.round(point.altitude), Math.round(comparePoint.altitude)],
      ['H speed, km/h', Math.round(point.hSpeed), Math.round(comparePoint.hSpeed)],
      ['V speed, km/h', Math.round(point.vSpeed), Math.round(comparePoint.vSpeed)],
      ['Glide', num(point.glideRatio, 2), num(comparePoint.glideRatio, 2)]
    ]

    const body = rows
      .map(
        ([label, a, b]) =>
          `<tr><th>${label}</th><td>${a}</td><td class="is-compare">${b}</td></tr>`
      )
      .join('')

    return `
      <div class="skydive-side-tooltip-time"><b>Time:</b> ${time} s</div>
      <table class="skydive-side-tooltip-table">
        <tr><th></th><td>Pilot</td><td class="is-compare">Compare</td></tr>
        ${body}
      </table>
      <div class="skydive-side-tooltip-summary">
        ${this.relativeSummaryHtml(point, comparePoint)}
      </div>
    `
  }

  relativeSummaryHtml(point, comparePoint) {
    const altDiff = point.altitude - comparePoint.altitude
    const distDiff = point.distance - comparePoint.distance

    const altText =
      Math.abs(altDiff) < 1
        ? 'same altitude'
        : `${Math.abs(Math.round(altDiff))}m ${altDiff > 0 ? 'above' : 'below'}`
    const distText =
      Math.abs(distDiff) < 1
        ? 'same distance'
        : `${Math.abs(Math.round(distDiff))}m ${distDiff > 0 ? 'in front' : 'behind'}`

    return `${altText} · ${distText}`
  }

  positionTooltip(event) {
    if (!event || !this.container) return

    const containerRect = this.container.getBoundingClientRect()
    const cursorX = event.clientX - containerRect.left
    const cursorY = event.clientY - containerRect.top

    const tipRect = this.tooltip.getBoundingClientRect()
    const tipWidth = tipRect.width || 170
    const tipHeight = tipRect.height || 130
    const offset = 14

    let left = cursorX + offset
    if (left + tipWidth > containerRect.width) left = cursorX - tipWidth - offset
    if (left < 0) left = 0

    let top = cursorY - tipHeight - offset
    if (top < 0) top = cursorY + offset

    this.tooltip.style.left = `${left}px`
    this.tooltip.style.top = `${top}px`
  }
}
