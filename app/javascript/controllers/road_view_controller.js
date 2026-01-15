import { Controller } from '@hotwired/stimulus'

const LANE_WIDTH = 1200

const TOP_VIEW = {
  width: 200,
  height: 300,
  roadWidthNear: 180,
  roadWidthFar: 36,
  horizonY: 0,
  groundY: 280,
  vanishingPointX: 100
}

export default class extends Controller {
  static targets = [
    'color',
    'name',
    'position',
    'zones',
    'markers',
    'trajectory',
    'pilot',
    'altitude',
    'groundSpeed',
    'verticalSpeed',
    'glideRatio',
    'laneDeviation',
    'laneItem'
  ]

  connect() {
    this.renderZones()
  }

  setColor(color) {
    this.color = color
    this.colorTarget.style.backgroundColor = color
  }

  setName(name) {
    this.nameTarget.textContent = name
  }

  setPosition(position) {
    this.positionTarget.textContent = position
    this.positionTarget.setAttribute('data-position', position)
  }

  setResult(result) {
    this.positionTarget.textContent = result
    this.positionTarget.removeAttribute('data-position')
  }

  hidePosition() {
    this.positionTarget.textContent = '-'
    this.positionTarget.removeAttribute('data-position')
  }

  updateData({ altitude, groundSpeed, verticalSpeed, glideRatio, laneDeviation }) {
    this.altitudeTarget.textContent = altitude
    this.groundSpeedTarget.textContent = groundSpeed
    this.verticalSpeedTarget.textContent = verticalSpeed
    this.glideRatioTarget.textContent = glideRatio
    this.laneDeviationTarget.textContent = laneDeviation

    const absDeviation = Math.abs(laneDeviation)
    this.laneItemTarget.classList.remove('warning', 'danger', 'critical')

    if (absDeviation > 600) {
      this.laneItemTarget.classList.add('critical')
    } else if (absDeviation > 450) {
      this.laneItemTarget.classList.add('danger')
    } else if (absDeviation > 300) {
      this.laneItemTarget.classList.add('warning')
    }
  }

  renderMarkers(points, cameraDistance, windowStart, windowEnd) {
    this.markersTarget.innerHTML = ''

    const maxVisibleDistance = 600
    const altitudeStep = 250
    const altitudes = [windowStart]

    for (let alt = windowStart - altitudeStep; alt > windowEnd; alt -= altitudeStep) {
      altitudes.push(alt)
    }
    altitudes.push(windowEnd)

    altitudes.forEach((altitude, index) => {
      const pointAtAlt = points.find(p => Math.abs(p.altitude - altitude) < 20)
      if (!pointAtAlt) return

      const relativeDistance = pointAtAlt.distance - cameraDistance
      if (relativeDistance < 0 || relativeDistance > maxVisibleDistance) return

      const y = this.getTopViewY(relativeDistance)
      if (y < TOP_VIEW.horizonY) return

      const roadWidth = this.getRoadWidthAtY(y)
      const x1 = TOP_VIEW.vanishingPointX - roadWidth / 2
      const x2 = TOP_VIEW.vanishingPointX + roadWidth / 2

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', x1)
      line.setAttribute('y1', y)
      line.setAttribute('x2', x2)
      line.setAttribute('y2', y)

      if (index === 0) {
        line.setAttribute('stroke', '#06D6A0')
        line.setAttribute('stroke-width', '3')
      } else if (altitude === windowEnd) {
        line.setAttribute('stroke', '#EF476F')
        line.setAttribute('stroke-width', '3')
      } else {
        line.setAttribute('stroke', 'rgba(255,255,255,0.5)')
        line.setAttribute('stroke-width', '1')
      }
      this.markersTarget.appendChild(line)
    })
  }

  renderTrajectory(allPoints, cameraDistance, violation, visiblePoints) {
    this.trajectoryTarget.innerHTML = ''

    if (allPoints.length < 2) return

    const pathPoints = allPoints
      .map(p => {
        const relativeDistance = p.distance - cameraDistance
        if (relativeDistance < 0) return null

        const y = this.getTopViewY(relativeDistance)
        if (y < TOP_VIEW.horizonY || y > TOP_VIEW.groundY) return null

        const roadWidth = this.getRoadWidthAtY(y)
        const normalizedDeviation = (p.laneDeviation || 0) / LANE_WIDTH
        const x = TOP_VIEW.vanishingPointX + normalizedDeviation * roadWidth

        return { x, y }
      })
      .filter(Boolean)

    if (pathPoints.length < 2) return

    const pathData = pathPoints
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', this.color)
    path.setAttribute('stroke-width', '3')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    this.trajectoryTarget.appendChild(path)

    if (violation && visiblePoints.some(p => p.playerTime >= violation.playerTime)) {
      this.renderViolationMarker(violation, cameraDistance)
    }
  }

  renderPilot(markerPoint, futurePoint, cameraDistance) {
    this.pilotTarget.innerHTML = ''

    if (!markerPoint) return

    const relativeDistance = markerPoint.distance - cameraDistance
    if (relativeDistance < 0) return

    const y = this.getTopViewY(relativeDistance)
    if (y < TOP_VIEW.horizonY || y > TOP_VIEW.groundY) return

    const roadWidth = this.getRoadWidthAtY(y)
    const laneDeviation = markerPoint.laneDeviation || 0
    const normalizedDeviation = laneDeviation / LANE_WIDTH
    const x = TOP_VIEW.vanishingPointX + normalizedDeviation * roadWidth

    let rotation = 90
    if (futurePoint && markerPoint) {
      const dx = (futurePoint.laneDeviation || 0) - (markerPoint.laneDeviation || 0)
      const dy = futurePoint.distance - markerPoint.distance
      if (dy > 0.1 || Math.abs(dx) > 0.1) {
        const screenDx = (dx / LANE_WIDTH) * roadWidth
        const screenDy = -Math.abs(dy) * 0.5
        rotation = Math.atan2(screenDy, screenDx) * (180 / Math.PI) + 45
      }
    }

    const scale = (TOP_VIEW.groundY - y) / (TOP_VIEW.groundY - TOP_VIEW.horizonY)
    const iconSize = 20 + (1 - scale) * 12

    const pilot = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    pilot.setAttribute(
      'transform',
      `translate(${x}, ${y}) rotate(${rotation}) scale(${iconSize / 52})`
    )

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute(
      'd',
      'M51.353,0.914c-0.295-0.305-0.75-0.39-1.135-0.213L0.583,23.481c-0.399,0.184-0.632,0.605-0.574,1.041s0.393,0.782,0.826,0.854l22.263,3.731l2.545,21.038c0.054,0.438,0.389,0.791,0.824,0.865c0.057,0.01,0.113,0.015,0.169,0.015c0.375,0,0.726-0.211,0.896-0.556l24-48.415C51.72,1.675,51.648,1.218,51.353,0.914z'
    )
    path.setAttribute('fill', this.color)
    path.setAttribute('transform', 'translate(-26, -26)')

    pilot.appendChild(path)
    this.pilotTarget.appendChild(pilot)
  }

  renderViolationMarker(violation, cameraDistance) {
    const relativeDistance = violation.distance - cameraDistance
    if (relativeDistance < 0) return

    const y = this.getTopViewY(relativeDistance)
    if (y < TOP_VIEW.horizonY || y > TOP_VIEW.groundY) return

    const roadWidth = this.getRoadWidthAtY(y)
    const normalizedDeviation = violation.laneDeviation / LANE_WIDTH
    const x = TOP_VIEW.vanishingPointX + normalizedDeviation * roadWidth

    const cross = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const size = 6

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line1.setAttribute('x1', x - size)
    line1.setAttribute('y1', y - size)
    line1.setAttribute('x2', x + size)
    line1.setAttribute('y2', y + size)
    line1.setAttribute('stroke', '#DD1155')
    line1.setAttribute('stroke-width', '2')

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line2.setAttribute('x1', x + size)
    line2.setAttribute('y1', y - size)
    line2.setAttribute('x2', x - size)
    line2.setAttribute('y2', y + size)
    line2.setAttribute('stroke', '#DD1155')
    line2.setAttribute('stroke-width', '2')

    cross.appendChild(line1)
    cross.appendChild(line2)

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', x)
    label.setAttribute('y', y - 10)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('fill', '#DD1155')
    label.setAttribute('font-size', '10')
    label.setAttribute('font-weight', 'bold')
    label.textContent = `${Math.round(violation.penaltyDeviation)}m`

    this.trajectoryTarget.appendChild(cross)
    this.trajectoryTarget.appendChild(label)
  }

  renderZones() {
    const container = this.zonesTarget
    const { horizonY, groundY, roadWidthNear, roadWidthFar, vanishingPointX, width } =
      TOP_VIEW

    const skyGradient = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    skyGradient.innerHTML = `
      <linearGradient id="skyGradient-${this.element.id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#1e90ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#87ceeb;stop-opacity:1" />
      </linearGradient>
    `
    container.appendChild(skyGradient)

    const skyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    skyRect.setAttribute('x', 0)
    skyRect.setAttribute('y', 0)
    skyRect.setAttribute('width', width)
    skyRect.setAttribute('height', groundY)
    skyRect.setAttribute('fill', `url(#skyGradient-${this.element.id})`)
    container.appendChild(skyRect)

    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gridGroup.setAttribute('class', 'road-grid')

    for (let i = 1; i <= 8; i++) {
      const t = i / 8
      const y = groundY - t * (groundY - horizonY)
      const roadWidth = roadWidthNear - t * (roadWidthNear - roadWidthFar)
      const x1 = vanishingPointX - roadWidth / 2
      const x2 = vanishingPointX + roadWidth / 2

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', x1)
      line.setAttribute('y1', y)
      line.setAttribute('x2', x2)
      line.setAttribute('y2', y)
      line.setAttribute('stroke', 'rgba(255,255,255,0.3)')
      line.setAttribute('stroke-width', '1')
      gridGroup.appendChild(line)
    }

    const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    leftLine.setAttribute('x1', vanishingPointX - roadWidthNear / 2)
    leftLine.setAttribute('y1', groundY)
    leftLine.setAttribute('x2', vanishingPointX - roadWidthFar / 2)
    leftLine.setAttribute('y2', horizonY)
    leftLine.setAttribute('stroke', 'rgba(255,255,255,0.5)')
    leftLine.setAttribute('stroke-width', '2')
    gridGroup.appendChild(leftLine)

    const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    rightLine.setAttribute('x1', vanishingPointX + roadWidthNear / 2)
    rightLine.setAttribute('y1', groundY)
    rightLine.setAttribute('x2', vanishingPointX + roadWidthFar / 2)
    rightLine.setAttribute('y2', horizonY)
    rightLine.setAttribute('stroke', 'rgba(255,255,255,0.5)')
    rightLine.setAttribute('stroke-width', '2')
    gridGroup.appendChild(rightLine)

    container.appendChild(gridGroup)

    const createZone = (leftRatio, rightRatio, color) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

      const nearLeft = vanishingPointX - roadWidthNear / 2 + roadWidthNear * leftRatio
      const nearRight = vanishingPointX - roadWidthNear / 2 + roadWidthNear * rightRatio
      const farLeft = vanishingPointX - roadWidthFar / 2 + roadWidthFar * leftRatio
      const farRight = vanishingPointX - roadWidthFar / 2 + roadWidthFar * rightRatio

      path.setAttribute(
        'd',
        `M ${nearLeft} ${groundY} L ${farLeft} ${horizonY} L ${farRight} ${horizonY} L ${nearRight} ${groundY} Z`
      )
      path.setAttribute('fill', color)
      path.setAttribute('opacity', '0.6')
      return path
    }

    container.appendChild(createZone(0, 0.125, '#ff6b6b'))
    container.appendChild(createZone(0.125, 0.25, '#ffd93d'))
    container.appendChild(createZone(0.25, 0.75, '#06D6A0'))
    container.appendChild(createZone(0.75, 0.875, '#ffd93d'))
    container.appendChild(createZone(0.875, 1, '#ff6b6b'))

    const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    centerLine.setAttribute('x1', vanishingPointX)
    centerLine.setAttribute('y1', groundY)
    centerLine.setAttribute('x2', vanishingPointX)
    centerLine.setAttribute('y2', horizonY)
    centerLine.setAttribute('stroke', 'rgba(255,255,255,0.8)')
    centerLine.setAttribute('stroke-width', '2')
    centerLine.setAttribute('stroke-dasharray', '10,5')
    container.appendChild(centerLine)
  }

  getTopViewY(distance) {
    const maxViewDistance = 800
    const t = Math.min(1, Math.max(0, distance / maxViewDistance))
    return TOP_VIEW.groundY - t * (TOP_VIEW.groundY - TOP_VIEW.horizonY)
  }

  getRoadWidthAtY(y) {
    const t = (TOP_VIEW.groundY - y) / (TOP_VIEW.groundY - TOP_VIEW.horizonY)
    return TOP_VIEW.roadWidthNear - t * (TOP_VIEW.roadWidthNear - TOP_VIEW.roadWidthFar)
  }
}
