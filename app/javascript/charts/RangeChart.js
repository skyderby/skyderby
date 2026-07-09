const SVG_NS = 'http://www.w3.org/2000/svg'
const CHART_W = 1000
const CHART_H = 220
const CHART_PAD_BOTTOM = 26
const MINI_W = 1000
const MINI_H = 47
const MIN_WINDOW = 30
const SAMPLE_LIMIT = 1400
const FLIP_THRESHOLD = 60

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const pointerX = event => (event.touches ? event.touches[0].clientX : event.clientX)

const el = (tag, className) => {
  const node = document.createElement(tag)
  node.className = className
  return node
}

export default class RangeChart {
  constructor(chartEl, minimapEl, { onViewChange, tooltipFormatter } = {}) {
    this.chartEl = chartEl
    this.minimapEl = minimapEl
    this.onViewChange = onViewChange || (() => {})
    this.tooltipFormatter = tooltipFormatter || (() => '')

    this.samples = []
    this.maxT = MIN_WINDOW
    this.viewStart = 0
    this.windowLen = MIN_WINDOW
    this.axisEls = []

    this.chartEl.classList.add('range-editor__plot')
    this.minimapEl.classList.add('range-editor__overview')

    this.cursorEl = el('div', 'range-editor__cursor')
    this.cursorEl.hidden = true
    this.tooltipEl = el('div', 'range-editor__tooltip')
    this.tooltipEl.hidden = true
    this.chartEl.append(this.cursorEl, this.tooltipEl)

    this.brushEl = el('div', 'range-editor__brush')
    this.brushEl.innerHTML =
      '<span class="range-editor__brush-edge range-editor__brush-edge--left"></span>' +
      '<span class="range-editor__brush-edge range-editor__brush-edge--right"></span>'
    this.minimapEl.appendChild(this.brushEl)

    this.chartEl.addEventListener('pointermove', this.onHover)
    this.chartEl.addEventListener('pointerleave', this.onLeave)
    this.brushEl.addEventListener('pointerdown', this.onBrushDown)
    this.minimapEl.addEventListener('pointerdown', this.onOverviewDown)
  }

  destroy() {
    this.chartEl.removeEventListener('pointermove', this.onHover)
    this.chartEl.removeEventListener('pointerleave', this.onLeave)
    this.brushEl.removeEventListener('pointerdown', this.onBrushDown)
    this.minimapEl.removeEventListener('pointerdown', this.onOverviewDown)
  }

  setData(samples) {
    this.samples = [...samples].sort((a, b) => a.t - b.t)
    if (this.samples.length) this.maxT = this.samples[this.samples.length - 1].t
    this.computeBounds()
  }

  setView(start, len) {
    this.windowLen = clamp(len, MIN_WINDOW, this.maxT)
    this.viewStart = clamp(start, 0, this.maxT - this.windowLen)
    this.render()
  }

  get viewEnd() {
    return this.viewStart + this.windowLen
  }

  isInView(t) {
    return t >= this.viewStart && t <= this.viewEnd
  }

  viewPct(t) {
    return (100 * (t - this.viewStart)) / this.windowLen
  }

  trackPct(t) {
    return (100 * t) / this.maxT
  }

  clientXToTime(clientX) {
    const rect = this.chartEl.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    return this.viewStart + ratio * this.windowLen
  }

  render() {
    this.renderMain()
    this.renderOverview()
  }

  renderMain() {
    const svg = this.seriesSvg(
      CHART_W,
      CHART_H,
      this.viewStart,
      this.viewEnd,
      CHART_PAD_BOTTOM
    )
    if (this.mainSvg) this.mainSvg.replaceWith(svg)
    else this.chartEl.prepend(svg)
    this.mainSvg = svg

    this.axisEls.forEach(node => node.remove())
    this.axisEls = [
      this.axis(`${Math.round(this.aHi)} m`, 'top'),
      this.axis(`${Math.round(this.aLo)} m`, 'bottom')
    ]
    this.axisEls.forEach(node => this.chartEl.appendChild(node))
  }

  renderOverview() {
    const svg = this.seriesSvg(MINI_W, MINI_H, 0, this.maxT, 0)
    if (this.overviewSvg) this.overviewSvg.replaceWith(svg)
    else this.minimapEl.prepend(svg)
    this.overviewSvg = svg
    this.positionBrush()
  }

  positionBrush() {
    this.brushEl.style.left = `${this.trackPct(this.viewStart)}%`
    this.brushEl.style.width = `${(100 * this.windowLen) / this.maxT}%`
  }

  computeBounds() {
    const alts = this.samples.map(s => s.alt)
    const speeds = this.samples.flatMap(s => [s.v, s.h])
    this.aLo = alts.length ? Math.min(...alts) : 0
    this.aHi = alts.length ? Math.max(...alts) : 1
    if (this.aHi - this.aLo < 1) this.aHi = this.aLo + 1
    this.sLo = Math.min(0, ...speeds)
    this.sHi = Math.max(10, ...speeds)
  }

  seriesSvg(width, height, t0, t1, padBottom) {
    const plot = height - padBottom
    const span = Math.max(t1 - t0, 1e-6)
    const x = t => (width * (t - t0)) / span
    const yA = a => plot * (1 - (a - this.aLo) / (this.aHi - this.aLo))
    const yS = v => plot * (1 - (v - this.sLo) / (this.sHi - this.sLo))

    const points = this.windowSamples(t0, t1)
    if (points.length < 2) return this.emptySvg(width, height)

    const path = accessor => {
      let d = `M${x(points[0].t).toFixed(1)} ${accessor(points[0]).toFixed(1)}`
      for (let i = 1; i < points.length; i++) {
        d += ` L${x(points[i].t).toFixed(1)} ${accessor(points[i]).toFixed(1)}`
      }
      return d
    }

    const altPath = path(p => yA(p.alt))
    const last = points[points.length - 1]
    const area = `${altPath} L${x(last.t).toFixed(1)} ${plot} L${x(points[0].t).toFixed(1)} ${plot} Z`

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.classList.add('range-editor__svg')

    let grid = ''
    for (let i = 1; i < 4; i++) {
      const gy = (plot * i) / 4
      grid += `<line x1="0" y1="${gy}" x2="${width}" y2="${gy}" class="range-editor__grid"/>`
    }

    svg.innerHTML =
      grid +
      `<path d="${area}" class="range-editor__area"/>` +
      `<path d="${altPath}" class="range-editor__alt"/>` +
      `<path d="${path(p => yS(p.h))}" class="range-editor__hspeed"/>` +
      `<path d="${path(p => yS(p.v))}" class="range-editor__vspeed"/>`

    return svg
  }

  windowSamples(t0, t1) {
    const inside = this.samples.filter(s => s.t >= t0 && s.t <= t1)
    if (inside.length <= SAMPLE_LIMIT) return inside
    const step = Math.ceil(inside.length / SAMPLE_LIMIT)
    return inside.filter((_, i) => i % step === 0 || i === inside.length - 1)
  }

  emptySvg(width, height) {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.classList.add('range-editor__svg')
    return svg
  }

  axis(text, position) {
    const node = el(
      'div',
      `range-editor__axis range-editor__axis--${position} range-editor__axis--alt`
    )
    node.textContent = text
    return node
  }

  onHover = event => {
    if (!this.samples.length) return

    const rect = this.chartEl.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    if (ratio < 0 || ratio > 1) return this.onLeave()

    const sample = this.sampleAt(this.viewStart + ratio * this.windowLen)
    if (!sample) return this.onLeave()

    const pct = this.viewPct(sample.t)
    this.cursorEl.hidden = false
    this.cursorEl.style.left = `${pct}%`

    this.tooltipEl.hidden = false
    this.tooltipEl.innerHTML = this.tooltipFormatter(sample)
    this.tooltipEl.classList.toggle('range-editor__tooltip--flip', pct > FLIP_THRESHOLD)
    this.tooltipEl.style.left = `${pct}%`
  }

  onLeave = () => {
    this.cursorEl.hidden = true
    this.tooltipEl.hidden = true
  }

  sampleAt(t) {
    const samples = this.samples
    let lo = 0
    let hi = samples.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (samples[mid].t < t) lo = mid + 1
      else hi = mid
    }
    const prev = samples[lo - 1]
    if (prev && Math.abs(prev.t - t) < Math.abs(samples[lo].t - t)) return prev
    return samples[lo]
  }

  onBrushDown = event => {
    event.preventDefault()
    event.stopPropagation()
    const edge = event.target.classList.contains('range-editor__brush-edge')
      ? event.target.classList.contains('range-editor__brush-edge--left')
        ? 'left'
        : 'right'
      : null
    const rect = this.minimapEl.getBoundingClientRect()
    const startX = pointerX(event)
    const startView = this.viewStart
    const startLen = this.windowLen

    const move = ev => {
      const deltaT = ((pointerX(ev) - startX) / rect.width) * this.maxT
      if (edge === 'left') {
        const newStart = clamp(startView + deltaT, 0, startView + startLen - MIN_WINDOW)
        this.windowLen = startView + startLen - newStart
        this.viewStart = newStart
      } else if (edge === 'right') {
        this.windowLen = clamp(startLen + deltaT, MIN_WINDOW, this.maxT - startView)
      } else {
        this.viewStart = clamp(startView + deltaT, 0, this.maxT - startLen)
      }
      this.renderMain()
      this.positionBrush()
      this.onViewChange()
    }

    const up = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
    }

    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  onOverviewDown = event => {
    if (this.brushEl.contains(event.target)) return
    const rect = this.minimapEl.getBoundingClientRect()
    const center = ((pointerX(event) - rect.left) / rect.width) * this.maxT
    this.viewStart = clamp(center - this.windowLen / 2, 0, this.maxT - this.windowLen)
    this.renderMain()
    this.positionBrush()
    this.onViewChange()
  }
}
