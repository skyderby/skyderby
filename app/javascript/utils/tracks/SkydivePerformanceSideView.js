import { detectFlares, drawFlares } from 'utils/tracks/flareDetection'
import {
  calculateBearing,
  targetIndexFrom,
  closestIndexByPlayerTime,
  interpolateByPlayerTime,
  interpolateAtIndex
} from 'utils/tracks/pointHelpers'
import { LOCATION_ARROW_PATH } from 'utils/tracks/locationArrowPath'
import { convertSpeed, convertLength, speedUnitLabel, lengthUnitLabel } from 'utils/units'
import { SVG_NS, svgEl } from 'charts/svg/elements'
import { formatAxisLength, deltaCellHtml } from 'charts/svg/format'
import Crosshair from 'charts/svg/Crosshair'
import {
  distanceLineStep,
  distanceLabelStep,
  renderDistanceGrid,
  renderWindowLines
} from 'charts/svg/distanceGrid'

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
    compareReferenceTime,
    units = 'metric'
  }) {
    this.processedPoints = processedPoints || []
    this.compareProcessedPoints = compareProcessedPoints || null
    this.units = units
    this.fromValue = fromValue
    this.toValue = toValue
    this.maxAltitude = maxAltitude
    this.minAltitude = minAltitude
    this.weather = weather
    this.compareWeather = compareWeather
    this.compareReferenceTime = compareReferenceTime

    if (this.processedPoints.length === 0) return

    this.windowEntryTime = this.calculateWindowEntryValue('playerTime')
    this.windowEntryDistance = this.calculateWindowEntryValue('distance')
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

  calculateWindowEntryValue(key) {
    const points = this.processedPoints

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (curr.altitude >= this.fromValue && next.altitude < this.fromValue) {
        const fraction =
          (curr.altitude - this.fromValue) / (curr.altitude - next.altitude)
        return curr[key] + (next[key] - curr[key]) * fraction
      }
    }

    return points[0]?.[key] || 0
  }

  calculateRanges() {
    let maxDist = 0
    let minDist = 0
    let maxAlt = this.maxAltitude
    let minAlt = this.minAltitude

    const account = p => {
      maxDist = Math.max(maxDist, p.distance)
      minDist = Math.min(minDist, p.distance)
      maxAlt = Math.max(maxAlt, p.altitude)
      minAlt = Math.min(minAlt, p.altitude)
    }

    this.processedPoints.forEach(account)

    if (this.compareProcessedPoints) {
      this.compareProcessedPoints.forEach(account)
    }

    this.distanceRange = { min: minDist - 50, max: maxDist + 100 }
    this.altitudeBounds = { max: maxAlt, min: minAlt }
  }

  renderGrid() {
    const grid = this.grid
    grid.innerHTML = ''

    const { left, right, top, bottom } = CHART_PADDING

    const altitudeBuffer = (this.altitudeBounds.max - this.altitudeBounds.min) * 0.05
    this.altitudeRange = {
      top: this.altitudeBounds.max + altitudeBuffer,
      bottom: this.altitudeBounds.min - altitudeBuffer
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

    const plot = { left, top, width: plotWidth, height: plotHeight }
    renderWindowLines(grid, {
      plot,
      startY: windowStartY,
      endY: windowEndY,
      labels: {
        start: formatAxisLength(this.fromValue, this.units),
        end: formatAxisLength(this.toValue, this.units)
      }
    })

    const altitudeStep = 250
    const labelGap = 30
    const firstLine = Math.ceil(this.altitudeBounds.min / altitudeStep) * altitudeStep
    for (
      let altitude = firstLine;
      altitude <= this.altitudeBounds.max;
      altitude += altitudeStep
    ) {
      const y = altitudeToY(altitude)

      if (Math.abs(y - windowStartY) < labelGap || Math.abs(y - windowEndY) < labelGap) {
        continue
      }

      grid.appendChild(
        svgEl('line', { x1: left, y1: y, x2: width - right, y2: y, class: 'grid-line' })
      )
      grid.appendChild(
        svgEl(
          'text',
          { x: left - 10, y: y + 4, class: 'grid-label' },
          formatAxisLength(altitude, this.units)
        )
      )
    }

    const range = this.distanceRange
    const lineStep = distanceLineStep(range.max - range.min)
    renderDistanceGrid(grid, {
      range,
      plot,
      lineStep,
      labelStep: distanceLabelStep(range.max - range.min, plotWidth, lineStep),
      fromZero: true,
      format: value => formatAxisLength(value, this.units)
    })
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

    drawFlares(container, flares, scaleX, scaleY, this.viewBoxFontSize(14), this.units)
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
    label.textContent = `${Math.round(convertSpeed(maxPoint.fullSpeed, this.units))} ${speedUnitLabel(this.units)}`
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

    const speedKmh = convertSpeed(windSpeed * 3.6, this.units)
    const head = Math.round(speedKmh * Math.cos(angle))
    const side = Math.round(speedKmh * Math.sin(angle))
    const total = Math.round(speedKmh)

    indicator.headText.textContent = head > 0 ? `${head}` : ''
    indicator.tailText.textContent = head < 0 ? `${-head}` : ''
    indicator.leftText.textContent = side < 0 ? `${-side}` : ''
    indicator.rightText.textContent = side > 0 ? `${side}` : ''
    indicator.totalText.textContent =
      total > 0 ? `${total} ${speedUnitLabel(this.units)}` : ''
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
    this.crosshair?.remove()

    const contentGroup = this.svg.querySelector('#trajectory-content')
    if (!contentGroup) return

    this.crosshair = new Crosshair(contentGroup, {
      markerRadius: 6,
      compare: Boolean(this.compareProcessedPoints?.length)
    })

    const { width, height } = this.chartDimensions
    const { left, right, top, bottom } = CHART_PADDING
    this.crosshair.setBounds({
      x1: left,
      x2: width - right,
      y1: top,
      y2: height - bottom
    })
  }

  showCrosshair(index) {
    const point = this.processedPoints[index]
    if (!this.crosshair || !point) return

    this.showCrosshairAtPosition(point, point.playerTime)
  }

  showCrosshairInterpolated(index, fraction) {
    if (!this.crosshair || index < 0 || index >= this.processedPoints.length) return

    const point = interpolateAtIndex(this.processedPoints, index, fraction, [
      'distance',
      'altitude',
      'playerTime'
    ])
    this.showCrosshairAtPosition(point, point.playerTime)
  }

  showCrosshairAtPosition(point, playerTime) {
    const { x, y } = this.getChartCoordinates(point)
    this.crosshair.show(x, y)
    this.updateComparisonCrosshair(playerTime)
  }

  updateComparisonCrosshair(playerTime) {
    if (!this.compareProcessedPoints?.length) return

    const comparePoint = interpolateByPlayerTime(this.compareProcessedPoints, playerTime)
    if (!comparePoint) {
      this.crosshair.hideCompare()
      return
    }

    const { x, y } = this.getChartCoordinates(comparePoint)
    this.crosshair.showCompare(x, y)
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
    const entryTime = this.windowEntryTime || 0
    const entryDistance = this.windowEntryDistance || 0
    const time = Math.round(point.playerTime - entryTime)
    const speed = value => convertSpeed(value, this.units)
    const length = value => convertLength(value, this.units)
    const speedU = speedUnitLabel(this.units)
    const lengthU = lengthUnitLabel(this.units)
    const distance = value => Math.round(length(value - entryDistance))

    if (!comparePoint) {
      return `
        <div><b>Time:</b> ${time} s</div>
        <div><b>Distance:</b> ${distance(point.distance)} ${lengthU}</div>
        <div><b>Altitude:</b> ${Math.round(length(point.altitude))} ${lengthU}</div>
        <div><b>H speed:</b> ${Math.round(speed(point.hSpeed))} ${speedU}</div>
        <div><b>V speed:</b> ${Math.round(speed(point.vSpeed))} ${speedU}</div>
        <div><b>Glide:</b> ${num(point.glideRatio, 2)}</div>
      `
    }

    const rows = [
      [
        `Distance, ${lengthU}`,
        distance(point.distance),
        distance(comparePoint.distance),
        ''
      ],
      [
        `Altitude, ${lengthU}`,
        Math.round(length(point.altitude)),
        Math.round(length(comparePoint.altitude)),
        ''
      ],
      [
        `H speed, ${speedU}`,
        Math.round(speed(point.hSpeed)),
        Math.round(speed(comparePoint.hSpeed)),
        deltaCellHtml(speed(point.hSpeed), speed(comparePoint.hSpeed))
      ],
      [
        `V speed, ${speedU}`,
        Math.round(speed(point.vSpeed)),
        Math.round(speed(comparePoint.vSpeed)),
        deltaCellHtml(speed(point.vSpeed), speed(comparePoint.vSpeed))
      ],
      [
        'Glide',
        num(point.glideRatio, 2),
        num(comparePoint.glideRatio, 2),
        deltaCellHtml(point.glideRatio, comparePoint.glideRatio, 1, 10)
      ]
    ]

    const body = rows
      .map(
        ([label, a, b, d]) =>
          `<tr><th>${label}</th><td>${a}</td><td class="is-compare">${b}</td><td class="side-tt-delta-cell">${d}</td></tr>`
      )
      .join('')

    return `
      <div class="skydive-side-tooltip-time"><b>Time:</b> ${time} s</div>
      <table class="skydive-side-tooltip-table">
        <tr><th></th><td>Pilot</td><td class="is-compare">Compare</td><td>Δ</td></tr>
        ${body}
      </table>
      <div class="skydive-side-tooltip-summary">
        ${this.relativeSummaryHtml(point, comparePoint)}
      </div>
    `
  }

  relativeSummaryHtml(point, comparePoint) {
    const lengthU = lengthUnitLabel(this.units)
    const altDiff = point.altitude - comparePoint.altitude
    const distDiff = point.distance - comparePoint.distance
    const length = value => Math.abs(Math.round(convertLength(value, this.units)))

    const altText =
      Math.abs(altDiff) < 1
        ? 'same altitude'
        : `${length(altDiff)}${lengthU} ${altDiff > 0 ? 'above' : 'below'}`
    const distText =
      Math.abs(distDiff) < 1
        ? 'same distance'
        : `${length(distDiff)}${lengthU} ${distDiff > 0 ? 'in front' : 'behind'}`

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
