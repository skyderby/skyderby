const SVG_NS = 'http://www.w3.org/2000/svg'

const PALETTE = [
  '--blue-70',
  '--green-80',
  '--orange-70',
  '--purple-70',
  '--cyan-70',
  '--pink-70',
  '--indigo-70',
  '--red-70',
  '--yellow-80',
  '--blue-gray-60'
]

const TERRAIN_COLOR = '#b88e8d'
const GRID_STEP = 100
const LABEL_STEP = 500
const TERRAIN_HEIGHT = 150
const TERRAIN_MAX = 125
const TERRAIN_TICK = 25
const TERRAIN_DANGER = 5
const SAMPLE_LIMIT = 2000
const FLIP_THRESHOLD = 0.6
const MAX_ZOOM = 50
const DRAW_MS = 600
const EMPTY_CELL_PX = 56

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const capturePointer = (element, pointerId) => {
  try {
    element.setPointerCapture(pointerId)
  } catch {
    return false
  }
  return true
}

const releasePointer = (element, pointerId) => {
  try {
    element.releasePointerCapture(pointerId)
  } catch {
    return false
  }
  return true
}

const el = (tag, className) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  return node
}

const svgEl = (width, height, className) => {
  const node = document.createElementNS(SVG_NS, 'svg')
  node.setAttribute('width', width)
  node.setAttribute('height', height)
  node.setAttribute('viewBox', `0 0 ${width} ${height}`)
  if (className) node.classList.add(className)
  return node
}

export default class FlightProfileChart {
  constructor({ profileHost, terrainHost, formatters = {}, labels = {} }) {
    this.profileHost = profileHost
    this.terrainHost = terrainHost
    this.formatProfile = formatters.profile || (() => '')
    this.formatClearance = formatters.clearance || (() => '')
    this.formatTerrain = formatters.terrain || (() => '')
    this.formatZoomTo =
      labels.zoomTo || (meters => `Zoom to first ${Math.round(meters)} m`)
    this.resetZoomLabel = labels.resetZoom || 'Reset zoom'

    this.tracks = new Map()
    this.terrain = null
    this.colorSeq = 0
    this.drawn = new Set()
    this.animating = new Map()
    this.drawnClearance = new Set()
    this.animatingClearance = new Map()
    this.width = 0
    this.height = 0
    this.baseScale = 1
    this.scale = 1
    this.zoom = 1

    this.pointers = new Map()
    this.selecting = false
    this.selectStartX = 0
    this.selectMoved = false
    this.pinchStartDist = 0
    this.pinchStartZoom = 1

    this.buildDom()

    this.hosts = [this.profileHost, this.terrainHost]
    this.hosts.forEach(host => {
      host.addEventListener('pointerdown', this.onPointerDown)
      host.addEventListener('pointermove', this.onPointerMove)
      host.addEventListener('pointerup', this.onPointerUp)
      host.addEventListener('pointercancel', this.onPointerUp)
      host.addEventListener('pointerleave', this.onPointerLeave)
    })
  }

  buildDom() {
    this.profileHost.classList.add('fp-chart')
    this.terrainHost.classList.add('fp-chart')

    this.profileCursor = el('div', 'fp-cursor')
    this.profileCursor.hidden = true
    this.terrainCursor = el('div', 'fp-cursor')
    this.terrainCursor.hidden = true

    this.profileTip = el('div', 'fp-tooltip')
    this.profileTip.hidden = true
    this.terrainTip = el('div', 'fp-tooltip')
    this.terrainTip.hidden = true

    this.profileSelection = el('div', 'fp-selection')
    this.profileSelection.hidden = true
    this.selectionLabel = el('span', 'fp-selection__label')
    this.profileSelection.appendChild(this.selectionLabel)
    this.terrainSelection = el('div', 'fp-selection')
    this.terrainSelection.hidden = true

    this.resetZoomButton = el('button', 'button fp-reset-zoom')
    this.resetZoomButton.type = 'button'
    this.resetZoomButton.hidden = true
    this.resetZoomButton.textContent = this.resetZoomLabel
    this.resetZoomButton.addEventListener('pointerdown', this.onResetPointerDown)
    this.resetZoomButton.addEventListener('click', this.onResetZoom)

    this.profileHost.append(
      this.profileCursor,
      this.profileSelection,
      this.resetZoomButton,
      this.profileTip
    )
    this.terrainHost.append(this.terrainCursor, this.terrainSelection, this.terrainTip)
  }

  destroy() {
    this.hosts.forEach(host => {
      host.removeEventListener('pointerdown', this.onPointerDown)
      host.removeEventListener('pointermove', this.onPointerMove)
      host.removeEventListener('pointerup', this.onPointerUp)
      host.removeEventListener('pointercancel', this.onPointerUp)
      host.removeEventListener('pointerleave', this.onPointerLeave)
    })
    this.resetZoomButton.removeEventListener('pointerdown', this.onResetPointerDown)
    this.resetZoomButton.removeEventListener('click', this.onResetZoom)
    ;[
      this.profileCursor,
      this.terrainCursor,
      this.profileTip,
      this.terrainTip,
      this.profileSelection,
      this.terrainSelection,
      this.resetZoomButton,
      this.profileSvg,
      this.terrainSvg
    ].forEach(node => node?.remove())

    this.profileHost.classList.remove('fp-chart')
    this.terrainHost.classList.remove('fp-chart')
  }

  setTrack(id, { name, profile }) {
    const existing = this.tracks.get(id)
    const colorVar = existing
      ? existing.colorVar
      : PALETTE[this.colorSeq++ % PALETTE.length]
    this.tracks.set(id, {
      name,
      colorVar,
      profile: profile || [],
      clearance: existing ? existing.clearance : null
    })
    this.render()
  }

  setClearance(id, clearance) {
    const track = this.tracks.get(id)
    if (!track) return
    track.clearance = clearance
    this.drawnClearance.delete(id)
    this.animatingClearance.delete(id)
    this.render()
  }

  removeTrack(id) {
    this.tracks.delete(id)
    this.drawn.delete(id)
    this.animating.delete(id)
    this.drawnClearance.delete(id)
    this.animatingClearance.delete(id)
    this.render()
  }

  colorVarFor(id) {
    return this.tracks.get(id)?.colorVar
  }

  setTerrain({ name, measurements }) {
    const list = measurements || []
    const points = list
      .map(m => ({ x: m.distance, y: m.altitude }))
      .sort((a, b) => a.x - b.x)
    this.terrain = { name, measurements: list, points }
    this.render()
  }

  clearTerrain() {
    this.terrain = null
    this.render()
  }

  resize() {
    this.render()
  }

  computeBounds() {
    let xMax = 1
    let yMax = 1

    this.tracks.forEach(({ profile }) => {
      profile.forEach(point => {
        if (point.x > xMax) xMax = point.x
        if (point.y > yMax) yMax = point.y
      })
    })

    if (this.terrain) {
      this.terrain.measurements.forEach(({ distance, altitude }) => {
        if (distance > xMax) xMax = distance
        if (altitude > yMax) yMax = altitude
      })
    }

    this.xMax = xMax
    this.yMax = yMax
  }

  measure() {
    const rect = this.profileHost.getBoundingClientRect()
    this.width = Math.max(0, Math.floor(rect.width))
    this.height = Math.max(0, Math.floor(rect.height))
  }

  render() {
    this.measure()
    this.computeBounds()
    if (this.width <= 0 || this.height <= 0) return

    if (this.tracks.size === 0 && !this.terrain) {
      this.zoom = 1
      this.baseScale = EMPTY_CELL_PX / GRID_STEP
      this.scale = this.baseScale
    } else {
      this.baseScale = Math.min(this.width / this.xMax, this.height / this.yMax)
      this.scale = this.baseScale * this.zoom
    }

    this.renderProfile()
    this.renderTerrain()
    this.resetZoomButton.hidden = this.zoom <= 1
  }

  x(distance) {
    return distance * this.scale
  }

  yProfile(drop) {
    return drop * this.scale
  }

  yTerrain(clearance) {
    return TERRAIN_HEIGHT * (1 - clamp(clearance, 0, TERRAIN_MAX) / TERRAIN_MAX)
  }

  linePath(points, xAccessor, yAccessor) {
    const sampled = this.downsample(points)
    if (sampled.length < 2) return ''
    let d = `M${xAccessor(sampled[0]).toFixed(1)} ${yAccessor(sampled[0]).toFixed(1)}`
    for (let i = 1; i < sampled.length; i++) {
      d += ` L${xAccessor(sampled[i]).toFixed(1)} ${yAccessor(sampled[i]).toFixed(1)}`
    }
    return d
  }

  downsample(points) {
    if (points.length <= SAMPLE_LIMIT) return points
    const step = Math.ceil(points.length / SAMPLE_LIMIT)
    return points.filter((_, i) => i % step === 0 || i === points.length - 1)
  }

  gridSvg() {
    const { width, height } = this
    let grid = ''
    for (let m = GRID_STEP; this.x(m) <= width; m += GRID_STEP) {
      const px = this.x(m)
      grid += `<line class="fp-grid" x1="${px.toFixed(1)}" y1="0" x2="${px.toFixed(1)}" y2="${height}"/>`
    }
    for (let m = GRID_STEP; this.yProfile(m) <= height; m += GRID_STEP) {
      const py = this.yProfile(m)
      grid += `<line class="fp-grid" x1="0" y1="${py.toFixed(1)}" x2="${width}" y2="${py.toFixed(1)}"/>`
    }
    return grid
  }

  labelsSvg() {
    const { width, height } = this
    let labels = ''
    for (let m = LABEL_STEP; this.x(m) <= width; m += LABEL_STEP) {
      const px = this.x(m)
      labels += `<text class="fp-axis-label" x="${(px + 3).toFixed(1)}" y="12">${m}</text>`
    }
    for (let m = LABEL_STEP; this.yProfile(m) <= height; m += LABEL_STEP) {
      const py = this.yProfile(m)
      labels += `<text class="fp-axis-label" x="3" y="${(py - 3).toFixed(1)}">${m}</text>`
    }
    return labels
  }

  terrainProfileSvg() {
    if (!this.terrain || this.terrain.measurements.length < 2) return ''

    const measurements = this.terrain.measurements
    const maxAltitude = measurements.reduce((max, m) => Math.max(max, m.altitude), 0)
    const groundY = this.yProfile(maxAltitude)
    const line = this.linePath(
      measurements,
      m => this.x(m.distance),
      m => this.yProfile(m.altitude)
    )
    if (!line) return ''

    const last = measurements[measurements.length - 1]
    const first = measurements[0]
    const area =
      `${line} L${this.x(last.distance).toFixed(1)} ${groundY.toFixed(1)}` +
      ` L${this.x(first.distance).toFixed(1)} ${groundY.toFixed(1)} Z`

    return (
      `<path class="fp-terrain-area" d="${area}"/>` +
      `<path class="fp-terrain-line" d="${line}"/>`
    )
  }

  ratioLineSvg() {
    const d = Math.min(this.width, this.height)
    return `<line class="fp-ratio-line" x1="0" y1="0" x2="${d}" y2="${d}"/>`
  }

  renderProfile() {
    const svg = svgEl(this.width, this.height, 'fp-svg')

    let markup = this.gridSvg()
    markup += this.ratioLineSvg()
    markup += this.terrainProfileSvg()

    this.tracks.forEach(({ profile, colorVar }, id) => {
      const d = this.linePath(
        profile,
        p => this.x(p.x),
        p => this.yProfile(p.y)
      )
      if (d) {
        markup += `<path class="fp-series" data-track="${id}" style="stroke: var(${colorVar})" d="${d}"/>`
      }
    })

    markup += this.labelsSvg()
    markup += '<g class="fp-markers"></g>'
    svg.innerHTML = markup

    if (this.profileSvg) this.profileSvg.replaceWith(svg)
    else this.profileHost.prepend(svg)
    this.profileSvg = svg
    this.profileMarkers = svg.querySelector('.fp-markers')

    this.animatePaths(svg, '.fp-series', this.drawn, this.animating)
  }

  animatePaths(svg, selector, drawnSet, animatingSet) {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const now = typeof performance !== 'undefined' ? performance.now() : 0

    this.tracks.forEach((_track, id) => {
      if (drawnSet.has(id)) return

      const paths = svg.querySelectorAll(`${selector}[data-track="${id}"]`)
      if (!paths.length) return

      if (reduceMotion) {
        drawnSet.add(id)
        return
      }

      const started = animatingSet.get(id) ?? now
      if (!animatingSet.has(id)) animatingSet.set(id, started)

      const elapsed = now - started
      if (elapsed >= DRAW_MS) {
        drawnSet.add(id)
        animatingSet.delete(id)
        return
      }

      const progress = elapsed / DRAW_MS
      paths.forEach(path => {
        const length = path.getTotalLength()
        if (!length) return
        path.style.strokeDasharray = `${length}`
        const animation = path.animate(
          [{ strokeDashoffset: length * (1 - progress) }, { strokeDashoffset: 0 }],
          { duration: DRAW_MS - elapsed, easing: 'ease-out', fill: 'forwards' }
        )
        animation.onfinish = () => {
          drawnSet.add(id)
          animatingSet.delete(id)
        }
      })
    })
  }

  terrainBandsSvg() {
    const width = this.width
    const dangerTop = this.yTerrain(TERRAIN_TICK)
    const safeBottom = this.yTerrain(TERRAIN_MAX - TERRAIN_TICK)
    let bands = `<rect class="fp-band-danger" x="0" y="${dangerTop.toFixed(1)}" width="${width}" height="${(TERRAIN_HEIGHT - dangerTop).toFixed(1)}"/>`
    bands += `<rect class="fp-band-safe" x="0" y="0" width="${width}" height="${safeBottom.toFixed(1)}"/>`
    for (let c = TERRAIN_TICK; c < TERRAIN_MAX; c += TERRAIN_TICK) {
      const py = this.yTerrain(c)
      bands += `<line class="fp-grid" x1="0" y1="${py.toFixed(1)}" x2="${width}" y2="${py.toFixed(1)}"/>`
    }
    return bands
  }

  clearanceSvg(id, points, colorVar) {
    const segments = []
    let current = null

    this.downsample(points).forEach(point => {
      const command = `${current ? 'L' : 'M'}${this.x(point.x).toFixed(1)} ${this.yTerrain(point.y).toFixed(1)}`
      const danger = point.y <= TERRAIN_DANGER

      if (current && current.danger !== danger) {
        current.d += ` ${command.replace('M', 'L')}`
        current = null
      }

      if (!current) {
        current = { danger, d: command.replace('L', 'M') }
        segments.push(current)
      } else {
        current.d += ` ${command}`
      }
    })

    return segments
      .map(segment =>
        segment.danger
          ? `<path class="fp-clearance fp-clearance--danger" data-track="${id}" d="${segment.d}"/>`
          : `<path class="fp-clearance" data-track="${id}" style="stroke: var(${colorVar})" d="${segment.d}"/>`
      )
      .join('')
  }

  renderTerrain() {
    const svg = svgEl(this.width, TERRAIN_HEIGHT, 'fp-svg')
    let markup = this.terrainBandsSvg()

    this.tracks.forEach(({ clearance, colorVar }, id) => {
      if (clearance && clearance.length > 1) {
        markup += this.clearanceSvg(id, clearance, colorVar)
      }
    })

    markup += '<g class="fp-markers"></g>'
    svg.innerHTML = markup

    if (this.terrainSvg) this.terrainSvg.replaceWith(svg)
    else this.terrainHost.prepend(svg)
    this.terrainSvg = svg
    this.terrainMarkers = svg.querySelector('.fp-markers')

    this.animatePaths(svg, '.fp-clearance', this.drawnClearance, this.animatingClearance)
  }

  sampleAt(points, distance) {
    let lo = 0
    let hi = points.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (points[mid].x < distance) lo = mid + 1
      else hi = mid
    }
    const prev = points[lo - 1]
    if (prev && Math.abs(prev.x - distance) < Math.abs(points[lo].x - distance))
      return prev
    return points[lo]
  }

  terrainAt(distance) {
    const points = this.terrain.points
    if (!points.length) return null
    if (distance < points[0].x || distance > points[points.length - 1].x) return null

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const next = points[i]
      if (distance <= next.x) {
        const span = next.x - prev.x
        const ratio = span > 0 ? (distance - prev.x) / span : 0
        return { x: distance, y: prev.y + (next.y - prev.y) * ratio }
      }
    }
    return null
  }

  marker(px, py, colorVar) {
    const color = colorVar ? `var(${colorVar})` : TERRAIN_COLOR
    return `<circle class="fp-marker" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" style="fill: ${color}"/>`
  }

  hostPx(event) {
    return clamp(
      event.clientX - this.profileHost.getBoundingClientRect().left,
      0,
      this.width
    )
  }

  setZoom(zoom) {
    const clamped = clamp(zoom, 1, MAX_ZOOM)
    if (Math.abs(clamped - this.zoom) < 1e-4) return
    this.zoom = clamped
    this.render()
  }

  zoomToRange(endPx) {
    const endDistance = endPx / this.scale
    if (endDistance <= 0) return
    this.setZoom(this.width / endDistance / this.baseScale)
  }

  showSelection(px) {
    this.profileSelection.hidden = false
    this.profileSelection.style.width = `${px}px`
    this.selectionLabel.textContent = this.formatZoomTo(px / this.scale)
    this.terrainSelection.hidden = false
    this.terrainSelection.style.width = `${px}px`
  }

  onResetPointerDown = event => {
    event.stopPropagation()
  }

  onResetZoom = () => {
    this.setZoom(1)
  }

  hideSelection() {
    this.profileSelection.hidden = true
    this.terrainSelection.hidden = true
  }

  clearHover() {
    this.profileCursor.hidden = true
    this.terrainCursor.hidden = true
    this.profileTip.hidden = true
    this.terrainTip.hidden = true
    if (this.profileMarkers) this.profileMarkers.innerHTML = ''
    if (this.terrainMarkers) this.terrainMarkers.innerHTML = ''
  }

  onPointerDown = event => {
    if (event.button !== 0) return

    capturePointer(event.currentTarget, event.pointerId)
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (this.pointers.size === 2) {
      this.selecting = false
      this.hideSelection()
      const [a, b] = [...this.pointers.values()]
      this.pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y) || 1
      this.pinchStartZoom = this.zoom
      this.clearHover()
    } else if (this.pointers.size === 1 && event.pointerType !== 'touch') {
      this.selecting = true
      this.selectStartX = this.hostPx(event)
      this.selectMoved = false
    }
  }

  onPointerMove = event => {
    if (this.pointers.has(event.pointerId)) {
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }

    if (this.pointers.size >= 2 && this.pinchStartDist) {
      const [a, b] = [...this.pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1
      this.setZoom(this.pinchStartZoom * (dist / this.pinchStartDist))
      return
    }

    if (this.selecting) {
      const px = this.hostPx(event)
      if (Math.abs(px - this.selectStartX) > 3) this.selectMoved = true
      this.showSelection(px)
      this.clearHover()
      return
    }

    this.onHover(event)
  }

  onPointerUp = event => {
    const wasSelecting = this.selecting && this.pointers.size === 1
    this.pointers.delete(event.pointerId)
    releasePointer(event.currentTarget, event.pointerId)
    if (this.pointers.size < 2) this.pinchStartDist = 0

    if (wasSelecting) {
      this.selecting = false
      this.hideSelection()
      const endPx = this.hostPx(event)
      if (this.selectMoved && endPx > 5) this.zoomToRange(endPx)
      else if (this.zoom !== 1) this.setZoom(1)
    }
  }

  onPointerLeave = () => {
    if (this.selecting || this.pointers.size) return
    this.onLeave()
  }

  onHover = event => {
    if (!this.tracks.size || this.width <= 0) return

    const rect = this.profileHost.getBoundingClientRect()
    const px = event.clientX - rect.left
    if (px < 0 || px > this.width) return this.onLeave()

    const distance = px / this.scale
    const onTerrain = event.currentTarget === this.terrainHost

    this.profileCursor.hidden = false
    this.profileCursor.style.left = `${px}px`
    this.terrainCursor.hidden = false
    this.terrainCursor.style.left = `${px}px`

    const profileRows = []
    let profileMarks = ''
    const terrainRows = []
    let terrainMarks = ''

    this.tracks.forEach((track, id) => {
      const profileSample = track.profile.length && this.sampleAt(track.profile, distance)
      if (profileSample) {
        const html = this.formatProfile(profileSample, track, id)
        if (html) profileRows.push(html)
        profileMarks += this.marker(
          this.x(profileSample.x),
          this.yProfile(profileSample.y),
          track.colorVar
        )
      }

      const clearanceSample =
        track.clearance &&
        track.clearance.length &&
        this.sampleAt(track.clearance, distance)
      if (clearanceSample) {
        const html = this.formatClearance(clearanceSample, track, id)
        if (html) terrainRows.push(html)
        terrainMarks += this.marker(
          this.x(clearanceSample.x),
          this.yTerrain(clearanceSample.y),
          track.colorVar
        )
      }
    })

    if (this.terrain && this.terrain.points.length) {
      const terrainSample = this.terrainAt(distance)
      if (terrainSample) {
        const html = this.formatTerrain(terrainSample, this.terrain)
        if (html) profileRows.unshift(html)
        profileMarks += this.marker(
          this.x(terrainSample.x),
          this.yProfile(terrainSample.y),
          null
        )
      }
    }

    this.profileMarkers.innerHTML = profileMarks
    this.terrainMarkers.innerHTML = terrainMarks

    const activeRows = onTerrain ? terrainRows : profileRows
    const activeTip = onTerrain ? this.terrainTip : this.profileTip
    const idleTip = onTerrain ? this.profileTip : this.terrainTip
    idleTip.hidden = true

    if (!activeRows.length) {
      activeTip.hidden = true
      return
    }

    const hostHeight = onTerrain ? TERRAIN_HEIGHT : this.height
    const localTop = clamp(
      event.clientY - event.currentTarget.getBoundingClientRect().top,
      0,
      hostHeight
    )
    activeTip.hidden = false
    activeTip.innerHTML = activeRows.join('')
    activeTip.classList.toggle('fp-tooltip--flip', px / this.width > FLIP_THRESHOLD)
    activeTip.classList.toggle('fp-tooltip--above', onTerrain)
    activeTip.style.left = `${px}px`
    activeTip.style.top = `${localTop}px`
  }

  onLeave = () => {
    this.clearHover()
  }
}
