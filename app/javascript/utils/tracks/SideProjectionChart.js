import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'
import { detectFlares, drawFlares } from './flareDetection'
import { convertSpeed, convertLength, speedUnitLabel, lengthUnitLabel } from 'utils/units'

const SVG_NS = 'http://www.w3.org/2000/svg'

const PRIMARY_COLOR = '#2196F3'
const COMPARE_COLOR = '#9C27B0'

function formatAxisLength(meters, units) {
  const value = convertLength(meters, units)
  if (units === 'imperial') {
    return value === 0 ? '0' : `${(value / 1000).toFixed(1)}k`
  }
  return String(Math.round(value))
}

function deltaCellHtml(a, b, digits = 0) {
  if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b)) return ''

  const diff = Number((a - b).toFixed(digits))
  const denom = Math.max(Math.abs(a), Math.abs(b)) || 1
  const width = Math.min(50, (Math.abs(diff) / denom) * 50)
  const primaryLeads = diff >= 0

  const fillStyle = primaryLeads
    ? `right:50%;left:auto;width:${width}%;background:${PRIMARY_COLOR}`
    : `left:50%;right:auto;width:${width}%;background:${COMPARE_COLOR}`
  const valueClass = primaryLeads ? 'is-primary' : 'is-compare'
  const sign = diff > 0 ? '+' : ''

  return `<span class="side-tt-delta"><span class="side-tt-delta__bar"><span class="side-tt-delta__mark"></span><span class="side-tt-delta__fill" style="${fillStyle}"></span></span><span class="side-tt-delta__val ${valueClass}">${sign}${diff.toFixed(digits)}</span></span>`
}

export default class SideProjectionChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      padding: { top: 0, right: 20, bottom: 40, left: 50 },
      onPointHover: null,
      syncVerticalSpeed: 10,
      units: 'metric',
      ...options
    }
    this.points = []
    this.flightProfile = []
    this.compareRawPoints = null
    this.compareFlightProfile = []
    this.terrainProfile = null
    this.finishCrossing = null
    this.compareFinishCrossing = null
    this.finishLineVisible = true
  }

  setFlightProfile(points) {
    this.points = points
    this.flightProfile = this.calculateFlightProfile(points)
    return this
  }

  setCompareProfile(points) {
    this.compareRawPoints = points
    return this
  }

  setTerrainProfile(measurements) {
    this.terrainProfile = measurements
    return this
  }

  setFinishLineCrossing(index, fraction, resultTime, label = null) {
    this.finishCrossing = { index, fraction, resultTime, label }
    return this
  }

  setCompareFinishLineCrossing(index, fraction, resultTime, label = null) {
    this.compareFinishCrossing = { index, fraction, resultTime, label }
    return this
  }

  setFinishLineVisible(visible) {
    this.finishLineVisible = visible

    if (this.svg) {
      this.svg
        .querySelectorAll('.finish-line-crossing, .finish-line-crossing--compare')
        .forEach(el => {
          el.style.display = visible ? '' : 'none'
        })
    }
    return this
  }

  calculateFlightProfile(points) {
    if (!points.length) return []

    const firstPoint = points[0]
    let accumulatedDistance = 0

    return points.map((point, idx) => {
      const prevPoint = points[idx - 1] ?? firstPoint
      const distance = accumulatedDistance + this.calculateDistance(prevPoint, point)
      accumulatedDistance = distance

      return {
        x: distance,
        y: Math.max(0, firstPoint.altitude - point.altitude),
        altitude: point.altitude,
        hSpeed: point.hSpeed,
        vSpeed: point.vSpeed,
        fullSpeed: point.fullSpeed,
        glideRatio: point.glideRatio,
        gpsTime: point.gpsTime,
        flTime: point.flTime,
        playerTime: point.flTime - firstPoint.flTime
      }
    })
  }

  findSyncIndex(profile) {
    const threshold = this.options.syncVerticalSpeed

    for (let i = 0; i < profile.length; i++) {
      if (profile[i].vSpeed >= threshold) {
        return i
      }
    }
    return null
  }

  buildCompareProfile() {
    this.compareFlightProfile = []
    if (!this.compareRawPoints?.length || !this.flightProfile.length) return

    const compareProfile = this.calculateFlightProfile(this.compareRawPoints)
    const primaryIndex = this.findSyncIndex(this.flightProfile)
    const compareIndex = this.findSyncIndex(compareProfile)
    if (primaryIndex === null || compareIndex === null) return

    const primarySync = this.flightProfile[primaryIndex]
    const compareSync = compareProfile[compareIndex]
    const offsetX = primarySync.x - compareSync.x
    const offsetY = primarySync.y - compareSync.y
    const primaryStartFlTime = this.flightProfile[0].flTime
    const syncPlayerTime = primarySync.flTime - primaryStartFlTime

    compareProfile.forEach(point => {
      point.x += offsetX
      point.y += offsetY
      point.exitTime = point.flTime - compareSync.flTime
      point.playerTime = point.flTime - compareSync.flTime + syncPlayerTime
    })

    this.compareFlightProfile = compareProfile
  }

  primarySyncFlTime() {
    if (!this.flightProfile.length) return null

    const index = this.findSyncIndex(this.flightProfile)
    const point = index === null ? this.flightProfile[0] : this.flightProfile[index]
    return point.flTime
  }

  interpolateCompareProfile(playerTime) {
    const profile = this.compareFlightProfile
    if (!profile.length) return null

    const lerp = (a, b, f) => a + (b - a) * f

    for (let i = 0; i < profile.length - 1; i++) {
      const curr = profile[i]
      const next = profile[i + 1]

      if (playerTime >= curr.playerTime && playerTime < next.playerTime) {
        const f = (playerTime - curr.playerTime) / (next.playerTime - curr.playerTime)
        return {
          x: lerp(curr.x, next.x, f),
          y: lerp(curr.y, next.y, f),
          altitude: lerp(curr.altitude, next.altitude, f),
          hSpeed: lerp(curr.hSpeed, next.hSpeed, f),
          vSpeed: lerp(curr.vSpeed, next.vSpeed, f),
          fullSpeed: lerp(curr.fullSpeed, next.fullSpeed, f),
          glideRatio: lerp(curr.glideRatio ?? 0, next.glideRatio ?? 0, f),
          exitTime: lerp(curr.exitTime, next.exitTime, f)
        }
      }
    }

    if (playerTime < profile[0].playerTime) return profile[0]
    return profile[profile.length - 1]
  }

  calculateDistance(first, second) {
    const firstPosition = new LatLon(first.latitude, first.longitude)
    const secondPosition = new LatLon(second.latitude, second.longitude)
    return firstPosition.distanceTo(secondPosition)
  }

  findIntersectionPoint() {
    const minAltitudeDrop = 50

    for (let i = 1; i < this.flightProfile.length; i++) {
      const prev = this.flightProfile[i - 1]
      const curr = this.flightProfile[i]

      if (curr.y < minAltitudeDrop) continue

      const prevDiff = prev.y - prev.x
      const currDiff = curr.y - curr.x

      if (prevDiff * currDiff < 0) {
        const t = prevDiff / (prevDiff - currDiff)
        const x = prev.x + t * (curr.x - prev.x)
        const y = prev.y + t * (curr.y - prev.y)
        return { x, y, index: i }
      }
    }
    return null
  }

  render() {
    if (!this.flightProfile.length) return this

    this.clear()
    this.buildCompareProfile()
    this.calculateDimensions()
    this.createSvg()
    this.drawGrid()
    this.drawReferenceLine()
    this.drawTerrainProfile()
    this.drawTerrainClearance()
    this.drawTrajectory()
    this.drawCompareTrajectory()
    this.drawIntersectionPoint()
    this.drawFinishLineCrossing()
    this.drawFlares()
    this.renderMaxSpeedMarker()
    this.createCrosshair()
    this.setupInteraction()

    return this
  }

  clear() {
    this.container.innerHTML = ''
  }

  calculateDimensions() {
    const rect = this.container.getBoundingClientRect()
    this.width = rect.width || 400
    this.height = rect.height || 400

    const { padding } = this.options
    this.chartWidth = this.width - padding.left - padding.right
    this.chartHeight = this.height - padding.top - padding.bottom

    const profiles = this.compareFlightProfile.length
      ? this.flightProfile.concat(this.compareFlightProfile)
      : this.flightProfile
    const maxX = Math.max(...profiles.map(p => p.x))
    const maxY = Math.max(...profiles.map(p => p.y))
    const maxValue = Math.max(maxX, maxY)

    const roundTo = maxValue > 500 ? 100 : 50
    this.maxScale = Math.ceil(maxValue / roundTo) * roundTo

    this.scaleX = x => padding.left + (x / this.maxScale) * this.chartWidth
    this.scaleY = y => padding.top + (y / this.maxScale) * this.chartHeight
  }

  createSvg() {
    this.svg = document.createElementNS(SVG_NS, 'svg')
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', '100%')
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
    this.svg.setAttribute('class', 'side-projection-chart')
    this.container.appendChild(this.svg)
  }

  drawGrid() {
    const gridGroup = document.createElementNS(SVG_NS, 'g')
    gridGroup.setAttribute('class', 'grid')

    const gridInterval = this.maxScale > 500 ? 100 : 50

    const stepPxX = (gridInterval / this.maxScale) * this.chartWidth
    const stepPxY = (gridInterval / this.maxScale) * this.chartHeight
    const minLabelGapX = 36
    const minLabelGapY = 22
    const labelStepX = stepPxX > 0 ? Math.max(1, Math.ceil(minLabelGapX / stepPxX)) : 1
    const labelStepY = stepPxY > 0 ? Math.max(1, Math.ceil(minLabelGapY / stepPxY)) : 1

    let labelIndex = 0
    for (let value = 0; value <= this.maxScale; value += gridInterval) {
      const x = this.scaleX(value)
      const y = this.scaleY(value)
      const showXLabel = labelIndex % labelStepX === 0
      const showYLabel = labelIndex % labelStepY === 0

      const vLine = document.createElementNS(SVG_NS, 'line')
      vLine.setAttribute('x1', x)
      vLine.setAttribute('y1', this.options.padding.top)
      vLine.setAttribute('x2', x)
      vLine.setAttribute('y2', this.height - this.options.padding.bottom)
      vLine.setAttribute('stroke', '#e0e0e0')
      vLine.setAttribute('stroke-width', '1')
      gridGroup.appendChild(vLine)

      const hLine = document.createElementNS(SVG_NS, 'line')
      hLine.setAttribute('x1', this.options.padding.left)
      hLine.setAttribute('y1', y)
      hLine.setAttribute('x2', this.width - this.options.padding.right)
      hLine.setAttribute('y2', y)
      hLine.setAttribute('stroke', '#e0e0e0')
      hLine.setAttribute('stroke-width', '1')
      gridGroup.appendChild(hLine)

      if (showXLabel) {
        const xLabel = document.createElementNS(SVG_NS, 'text')
        xLabel.setAttribute('x', x)
        xLabel.setAttribute('y', this.height - this.options.padding.bottom + 15)
        xLabel.setAttribute('text-anchor', 'middle')
        xLabel.setAttribute('font-size', '11')
        xLabel.setAttribute('fill', '#666')
        xLabel.textContent = formatAxisLength(value, this.options.units)
        gridGroup.appendChild(xLabel)
      }

      if (showYLabel) {
        const yLabel = document.createElementNS(SVG_NS, 'text')
        yLabel.setAttribute('x', this.options.padding.left - 8)
        yLabel.setAttribute('y', y + 4)
        yLabel.setAttribute('text-anchor', 'end')
        yLabel.setAttribute('font-size', '11')
        yLabel.setAttribute('fill', '#666')
        yLabel.textContent = formatAxisLength(value, this.options.units)
        gridGroup.appendChild(yLabel)
      }

      labelIndex++
    }

    const xAxisLabel = document.createElementNS(SVG_NS, 'text')
    xAxisLabel.setAttribute('x', this.width / 2)
    xAxisLabel.setAttribute('y', this.height - 5)
    xAxisLabel.setAttribute('text-anchor', 'middle')
    xAxisLabel.setAttribute('font-size', '12')
    xAxisLabel.setAttribute('fill', '#333')
    xAxisLabel.textContent = `Distance (${lengthUnitLabel(this.options.units)})`
    gridGroup.appendChild(xAxisLabel)

    const yAxisLabel = document.createElementNS(SVG_NS, 'text')
    yAxisLabel.setAttribute('x', 12)
    yAxisLabel.setAttribute('y', this.height / 2)
    yAxisLabel.setAttribute('text-anchor', 'middle')
    yAxisLabel.setAttribute('font-size', '12')
    yAxisLabel.setAttribute('fill', '#333')
    yAxisLabel.setAttribute('transform', `rotate(-90, 12, ${this.height / 2})`)
    yAxisLabel.textContent = `Altitude drop (${lengthUnitLabel(this.options.units)})`
    gridGroup.appendChild(yAxisLabel)

    this.svg.appendChild(gridGroup)
  }

  drawReferenceLine() {
    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute('class', 'reference-line')
    line.setAttribute('x1', this.scaleX(0))
    line.setAttribute('y1', this.scaleY(0))
    line.setAttribute('x2', this.scaleX(this.maxScale))
    line.setAttribute('y2', this.scaleY(this.maxScale))
    line.setAttribute('stroke', '#999')
    line.setAttribute('stroke-width', '1')
    line.setAttribute('stroke-dasharray', '5,5')
    this.svg.appendChild(line)

    const label = document.createElementNS(SVG_NS, 'text')
    const labelX = this.scaleX(this.maxScale * 0.85)
    const labelY = this.scaleY(this.maxScale * 0.85) - 8
    label.setAttribute('x', labelX)
    label.setAttribute('y', labelY)
    label.setAttribute('font-size', '11')
    label.setAttribute('fill', '#999')
    label.setAttribute('transform', `rotate(-45, ${labelX}, ${labelY})`)
    label.textContent = '1:1'
    this.svg.appendChild(label)
  }

  drawTerrainProfile() {
    if (!this.terrainProfile?.length) return

    const maxAltitude = Math.max(...this.terrainProfile.map(p => p.altitude))
    const maxAltitudeY = this.scaleY(maxAltitude)

    const areaData = this.terrainProfile
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${this.scaleX(p.distance)} ${this.scaleY(p.altitude)}`
      )
      .join(' ')

    const lastPoint = this.terrainProfile[this.terrainProfile.length - 1]
    const firstPoint = this.terrainProfile[0]

    const closePath = ` L ${this.scaleX(lastPoint.distance)} ${maxAltitudeY} L ${this.scaleX(firstPoint.distance)} ${maxAltitudeY} Z`

    const area = document.createElementNS(SVG_NS, 'path')
    area.setAttribute('class', 'terrain-profile')
    area.setAttribute('d', areaData + closePath)
    area.setAttribute('fill', '#D4A574')
    area.setAttribute('fill-opacity', '0.5')
    area.setAttribute('stroke', '#A67B5B')
    area.setAttribute('stroke-width', '1')
    this.svg.appendChild(area)
  }

  getTerrainAltitudeAt(distance) {
    if (!this.terrainProfile?.length) return null

    for (let i = 1; i < this.terrainProfile.length; i++) {
      const prev = this.terrainProfile[i - 1]
      const curr = this.terrainProfile[i]

      if (distance >= prev.distance && distance <= curr.distance) {
        const t = (distance - prev.distance) / (curr.distance - prev.distance)
        return prev.altitude + t * (curr.altitude - prev.altitude)
      }
    }

    const last = this.terrainProfile[this.terrainProfile.length - 1]
    if (distance > last.distance) return null

    return this.terrainProfile[0].altitude
  }

  drawTerrainClearance() {
    if (!this.terrainProfile?.length || !this.flightProfile.length) return

    const zones = { red: [], yellow: [] }

    for (let i = 0; i < this.flightProfile.length; i++) {
      const point = this.flightProfile[i]
      const terrainAlt = this.getTerrainAltitudeAt(point.x)
      if (terrainAlt === null) continue

      const clearance = terrainAlt - point.y

      if (clearance <= 25) {
        zones.red.push({ flight: point, terrainAlt })
      } else if (clearance <= 100) {
        zones.yellow.push({ flight: point, terrainAlt })
      }
    }

    this.drawClearanceZone(zones.yellow, 'rgba(255, 193, 7, 0.4)')
    this.drawClearanceZone(zones.red, 'rgba(244, 67, 54, 0.4)')
  }

  drawClearanceZone(points, color) {
    if (!points.length) return

    const segments = []
    let currentSegment = [points[0]]

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const prevIdx = this.flightProfile.indexOf(prev.flight)
      const currIdx = this.flightProfile.indexOf(curr.flight)

      if (currIdx - prevIdx === 1) {
        currentSegment.push(curr)
      } else {
        if (currentSegment.length > 0) segments.push(currentSegment)
        currentSegment = [curr]
      }
    }
    if (currentSegment.length > 0) segments.push(currentSegment)

    for (const segment of segments) {
      if (segment.length < 2) continue

      let pathData = segment
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'} ${this.scaleX(p.flight.x)} ${this.scaleY(p.flight.y)}`
        )
        .join(' ')

      for (let i = segment.length - 1; i >= 0; i--) {
        const p = segment[i]
        pathData += ` L ${this.scaleX(p.flight.x)} ${this.scaleY(p.terrainAlt)}`
      }
      pathData += ' Z'

      const area = document.createElementNS(SVG_NS, 'path')
      area.setAttribute('d', pathData)
      area.setAttribute('fill', color)
      area.setAttribute('stroke', 'none')
      this.svg.appendChild(area)
    }
  }

  drawTrajectory() {
    if (!this.flightProfile.length) return

    const pathData = this.flightProfile
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${this.scaleX(p.x)} ${this.scaleY(p.y)}`)
      .join(' ')

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('class', 'trajectory')
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#2196F3')
    path.setAttribute('stroke-width', '3')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    this.svg.appendChild(path)

    this.trajectoryPath = path
  }

  drawCompareTrajectory() {
    if (!this.compareFlightProfile.length) return

    const pathData = this.compareFlightProfile
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${this.scaleX(p.x)} ${this.scaleY(p.y)}`)
      .join(' ')

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('class', 'trajectory--compare')
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#9C27B0')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('stroke-dasharray', '8 4')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    this.svg.appendChild(path)
  }

  renderMaxSpeedMarker() {
    this.renderMaxSpeedFor(this.flightProfile, 'max-speed-marker')

    if (this.compareFlightProfile.length) {
      this.renderMaxSpeedFor(this.compareFlightProfile, 'max-speed-marker--compare')
    }
  }

  renderMaxSpeedFor(profile, className) {
    if (!profile.length) return

    const maxPoint = profile.reduce((max, p) => (p.fullSpeed > max.fullSpeed ? p : max))
    const x = this.scaleX(maxPoint.x)
    const y = this.scaleY(maxPoint.y)

    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', `max-speed-marker-group ${className}`)

    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('cx', x)
    circle.setAttribute('cy', y)
    circle.setAttribute('r', '4')
    group.appendChild(circle)

    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('x', x)
    label.setAttribute('y', y - 10)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', '11')
    label.setAttribute('font-weight', '600')
    label.textContent = `${Math.round(convertSpeed(maxPoint.fullSpeed, this.options.units))} ${speedUnitLabel(this.options.units)}`
    group.appendChild(label)

    this.svg.appendChild(group)
  }

  drawIntersectionPoint() {
    const intersection = this.findIntersectionPoint()
    if (!intersection) return

    const x = this.scaleX(intersection.x)
    const y = this.scaleY(intersection.y)

    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('class', 'intersection-marker')
    circle.setAttribute('cx', x)
    circle.setAttribute('cy', y)
    circle.setAttribute('r', '2')
    circle.setAttribute('fill', '#f00')
    this.svg.appendChild(circle)

    const extLine = document.createElementNS(SVG_NS, 'line')
    extLine.setAttribute('x1', x)
    extLine.setAttribute('y1', y)
    extLine.setAttribute('x2', x)
    extLine.setAttribute('y2', y - 25)
    extLine.setAttribute('stroke', '#f00')
    extLine.setAttribute('stroke-width', '1')
    extLine.setAttribute('stroke-dasharray', '2,2')
    this.svg.appendChild(extLine)

    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('x', x)
    label.setAttribute('y', y - 28)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', '11')
    label.setAttribute('fill', '#f00')
    label.textContent = `1:1 ${Math.round(convertLength(intersection.x, this.options.units))}${lengthUnitLabel(this.options.units)}`
    this.svg.appendChild(label)
  }

  drawFinishLineCrossing() {
    const items = []
    if (this.finishCrossing) {
      items.push({
        crossing: this.finishCrossing,
        profile: this.flightProfile,
        className: 'finish-line-crossing'
      })
    }
    if (this.compareFinishCrossing && this.compareFlightProfile.length) {
      items.push({
        crossing: this.compareFinishCrossing,
        profile: this.compareFlightProfile,
        className: 'finish-line-crossing--compare'
      })
    }

    const positioned = items
      .map(item => ({ ...item, y: this.crossingY(item.crossing, item.profile) }))
      .filter(item => item.y != null)

    if (positioned.length === 2) {
      // Upper track (smaller y) labels above, lower track labels below.
      positioned.sort((a, b) => a.y - b.y)
      this.drawCrossing(positioned[0], { labelAbove: true, up: 40, down: 25 })
      this.drawCrossing(positioned[1], { labelAbove: false, up: 25, down: 40 })
    } else {
      positioned.forEach(item =>
        this.drawCrossing(item, { labelAbove: true, up: 40, down: 25 })
      )
    }
  }

  crossingY(crossing, profile) {
    const prev = profile[crossing.index - 1]
    const curr = profile[crossing.index]
    if (!prev || !curr) return null

    return this.scaleY(prev.y + (curr.y - prev.y) * crossing.fraction)
  }

  drawCrossing({ crossing, profile, className }, { labelAbove, up, down }) {
    const { index, fraction, resultTime, label: resultLabel } = crossing
    const prev = profile[index - 1]
    const curr = profile[index]
    if (!prev || !curr) return

    const profileX = prev.x + (curr.x - prev.x) * fraction
    const profileY = prev.y + (curr.y - prev.y) * fraction
    const x = this.scaleX(profileX)
    const y = this.scaleY(profileY)

    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', className)
    if (!this.finishLineVisible) group.style.display = 'none'

    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute('x1', x)
    line.setAttribute('y1', y - up)
    line.setAttribute('x2', x)
    line.setAttribute('y2', y + down)
    line.setAttribute('stroke-dasharray', '6,3')
    group.appendChild(line)

    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('x', x)
    label.setAttribute('y', labelAbove ? y - up - 6 : y + down + 12)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', '11')
    label.setAttribute('font-weight', '600')
    label.textContent =
      resultLabel != null
        ? resultLabel
        : resultTime != null
          ? `${resultTime.toFixed(1)}s`
          : 'FINISH'
    group.appendChild(label)

    this.svg.appendChild(group)
  }

  drawFlares() {
    const mappedPoints = this.flightProfile.map(p => ({
      distance: p.x,
      altitude: p.altitude,
      vSpeed: p.vSpeed,
      hSpeed: p.hSpeed
    }))

    const flares = detectFlares(mappedPoints)
    if (!flares.length) return

    const startAltitude = this.points[0].altitude
    const scaleY = altitude => this.scaleY(startAltitude - altitude)

    drawFlares(this.svg, flares, this.scaleX, scaleY, 12, this.options.units)
  }

  setupInteraction() {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'side-projection-tooltip'
    this.tooltip.style.cssText = `
      position: absolute;
      display: none;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-size: 12px;
      pointer-events: none;
      z-index: 50;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `
    this.container.style.position = 'relative'
    this.container.appendChild(this.tooltip)

    const { padding } = this.options
    this.interactionOverlay = document.createElementNS(SVG_NS, 'rect')
    this.interactionOverlay.setAttribute('x', padding.left)
    this.interactionOverlay.setAttribute('y', padding.top)
    this.interactionOverlay.setAttribute('width', this.chartWidth)
    this.interactionOverlay.setAttribute('height', this.chartHeight)
    this.interactionOverlay.setAttribute('fill', 'transparent')
    this.interactionOverlay.style.cursor = 'crosshair'
    this.svg.appendChild(this.interactionOverlay)

    this.interactionOverlay.addEventListener('mousemove', e => this.handleInteraction(e))
    this.interactionOverlay.addEventListener('mouseleave', () =>
      this.handleInteractionEnd()
    )
    this.interactionOverlay.addEventListener(
      'touchstart',
      e => this.handleInteraction(e),
      { passive: true }
    )
    this.interactionOverlay.addEventListener(
      'touchmove',
      e => this.handleInteraction(e),
      { passive: true }
    )
    this.interactionOverlay.addEventListener('touchend', () =>
      this.handleInteractionEnd()
    )
  }

  handleInteraction(e) {
    const touch = e.touches?.[0]
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY

    const svgRect = this.svg.getBoundingClientRect()
    const svgX = ((clientX - svgRect.left) / svgRect.width) * this.width
    const svgY = ((clientY - svgRect.top) / svgRect.height) * this.height

    const { padding } = this.options
    const relX = svgX - padding.left
    const relY = svgY - padding.top

    const x = (relX / this.chartWidth) * this.maxScale
    const y = (relY / this.chartHeight) * this.maxScale

    const result = this.findClosestPoint(x, y)
    if (result) {
      this.showTooltip(result.point)
      this.showCrosshair(result.index)

      if (this.options.onPointHover) {
        this.options.onPointHover(result.index)
      }
    }
  }

  handleInteractionEnd() {
    this.hideTooltip()
  }

  findClosestPoint(x, _y) {
    let minDist = Infinity
    let closestIndex = -1
    let closestPoint = null

    for (let i = 0; i < this.flightProfile.length; i++) {
      const point = this.flightProfile[i]
      const dist = Math.abs(point.x - x)
      if (dist < minDist) {
        minDist = dist
        closestIndex = i
        closestPoint = point
      }
    }

    return closestIndex >= 0 ? { point: closestPoint, index: closestIndex } : null
  }

  showTooltip(point) {
    const terrainAlt = this.getTerrainAltitudeAt(point.x)
    const clearance = terrainAlt !== null ? Math.round(terrainAlt - point.y) : null

    if (this.compareFlightProfile.length) {
      this.tooltip.innerHTML = this.comparisonTooltipHtml(point, clearance)
    } else {
      const units = this.options.units
      const speed = value => Math.round(convertSpeed(value, units))
      const length = value => Math.round(convertLength(value, units))
      const speedU = speedUnitLabel(units)
      const lengthU = lengthUnitLabel(units)

      let clearanceHtml = ''
      if (clearance !== null) {
        let color = '#4CAF50'
        if (clearance <= 25) color = '#f44336'
        else if (clearance <= 100) color = '#FFC107'

        clearanceHtml = `<div><b>Clearance:</b> <span style="color: ${color}; font-weight: bold;">${length(clearance)} ${lengthU}</span></div>`
      }

      const timeFromExit = Math.round(point.flTime - this.primarySyncFlTime())

      this.tooltip.innerHTML = `
        <div><b>Time:</b> ${timeFromExit} s</div>
        <div><b>Distance:</b> ${length(point.x)} ${lengthU}</div>
        <div><b>Alt drop:</b> ${length(point.y)} ${lengthU}</div>
        <div><b>Altitude:</b> ${length(point.altitude)} ${lengthU}</div>
        <div><b>H speed:</b> ${speed(point.hSpeed)} ${speedU}</div>
        <div><b>V speed:</b> ${speed(point.vSpeed)} ${speedU}</div>
        <div><b>Glide:</b> ${point.glideRatio?.toFixed(2) ?? 'N/A'}</div>
        ${clearanceHtml}
      `
    }

    const svgRect = this.svg.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    const pointSvgX = this.scaleX(point.x)
    const pointSvgY = this.scaleY(point.y)

    const pointScreenX = (pointSvgX / this.width) * svgRect.width
    const pointScreenY = (pointSvgY / this.height) * svgRect.height

    const tooltipRect = this.tooltip.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 150
    const tooltipHeight = tooltipRect.height || 100

    const offset = this.compareFlightProfile.length ? 32 : 10

    let left = pointScreenX + offset
    let top = pointScreenY - tooltipHeight - offset

    if (left + tooltipWidth > containerRect.width) {
      left = pointScreenX - tooltipWidth - offset
    }

    if (top < 0) {
      top = 0
    }

    this.tooltip.style.left = `${left}px`
    this.tooltip.style.top = `${top}px`
    this.tooltip.style.display = 'block'
  }

  comparisonTooltipHtml(point, primaryClearance) {
    const comparePoint = this.interpolateCompareProfile(point.playerTime)

    const units = this.options.units
    const speed = value => convertSpeed(value, units)
    const length = value => convertLength(value, units)
    const speedU = speedUnitLabel(units)
    const lengthU = lengthUnitLabel(units)

    const fmt = value => (value == null || Number.isNaN(value) ? '—' : value)
    const num = (value, digits = 0) =>
      value == null || Number.isNaN(value) ? '—' : value.toFixed(digits)
    const lenCell = value =>
      value == null || Number.isNaN(value) ? '—' : Math.round(length(value))
    const speedCell = value =>
      value == null || Number.isNaN(value) ? '—' : Math.round(speed(value))

    const primaryExit = Math.round(point.flTime - this.primarySyncFlTime())
    const compareExit = comparePoint ? Math.round(comparePoint.exitTime) : null
    const compareClearance =
      comparePoint && this.terrainProfile?.length
        ? this.getTerrainAltitudeAt(comparePoint.x)
        : null
    const compareClearanceValue =
      compareClearance == null ? null : Math.round(compareClearance - comparePoint.y)

    const rows = [
      ['Time, s', primaryExit, fmt(compareExit), ''],
      [
        `Distance, ${lengthU}`,
        lenCell(point.x),
        comparePoint ? lenCell(comparePoint.x) : '—',
        ''
      ],
      [
        `Alt drop, ${lengthU}`,
        lenCell(point.y),
        comparePoint ? lenCell(comparePoint.y) : '—',
        ''
      ],
      [
        `Altitude, ${lengthU}`,
        lenCell(point.altitude),
        comparePoint ? lenCell(comparePoint.altitude) : '—',
        ''
      ],
      [
        `H speed, ${speedU}`,
        speedCell(point.hSpeed),
        comparePoint ? speedCell(comparePoint.hSpeed) : '—',
        comparePoint ? deltaCellHtml(speed(point.hSpeed), speed(comparePoint.hSpeed)) : ''
      ],
      [
        `V speed, ${speedU}`,
        speedCell(point.vSpeed),
        comparePoint ? speedCell(comparePoint.vSpeed) : '—',
        comparePoint ? deltaCellHtml(speed(point.vSpeed), speed(comparePoint.vSpeed)) : ''
      ],
      [
        'Glide',
        num(point.glideRatio, 2),
        comparePoint ? num(comparePoint.glideRatio, 2) : '—',
        comparePoint ? deltaCellHtml(point.glideRatio, comparePoint.glideRatio, 1) : ''
      ]
    ]

    if (primaryClearance !== null || compareClearanceValue !== null) {
      rows.push([
        `Clearance, ${lengthU}`,
        primaryClearance == null ? '—' : lenCell(primaryClearance),
        compareClearanceValue == null ? '—' : lenCell(compareClearanceValue),
        ''
      ])
    }

    const body = rows
      .map(
        ([label, a, b, d]) =>
          `<tr><th>${label}</th><td>${a}</td><td class="is-compare">${b}</td><td class="side-tt-delta-cell">${d}</td></tr>`
      )
      .join('')

    return `<table class="side-projection-tooltip-table">${body}</table>`
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none'
    }
  }

  createCrosshair() {
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
    this.crosshairMarker.setAttribute('r', '5')
    this.crosshairGroup.appendChild(this.crosshairMarker)

    if (this.compareFlightProfile.length) {
      this.compareCrosshairMarker = document.createElementNS(SVG_NS, 'circle')
      this.compareCrosshairMarker.setAttribute('class', 'crosshair-marker--compare')
      this.compareCrosshairMarker.setAttribute('r', '5')
      this.crosshairGroup.appendChild(this.compareCrosshairMarker)
    }

    this.svg.appendChild(this.crosshairGroup)
  }

  showCrosshair(index) {
    if (!this.crosshairGroup || index < 0 || index >= this.flightProfile.length) return

    const point = this.flightProfile[index]
    this.showCrosshairAtPosition(point.x, point.y, point.playerTime)
  }

  showCrosshairInterpolated(index, fraction) {
    if (!this.crosshairGroup || index < 0 || index >= this.flightProfile.length) return

    const curr = this.flightProfile[index]
    const next = this.flightProfile[Math.min(index + 1, this.flightProfile.length - 1)]

    const posX = curr.x + (next.x - curr.x) * fraction
    const posY = curr.y + (next.y - curr.y) * fraction
    const playerTime = curr.playerTime + (next.playerTime - curr.playerTime) * fraction

    this.showCrosshairAtPosition(posX, posY, playerTime)
  }

  showCrosshairAtPosition(posX, posY, playerTime) {
    const x = this.scaleX(posX)
    const y = this.scaleY(posY)
    const { padding } = this.options

    this.crosshairVLine.setAttribute('x1', x)
    this.crosshairVLine.setAttribute('y1', padding.top)
    this.crosshairVLine.setAttribute('x2', x)
    this.crosshairVLine.setAttribute('y2', this.height - padding.bottom)

    this.crosshairHLine.setAttribute('x1', padding.left)
    this.crosshairHLine.setAttribute('y1', y)
    this.crosshairHLine.setAttribute('x2', this.width - padding.right)
    this.crosshairHLine.setAttribute('y2', y)

    this.crosshairMarker.setAttribute('cx', x)
    this.crosshairMarker.setAttribute('cy', y)

    this.crosshairGroup.style.display = ''

    this.updateCompareCrosshairMarker(playerTime)
  }

  updateCompareCrosshairMarker(playerTime) {
    if (!this.compareCrosshairMarker) return

    const comparePoint =
      playerTime == null ? null : this.interpolateCompareProfile(playerTime)
    if (!comparePoint) {
      this.compareCrosshairMarker.style.display = 'none'
      return
    }

    this.compareCrosshairMarker.setAttribute('cx', this.scaleX(comparePoint.x))
    this.compareCrosshairMarker.setAttribute('cy', this.scaleY(comparePoint.y))
    this.compareCrosshairMarker.style.display = ''
  }

  hideCrosshair() {
    if (this.crosshairGroup) {
      this.crosshairGroup.style.display = 'none'
    }
  }

  destroy() {
    this.clear()
    this.points = []
    this.flightProfile = []
    this.compareRawPoints = null
    this.compareFlightProfile = []
  }
}
