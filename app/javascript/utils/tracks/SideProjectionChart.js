import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const SVG_NS = 'http://www.w3.org/2000/svg'

export default class SideProjectionChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      padding: { top: 0, right: 20, bottom: 40, left: 50 },
      ...options
    }
    this.points = []
    this.flightProfile = []
  }

  setFlightProfile(points) {
    this.points = points
    this.flightProfile = this.calculateFlightProfile(points)
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
    this.drawTrajectory()
    this.drawIntersectionPoint()
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

    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('class', 'intersection-marker')
    circle.setAttribute('cx', this.scaleX(intersection.x))
    circle.setAttribute('cy', this.scaleY(intersection.y))
    circle.setAttribute('r', '6')
    circle.setAttribute('fill', '#fff')
    circle.setAttribute('stroke', '#f00')
    circle.setAttribute('stroke-width', '2')
    this.svg.appendChild(circle)

    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('x', this.scaleX(intersection.x) + 10)
    label.setAttribute('y', this.scaleY(intersection.y) - 10)
    label.setAttribute('font-size', '11')
    label.setAttribute('fill', '#f00')
    label.textContent = `1:1 @ ${Math.round(intersection.x)}m`
    this.svg.appendChild(label)
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

    const hoverPath = document.createElementNS(SVG_NS, 'path')
    hoverPath.setAttribute('d', this.trajectoryPath.getAttribute('d'))
    hoverPath.setAttribute('fill', 'none')
    hoverPath.setAttribute('stroke', 'transparent')
    hoverPath.setAttribute('stroke-width', '20')
    hoverPath.style.cursor = 'crosshair'
    this.svg.appendChild(hoverPath)

    hoverPath.addEventListener('mousemove', e => this.handleMouseMove(e))
    hoverPath.addEventListener('mouseleave', () => this.hideTooltip())
  }

  handleMouseMove(e) {
    const rect = this.svg.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const { padding } = this.options
    const x = ((mouseX - padding.left) / this.chartWidth) * this.maxScale
    const y = ((mouseY - padding.top) / this.chartHeight) * this.maxScale

    const closest = this.findClosestPoint(x, y)
    if (closest) {
      this.showTooltip(closest, e.clientX, e.clientY)
    }
  }

  findClosestPoint(x, y) {
    let minDist = Infinity
    let closest = null

    for (const point of this.flightProfile) {
      const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2))
      if (dist < minDist) {
        minDist = dist
        closest = point
      }
    }

    return closest
  }

  showTooltip(point, clientX, clientY) {
    const containerRect = this.container.getBoundingClientRect()

    this.tooltip.innerHTML = `
      <div><b>Distance:</b> ${Math.round(point.x)} m</div>
      <div><b>Alt drop:</b> ${Math.round(point.y)} m</div>
      <div><b>Altitude:</b> ${Math.round(point.altitude)} m</div>
      <div><b>H speed:</b> ${Math.round(point.hSpeed)} km/h</div>
      <div><b>V speed:</b> ${Math.round(point.vSpeed)} km/h</div>
      <div><b>Glide:</b> ${point.glideRatio?.toFixed(2) ?? 'N/A'}</div>
    `

    const tooltipX = clientX - containerRect.left + 15
    const tooltipY = clientY - containerRect.top - 10

    this.tooltip.style.left = `${tooltipX}px`
    this.tooltip.style.top = `${tooltipY}px`
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
