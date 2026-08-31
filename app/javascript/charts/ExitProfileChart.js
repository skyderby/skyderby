const SVG_NS = 'http://www.w3.org/2000/svg'
const MARGIN = { top: 24, right: 18, bottom: 44, left: 46 }
const PALETTE = [
  '--blue-70',
  '--green-80',
  '--orange-70',
  '--purple-70',
  '--cyan-70',
  '--pink-70'
]
const TERRAIN_COLOR = '#b88e8d'
const MAX_PLOT_HEIGHT = 520

const svgEl = (tag, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
  return node
}

const escapeHtml = value =>
  String(value).replace(
    /[&<>"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]
  )

const niceTicks = (max, count = 5) => {
  const raw = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const ticks = []
  for (let tick = 0; tick <= max + 1e-6; tick += step) ticks.push(tick)
  return ticks
}

const valueAt = (points, drop) => {
  const index = points.findIndex(point => point.drop >= drop)
  if (index < 0) return null
  if (index === 0) return points[0].distance

  const lower = points[index - 1]
  const upper = points[index]
  const ratio = (drop - lower.drop) / (upper.drop - lower.drop)

  return lower.distance + (upper.distance - lower.distance) * ratio
}

export default class ExitProfileChart {
  constructor(host, data) {
    this.host = host
    this.data = data
    this.hidden = new Set()
    this.terrain = null
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'exit-performance__tooltip'
    this.tooltip.hidden = true
    this.host.appendChild(this.tooltip)
    this.onMove = this.onMove.bind(this)
    this.onLeave = this.onLeave.bind(this)
  }

  colorFor(index) {
    return `var(${PALETTE[index % PALETTE.length]})`
  }

  toggle(index) {
    if (this.hidden.has(index)) this.hidden.delete(index)
    else this.hidden.add(index)
    if (this.hidden.size === this.data.series.length) this.hidden.delete(index)
    this.onLeave()
    this.render()
    return !this.hidden.has(index)
  }

  setTerrain({ name, measurements }) {
    this.terrain = { name, points: this.terrainPoints(measurements) }
    this.onLeave()
    this.render()
  }

  clearTerrain() {
    this.terrain = null
    this.onLeave()
    this.render()
  }

  terrainPoints(measurements) {
    const maxDrop = this.maxDrop || this.dataMaxDrop()
    const points = measurements
      .map(({ altitude, distance }) => ({ drop: altitude, distance }))
      .sort((a, b) => a.drop - b.drop)

    const within = points.filter(point => point.drop <= maxDrop)
    const beyond = points.find(point => point.drop > maxDrop)
    if (beyond && within.length)
      within.push({ drop: maxDrop, distance: valueAt(points, maxDrop) })

    return within
  }

  dataMaxDrop() {
    return Math.max(
      ...this.data.series.flatMap(series => series.samples.map(s => s.drop))
    )
  }

  visibleSeries() {
    return this.data.series
      .map((series, index) => ({ series, index }))
      .filter(({ index }) => !this.hidden.has(index))
  }

  render() {
    const rect = this.host.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 640

    if (this.svg) this.svg.remove()

    const visible = this.visibleSeries()
    if (!visible.length) return

    const availableWidth = Math.max(width - MARGIN.left - MARGIN.right, 10)

    const maxDrop = this.dataMaxDrop()
    const maxDistance = Math.max(
      ...visible.flatMap(({ series }) => series.samples.map(sample => sample.high)),
      ...(this.terrain?.points || []).map(point => point.distance)
    )

    const scale = Math.min(availableWidth / maxDistance, MAX_PLOT_HEIGHT / maxDrop)

    this.maxDrop = maxDrop
    this.maxDistance = maxDistance
    this.plotWidth = maxDistance * scale
    this.plotHeight = maxDrop * scale
    this.originX = MARGIN.left + (availableWidth - this.plotWidth) / 2
    this.scaleX = distance => this.originX + distance * scale
    this.scaleY = drop => MARGIN.top + drop * scale

    const height = MARGIN.top + this.plotHeight + MARGIN.bottom
    const svg = svgEl('svg', {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'exit-performance__svg'
    })

    this.renderGrid(svg)
    if (this.terrain) this.renderTerrain(svg)
    visible.forEach(({ series, index }) => this.renderSeries(svg, series, index))

    this.cursor = svgEl('line', {
      class: 'exit-performance__cursor',
      x1: this.originX,
      x2: this.originX + this.plotWidth,
      y1: MARGIN.top,
      y2: MARGIN.top
    })
    this.cursor.setAttribute('visibility', 'hidden')
    svg.appendChild(this.cursor)

    svg.addEventListener('pointermove', this.onMove)
    svg.addEventListener('pointerleave', this.onLeave)

    this.host.insertBefore(svg, this.tooltip)
    this.svg = svg
  }

  renderGrid(svg) {
    const group = svgEl('g', { class: 'exit-performance__grid' })
    const bottom = MARGIN.top + this.plotHeight

    niceTicks(this.maxDistance).forEach(value => {
      const x = this.scaleX(value)
      group.appendChild(svgEl('line', { x1: x, x2: x, y1: MARGIN.top, y2: bottom }))
      const label = svgEl('text', { x, y: bottom + 16, 'text-anchor': 'middle' })
      label.textContent = Math.round(value)
      group.appendChild(label)
    })

    niceTicks(this.maxDrop).forEach(value => {
      const y = this.scaleY(value)
      group.appendChild(
        svgEl('line', {
          x1: this.originX,
          x2: this.originX + this.plotWidth,
          y1: y,
          y2: y
        })
      )
      const label = svgEl('text', { x: this.originX - 8, y: y + 4, 'text-anchor': 'end' })
      label.textContent = Math.round(value)
      group.appendChild(label)
    })

    const axisX = svgEl('text', {
      x: this.originX + this.plotWidth,
      y: bottom + 34,
      'text-anchor': 'end',
      class: 'exit-performance__axis-label'
    })
    axisX.textContent = `${this.data.labels.distance}, ${this.data.unit}`
    group.appendChild(axisX)

    const axisY = svgEl('text', {
      x: Math.max(this.originX - 44, 2),
      y: 10,
      'text-anchor': 'start',
      class: 'exit-performance__axis-label'
    })
    axisY.textContent = `${this.data.labels.drop}, ${this.data.unit}`
    group.appendChild(axisY)

    svg.appendChild(group)
  }

  renderTerrain(svg) {
    const points = this.terrain.points
    if (points.length < 2) return

    const line = points.map(
      point => `${this.scaleX(point.distance)},${this.scaleY(point.drop)}`
    )
    const last = points[points.length - 1]
    const area = line.concat([
      `${this.originX},${this.scaleY(last.drop)}`,
      `${this.originX},${this.scaleY(points[0].drop)}`
    ])

    svg.appendChild(
      svgEl('path', {
        class: 'exit-performance__terrain-area',
        d: `M${area.join('L')}Z`,
        style: `fill: ${TERRAIN_COLOR}`
      })
    )
    svg.appendChild(
      svgEl('path', {
        class: 'exit-performance__terrain-line',
        d: `M${line.join('L')}`,
        style: `stroke: ${TERRAIN_COLOR}`
      })
    )
  }

  bandPath(samples, lowKey, highKey) {
    const forward = samples.map(
      sample => `${this.scaleX(sample[lowKey])},${this.scaleY(sample.drop)}`
    )
    const backward = samples
      .slice()
      .reverse()
      .map(sample => `${this.scaleX(sample[highKey])},${this.scaleY(sample.drop)}`)

    return `M${forward.concat(backward).join('L')}Z`
  }

  linePath(samples, key) {
    return `M${samples.map(sample => `${this.scaleX(sample[key])},${this.scaleY(sample.drop)}`).join('L')}`
  }

  renderSeries(svg, series, index) {
    const color = this.colorFor(index)
    const group = svgEl('g', { class: 'exit-performance__group', 'data-series': index })

    group.appendChild(
      svgEl('path', {
        class: 'exit-performance__band exit-performance__band--outer',
        d: this.bandPath(series.samples, 'low', 'high'),
        style: `fill: ${color}`
      })
    )
    group.appendChild(
      svgEl('path', {
        class: 'exit-performance__band exit-performance__band--inner',
        d: this.bandPath(series.samples, 'q1', 'q3'),
        style: `fill: ${color}`
      })
    )
    group.appendChild(
      svgEl('path', {
        class: 'exit-performance__line exit-performance__line--flat',
        d: this.linePath(series.samples, 'flat'),
        style: `stroke: ${color}`
      })
    )
    group.appendChild(
      svgEl('path', {
        class: 'exit-performance__line exit-performance__line--median',
        d: this.linePath(series.samples, 'mid'),
        style: `stroke: ${color}`
      })
    )

    svg.appendChild(group)
  }

  sampleAt(series, drop) {
    return series.samples.reduce((closest, sample) =>
      Math.abs(sample.drop - drop) < Math.abs(closest.drop - drop) ? sample : closest
    )
  }

  terrainRow(drop) {
    if (!this.terrain) return ''

    const distance = valueAt(this.terrain.points, drop)
    if (distance === null) return ''

    return `
      <div class="exit-performance__tooltip-row">
        <span class="exit-performance__tooltip-dot" style="background: ${TERRAIN_COLOR}"></span>
        <span class="exit-performance__tooltip-suit">${escapeHtml(this.terrain.name)}</span>
        <span class="exit-performance__tooltip-value">${Math.round(distance)}</span>
        <span class="exit-performance__tooltip-value"></span>
      </div>`
  }

  onMove(event) {
    const bounds = this.svg.getBoundingClientRect()
    const y = event.clientY - bounds.top
    const ratio = (y - MARGIN.top) / this.plotHeight
    if (ratio < 0 || ratio > 1) return this.onLeave()

    const drop = ratio * this.maxDrop
    const visible = this.visibleSeries()
    const sample = this.sampleAt(visible[0].series, drop)

    this.cursor.setAttribute('visibility', 'visible')
    this.cursor.setAttribute('y1', this.scaleY(sample.drop))
    this.cursor.setAttribute('y2', this.scaleY(sample.drop))

    const rows = visible
      .map(({ series, index }) => {
        const point = this.sampleAt(series, drop)
        return `
          <div class="exit-performance__tooltip-row">
            <span class="exit-performance__tooltip-dot" style="background: ${this.colorFor(index)}"></span>
            <span class="exit-performance__tooltip-suit">${escapeHtml(series.label)}</span>
            <span class="exit-performance__tooltip-value">${point.mid}</span>
            <span class="exit-performance__tooltip-value exit-performance__tooltip-value--flat">${point.flat}</span>
          </div>`
      })
      .join('')

    this.tooltip.innerHTML = `
      <div class="exit-performance__tooltip-head">
        <span>${this.data.labels.drop} ${sample.drop} ${this.data.unit}</span>
        <span class="exit-performance__tooltip-legend">
          ${this.data.labels.median} · ${this.data.labels.flat}
        </span>
      </div>
      ${rows}
      ${this.terrainRow(sample.drop)}`
    this.tooltip.hidden = false

    const top = Math.min(
      this.scaleY(sample.drop) + 12,
      bounds.height - this.tooltip.offsetHeight - 4
    )
    const left = Math.min(
      this.originX + this.plotWidth + 12,
      bounds.width - this.tooltip.offsetWidth - 4
    )
    this.tooltip.style.top = `${Math.max(top, 4)}px`
    this.tooltip.style.left = `${Math.max(left, this.originX)}px`
  }

  onLeave() {
    this.tooltip.hidden = true
    this.cursor?.setAttribute('visibility', 'hidden')
  }

  destroy() {
    this.svg?.remove()
    this.tooltip.remove()
  }
}
