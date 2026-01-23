const SVG_NS = 'http://www.w3.org/2000/svg'

export function detectFlares(points) {
  const flares = []
  let currentFlare = null

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]

    const prevDescending = prev.vSpeed > 0
    const currAscending = curr.vSpeed <= 0

    if (prevDescending && currAscending && !currentFlare) {
      const t = prev.vSpeed / (prev.vSpeed - curr.vSpeed)
      currentFlare = {
        startIndex: i,
        zeroCrossX: prev.distance + t * (curr.distance - prev.distance),
        zeroCrossAltitude: prev.altitude + t * (curr.altitude - prev.altitude),
        zeroCrossHSpeed: prev.hSpeed + t * (curr.hSpeed - prev.hSpeed),
        peakIndex: i,
        peakAltitude: curr.altitude,
        peakDistance: curr.distance
      }
    }

    if (currentFlare) {
      if (curr.altitude > currentFlare.peakAltitude) {
        currentFlare.peakIndex = i
        currentFlare.peakAltitude = curr.altitude
        currentFlare.peakDistance = curr.distance
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
    currentFlare.endIndex = points.length - 1
    flares.push(currentFlare)
  }

  return flares
}

export function drawFlares(svg, flares, scaleX, scaleY) {
  if (!flares.length) return

  const flareGroup = document.createElementNS(SVG_NS, 'g')
  flareGroup.setAttribute('class', 'flare-annotations')

  for (const flare of flares) {
    const altitudeGain = flare.peakAltitude - flare.zeroCrossAltitude
    if (altitudeGain < 1) continue

    const horizontalDist = flare.peakDistance - flare.zeroCrossX

    const zeroCrossSvgX = scaleX(flare.zeroCrossX)
    const zeroCrossSvgY = scaleY(flare.zeroCrossAltitude)
    const peakSvgX = scaleX(flare.peakDistance)
    const peakSvgY = scaleY(flare.peakAltitude)

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

    drawArrowHead(flareGroup, zeroCrossSvgX, hDimY, 'right', 'var(--red-80)')
    drawArrowHead(flareGroup, peakSvgX, hDimY, 'left', 'var(--red-80)')

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

    drawArrowHead(flareGroup, vDimX, zeroCrossSvgY, 'down', 'var(--red-80)')
    drawArrowHead(flareGroup, vDimX, peakSvgY, 'up', 'var(--red-80)')

    const vDimLabel = document.createElementNS(SVG_NS, 'text')
    vDimLabel.setAttribute('x', zeroCrossSvgX)
    vDimLabel.setAttribute('y', peakSvgY - 5)
    vDimLabel.setAttribute('text-anchor', 'middle')
    vDimLabel.setAttribute('font-size', '12')
    vDimLabel.setAttribute('fill', 'var(--red-80)')
    vDimLabel.textContent = `${Math.round(altitudeGain * 10) / 10} m`
    flareGroup.appendChild(vDimLabel)
  }

  svg.appendChild(flareGroup)
}

function drawArrowHead(group, x, y, direction, color) {
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
