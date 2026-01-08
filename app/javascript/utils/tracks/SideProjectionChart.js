import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const SVG_NS = 'http://www.w3.org/2000/svg'

export default class SideProjectionChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      padding: { top: 0, right: 20, bottom: 40, left: 50 },
      onPointHover: null,
      ...options
    }
    this.points = []
    this.flightProfile = []
    this.terrainProfile = null
  }

  setFlightProfile(points) {
    this.points = points
    this.flightProfile = this.calculateFlightProfile(points)
    return this
  }

  setTerrainProfile(measurements) {
    this.terrainProfile = measurements
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
        gpsTime: point.gpsTime
      }
    })
  }

  calculateDistance(first, second) {
    const firstPosition = new LatLon(first.latitude, first.longitude)
    const secondPosition = new LatLon(second.latitude, second.longitude)
    return firstPosition.distanceTo(secondPosition)
  }

  findIntersectionPoint() {
    const minAltitudeDrop = 15

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
    this.calculateDimensions()
    this.createSvg()
    this.drawGrid()
    this.drawReferenceLine()
    this.drawTerrainProfile()
    this.drawTerrainClearance()
    this.drawTrajectory()
    this.drawIntersectionPoint()
    this.drawFlares()
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

    const maxX = Math.max(...this.flightProfile.map(p => p.x))
    const maxY = Math.max(...this.flightProfile.map(p => p.y))
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

    let labelIndex = 0
    for (let value = 0; value <= this.maxScale; value += gridInterval) {
      const x = this.scaleX(value)
      const y = this.scaleY(value)
      const isOddLabel = labelIndex % 2 === 1

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

      const xLabel = document.createElementNS(SVG_NS, 'text')
      xLabel.setAttribute('x', x)
      xLabel.setAttribute('y', this.height - this.options.padding.bottom + 15)
      xLabel.setAttribute('text-anchor', 'middle')
      xLabel.setAttribute('font-size', '11')
      xLabel.setAttribute('fill', '#666')
      if (isOddLabel) xLabel.setAttribute('class', 'grid-label-odd')
      xLabel.textContent = value
      gridGroup.appendChild(xLabel)

      const yLabel = document.createElementNS(SVG_NS, 'text')
      yLabel.setAttribute('x', this.options.padding.left - 8)
      yLabel.setAttribute('y', y + 4)
      yLabel.setAttribute('text-anchor', 'end')
      yLabel.setAttribute('font-size', '11')
      yLabel.setAttribute('fill', '#666')
      if (isOddLabel) yLabel.setAttribute('class', 'grid-label-odd')
      yLabel.textContent = value
      gridGroup.appendChild(yLabel)

      labelIndex++
    }

    const xAxisLabel = document.createElementNS(SVG_NS, 'text')
    xAxisLabel.setAttribute('x', this.width / 2)
    xAxisLabel.setAttribute('y', this.height - 5)
    xAxisLabel.setAttribute('text-anchor', 'middle')
    xAxisLabel.setAttribute('font-size', '12')
    xAxisLabel.setAttribute('fill', '#333')
    xAxisLabel.textContent = 'Distance (m)'
    gridGroup.appendChild(xAxisLabel)

    const yAxisLabel = document.createElementNS(SVG_NS, 'text')
    yAxisLabel.setAttribute('x', 12)
    yAxisLabel.setAttribute('y', this.height / 2)
    yAxisLabel.setAttribute('text-anchor', 'middle')
    yAxisLabel.setAttribute('font-size', '12')
    yAxisLabel.setAttribute('fill', '#333')
    yAxisLabel.setAttribute('transform', `rotate(-90, 12, ${this.height / 2})`)
    yAxisLabel.textContent = 'Altitude drop (m)'
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
    label.textContent = `1:1 ${Math.round(intersection.x)}m`
    this.svg.appendChild(label)
  }

  detectFlares() {
    const flares = []
    let currentFlare = null

    for (let i = 1; i < this.flightProfile.length; i++) {
      const prev = this.flightProfile[i - 1]
      const curr = this.flightProfile[i]

      const prevDescending = prev.vSpeed > 0
      const currAscending = curr.vSpeed <= 0

      if (prevDescending && currAscending && !currentFlare) {
        const t = prev.vSpeed / (prev.vSpeed - curr.vSpeed)
        currentFlare = {
          startIndex: i,
          zeroCrossX: prev.x + t * (curr.x - prev.x),
          zeroCrossY: prev.y + t * (curr.y - prev.y),
          zeroCrossHSpeed: prev.hSpeed + t * (curr.hSpeed - prev.hSpeed),
          peakIndex: i,
          peakAltitude: curr.altitude
        }
      }

      if (currentFlare) {
        if (curr.altitude > currentFlare.peakAltitude) {
          currentFlare.peakIndex = i
          currentFlare.peakAltitude = curr.altitude
        }

        const currDescending = curr.vSpeed > 0
        if (currDescending) {
          currentFlare.endIndex = i
          if (currentFlare.zeroCrossHSpeed >= 100) {
            flares.push(currentFlare)
          }
          currentFlare = null
        }
      }
    }

    if (currentFlare && currentFlare.zeroCrossHSpeed >= 100) {
      currentFlare.endIndex = this.flightProfile.length - 1
      flares.push(currentFlare)
    }

    return flares
  }

  drawFlares() {
    const flares = this.detectFlares()
    if (!flares.length) return

    const flareGroup = document.createElementNS(SVG_NS, 'g')
    flareGroup.setAttribute('class', 'flare-annotations')

    for (const flare of flares) {
      const zeroCross = {
        x: flare.zeroCrossX,
        y: flare.zeroCrossY
      }
      const peak = this.flightProfile[flare.peakIndex]

      const altitudeGain = peak.altitude - (this.points[0].altitude - zeroCross.y)
      if (altitudeGain < 1) continue

      const horizontalDist = peak.x - zeroCross.x

      const zeroCrossSvgX = this.scaleX(zeroCross.x)
      const zeroCrossSvgY = this.scaleY(zeroCross.y)
      const peakSvgX = this.scaleX(peak.x)
      const peakSvgY = this.scaleY(peak.y)

      const dimOffset = 15
      const hDimY = Math.max(zeroCrossSvgY, peakSvgY) + dimOffset
      const vDimX = Math.min(zeroCrossSvgX, peakSvgX)

      const peakMarker = document.createElementNS(SVG_NS, 'circle')
      peakMarker.setAttribute('cx', peakSvgX)
      peakMarker.setAttribute('cy', peakSvgY)
      peakMarker.setAttribute('r', '1')
      peakMarker.setAttribute('fill', 'var(--red-80)')
      peakMarker.setAttribute('stroke', 'var(--red-80)')
      peakMarker.setAttribute('stroke-width', '2')
      flareGroup.appendChild(peakMarker)

      const hDimLine = document.createElementNS(SVG_NS, 'line')
      hDimLine.setAttribute('x1', zeroCrossSvgX)
      hDimLine.setAttribute('y1', hDimY)
      hDimLine.setAttribute('x2', peakSvgX)
      hDimLine.setAttribute('y2', hDimY)
      hDimLine.setAttribute('stroke', 'var(--red-80)')
      hDimLine.setAttribute('stroke-width', '1')
      flareGroup.appendChild(hDimLine)

      const hExtLine1 = document.createElementNS(SVG_NS, 'line')
      hExtLine1.setAttribute('x1', zeroCrossSvgX)
      hExtLine1.setAttribute('y1', zeroCrossSvgY)
      hExtLine1.setAttribute('x2', zeroCrossSvgX)
      hExtLine1.setAttribute('y2', hDimY + 5)
      hExtLine1.setAttribute('stroke', 'var(--red-80)')
      hExtLine1.setAttribute('stroke-width', '1')
      hExtLine1.setAttribute('stroke-dasharray', '2,2')
      flareGroup.appendChild(hExtLine1)

      const hExtLine2 = document.createElementNS(SVG_NS, 'line')
      hExtLine2.setAttribute('x1', peakSvgX)
      hExtLine2.setAttribute('y1', peakSvgY)
      hExtLine2.setAttribute('x2', peakSvgX)
      hExtLine2.setAttribute('y2', hDimY + 5)
      hExtLine2.setAttribute('stroke', 'var(--red-80)')
      hExtLine2.setAttribute('stroke-width', '1')
      hExtLine2.setAttribute('stroke-dasharray', '2,2')
      flareGroup.appendChild(hExtLine2)

      this.drawArrowHead(flareGroup, zeroCrossSvgX, hDimY, 'right', 'var(--red-80)')
      this.drawArrowHead(flareGroup, peakSvgX, hDimY, 'left', 'var(--red-80)')

      const hDimLabel = document.createElementNS(SVG_NS, 'text')
      hDimLabel.setAttribute('x', (zeroCrossSvgX + peakSvgX) / 2)
      hDimLabel.setAttribute('y', hDimY + 12)
      hDimLabel.setAttribute('text-anchor', 'middle')
      hDimLabel.setAttribute('font-size', '10')
      hDimLabel.setAttribute('fill', 'var(--red-80)')
      hDimLabel.textContent = `${Math.round(horizontalDist)} m`
      flareGroup.appendChild(hDimLabel)

      const hSpeedExtLine = document.createElementNS(SVG_NS, 'line')
      hSpeedExtLine.setAttribute('x1', zeroCrossSvgX)
      hSpeedExtLine.setAttribute('y1', zeroCrossSvgY)
      hSpeedExtLine.setAttribute('x2', zeroCrossSvgX - 10)
      hSpeedExtLine.setAttribute('y2', hDimY - 4)
      hSpeedExtLine.setAttribute('stroke', 'var(--red-80)')
      hSpeedExtLine.setAttribute('stroke-width', '1')
      hSpeedExtLine.setAttribute('stroke-dasharray', '2,2')
      flareGroup.appendChild(hSpeedExtLine)

      const hSpeedLabel = document.createElementNS(SVG_NS, 'text')
      hSpeedLabel.setAttribute('x', zeroCrossSvgX - 10)
      hSpeedLabel.setAttribute('y', hDimY)
      hSpeedLabel.setAttribute('text-anchor', 'end')
      hSpeedLabel.setAttribute('font-size', '10')
      hSpeedLabel.setAttribute('fill', 'var(--red-80)')
      hSpeedLabel.textContent = `${Math.round(flare.zeroCrossHSpeed)} km/h`
      flareGroup.appendChild(hSpeedLabel)

      const vDimLine = document.createElementNS(SVG_NS, 'line')
      vDimLine.setAttribute('x1', vDimX)
      vDimLine.setAttribute('y1', zeroCrossSvgY)
      vDimLine.setAttribute('x2', vDimX)
      vDimLine.setAttribute('y2', peakSvgY)
      vDimLine.setAttribute('stroke', 'var(--red-80)')
      vDimLine.setAttribute('stroke-width', '1')
      flareGroup.appendChild(vDimLine)

      const vExtLine1 = document.createElementNS(SVG_NS, 'line')
      vExtLine1.setAttribute('x1', zeroCrossSvgX + 5)
      vExtLine1.setAttribute('y1', zeroCrossSvgY)
      vExtLine1.setAttribute('x2', vDimX - 5)
      vExtLine1.setAttribute('y2', zeroCrossSvgY)
      vExtLine1.setAttribute('stroke', 'var(--red-80)')
      vExtLine1.setAttribute('stroke-width', '1')
      vExtLine1.setAttribute('stroke-dasharray', '2,2')
      flareGroup.appendChild(vExtLine1)

      const vExtLine2 = document.createElementNS(SVG_NS, 'line')
      vExtLine2.setAttribute('x1', peakSvgX)
      vExtLine2.setAttribute('y1', peakSvgY)
      vExtLine2.setAttribute('x2', vDimX - 5)
      vExtLine2.setAttribute('y2', peakSvgY)
      vExtLine2.setAttribute('stroke', 'var(--red-80)')
      vExtLine2.setAttribute('stroke-width', '1')
      vExtLine2.setAttribute('stroke-dasharray', '2,2')
      flareGroup.appendChild(vExtLine2)

      this.drawArrowHead(flareGroup, vDimX, zeroCrossSvgY, 'down', 'var(--red-80)')
      this.drawArrowHead(flareGroup, vDimX, peakSvgY, 'up', 'var(--red-80)')

      const altGainFromProfile = zeroCross.y - peak.y
      const vDimLabel = document.createElementNS(SVG_NS, 'text')
      vDimLabel.setAttribute('x', zeroCrossSvgX)
      vDimLabel.setAttribute('y', peakSvgY - 5)
      vDimLabel.setAttribute('text-anchor', 'middle')
      vDimLabel.setAttribute('font-size', '12')
      vDimLabel.setAttribute('fill', 'var(--red-80)')
      vDimLabel.textContent = `${Math.round(altGainFromProfile * 10) / 10} m`
      flareGroup.appendChild(vDimLabel)
    }

    this.svg.appendChild(flareGroup)
  }

  drawArrowHead(group, x, y, direction, color) {
    const size = 3
    const arrow = document.createElementNS(SVG_NS, 'path')
    let d

    switch (direction) {
      case 'right':
        d = `M ${x} ${y} L ${x + size} ${y - size} L ${x + size} ${y + size} Z`
        break
      case 'left':
        d = `M ${x} ${y} L ${x - size} ${y - size} L ${x - size} ${y + size} Z`
        break
      case 'up':
        d = `M ${x} ${y} L ${x - size} ${y + size} L ${x + size} ${y + size} Z`
        break
      case 'down':
        d = `M ${x} ${y} L ${x - size} ${y - size} L ${x + size} ${y - size} Z`
        break
    }

    arrow.setAttribute('d', d)
    arrow.setAttribute('fill', color)
    group.appendChild(arrow)
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
      z-index: 100;
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

    let clearanceHtml = ''
    if (clearance !== null) {
      let color = '#4CAF50'
      if (clearance <= 25) color = '#f44336'
      else if (clearance <= 100) color = '#FFC107'

      clearanceHtml = `<div><b>Clearance:</b> <span style="color: ${color}; font-weight: bold;">${clearance} m</span></div>`
    }

    this.tooltip.innerHTML = `
      <div><b>Distance:</b> ${Math.round(point.x)} m</div>
      <div><b>Alt drop:</b> ${Math.round(point.y)} m</div>
      <div><b>Altitude:</b> ${Math.round(point.altitude)} m</div>
      <div><b>H speed:</b> ${Math.round(point.hSpeed)} km/h</div>
      <div><b>V speed:</b> ${Math.round(point.vSpeed)} km/h</div>
      <div><b>Glide:</b> ${point.glideRatio?.toFixed(2) ?? 'N/A'}</div>
      ${clearanceHtml}
    `

    const svgRect = this.svg.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    const pointSvgX = this.scaleX(point.x)
    const pointSvgY = this.scaleY(point.y)

    const pointScreenX = (pointSvgX / this.width) * svgRect.width
    const pointScreenY = (pointSvgY / this.height) * svgRect.height

    const tooltipRect = this.tooltip.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 150
    const tooltipHeight = tooltipRect.height || 100

    const offsetX = 10
    const offsetY = 10

    let left = pointScreenX + offsetX
    let top = pointScreenY - tooltipHeight - offsetY

    if (left + tooltipWidth > containerRect.width) {
      left = pointScreenX - tooltipWidth - offsetX
    }

    if (top < 0) {
      top = 0
    }

    this.tooltip.style.left = `${left}px`
    this.tooltip.style.top = `${top}px`
    this.tooltip.style.display = 'block'
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

    this.svg.appendChild(this.crosshairGroup)
  }

  showCrosshair(index) {
    if (!this.crosshairGroup || index < 0 || index >= this.flightProfile.length) return

    const point = this.flightProfile[index]
    this.showCrosshairAtPosition(point.x, point.y)
  }

  showCrosshairInterpolated(index, fraction) {
    if (!this.crosshairGroup || index < 0 || index >= this.flightProfile.length) return

    const curr = this.flightProfile[index]
    const next = this.flightProfile[Math.min(index + 1, this.flightProfile.length - 1)]

    const posX = curr.x + (next.x - curr.x) * fraction
    const posY = curr.y + (next.y - curr.y) * fraction

    this.showCrosshairAtPosition(posX, posY)
  }

  showCrosshairAtPosition(posX, posY) {
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
  }
}
