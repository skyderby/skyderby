const SVG_NS = 'http://www.w3.org/2000/svg'
const CHART_W = 1000
const CHART_H = 220
const CHART_PAD_BOTTOM = 26
const MINI_W = 1000
const MINI_H = 47
const MIN_WINDOW = 30
const SAMPLE_LIMIT = 1400
const FLIP_THRESHOLD = 60
const SPEED_MIN = -50
const SPEED_MAX = 350
const SERIES = ['area', 'alt', 'hspeed', 'vspeed']

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
    this.hoverX = null
    this.hoverFrame = null
    this.hoverSample = null

    this.chartEl.classList.add('range-editor__plot')
    this.minimapEl.classList.add('range-editor__overview')

    this.cursorEl = el('div', 'range-editor__cursor')
    this.cursorEl.hidden = true
    this.tooltipEl = el('div', 'range-editor__tooltip')
    this.tooltipEl.hidden = true
    this.altTopEl = this.axis('top')
    this.altBottomEl = this.axis('bottom')
    this.chartEl.append(this.cursorEl, this.tooltipEl, this.altTopEl, this.altBottomEl)

    this.mainSvg = this.buildSvg(CHART_W, CHART_H, CHART_PAD_BOTTOM)
    this.chartEl.prepend(this.mainSvg.svg)

    this.brushEl = el('div', 'range-editor__brush')
    this.brushEl.innerHTML =
      '<span class="range-editor__brush-edge range-editor__brush-edge--left"></span>' +
      '<span class="range-editor__brush-edge range-editor__brush-edge--right"></span>'
    this.minimapEl.appendChild(this.brushEl)

    this.overviewSvg = this.buildSvg(MINI_W, MINI_H, 0)
    this.minimapEl.prepend(this.overviewSvg.svg)

    this.chartEl.addEventListener('pointermove', this.onHover)
    this.chartEl.addEventListener('pointerleave', this.onLeave)
    this.brushEl.addEventListener('pointerdown', this.onBrushDown)
    this.minimapEl.addEventListener('pointerdown', this.onOverviewDown)
  }

  destroy() {
    cancelAnimationFrame(this.hoverFrame)
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
    this.drawSeries(this.mainSvg, this.viewStart, this.viewEnd)
    this.altTopEl.textContent = `${Math.round(this.aHi)} m`
    this.altBottomEl.textContent = `${Math.round(this.aLo)} m`
    this.hideHover()
  }

  renderOverview() {
    this.drawSeries(this.overviewSvg, 0, this.maxT)
    this.positionBrush()
  }

  positionBrush() {
    this.brushEl.style.left = `${this.trackPct(this.viewStart)}%`
    this.brushEl.style.width = `${(100 * this.windowLen) / this.maxT}%`
  }

  computeBounds() {
    const alts = this.samples.map(s => s.alt)
    this.aLo = alts.length ? Math.min(...alts) : 0
    this.aHi = alts.length ? Math.max(...alts) : 1
    if (this.aHi - this.aLo < 1) this.aHi = this.aLo + 1
    this.sLo = SPEED_MIN
    this.sHi = SPEED_MAX
  }

  buildSvg(width, height, padBottom) {
    const plot = height - padBottom
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.classList.add('range-editor__svg', 'amp-block')

    for (let i = 1; i < 4; i++) {
      const line = document.createElementNS(SVG_NS, 'line')
      const gy = (plot * i) / 4
      line.setAttribute('x1', 0)
      line.setAttribute('y1', gy)
      line.setAttribute('x2', width)
      line.setAttribute('y2', gy)
      line.classList.add('range-editor__grid')
      svg.appendChild(line)
    }

    const path = className => {
      const node = document.createElementNS(SVG_NS, 'path')
      node.classList.add(className)
      svg.appendChild(node)
      return node
    }

    return {
      svg,
      width,
      plot,
      area: path('range-editor__area'),
      alt: path('range-editor__alt'),
      hspeed: path('range-editor__hspeed'),
      vspeed: path('range-editor__vspeed')
    }
  }

  drawSeries(target, t0, t1) {
    const { width, plot } = target
    const points = this.windowSamples(t0, t1)

    if (points.length < 2) {
      SERIES.forEach(key => target[key].removeAttribute('d'))
      return
    }

    const span = Math.max(t1 - t0, 1e-6)
    const aSpan = this.aHi - this.aLo
    const sSpan = this.sHi - this.sLo
    const x = t => ((width * (t - t0)) / span).toFixed(1)
    const yA = a => (plot * (1 - (a - this.aLo) / aSpan)).toFixed(1)
    const yS = v =>
      (plot * (1 - (clamp(v, this.sLo, this.sHi) - this.sLo) / sSpan)).toFixed(1)

    const alt = new Array(points.length)
    const h = new Array(points.length)
    const v = new Array(points.length)
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const px = x(p.t)
      alt[i] = `${px} ${yA(p.alt)}`
      h[i] = `${px} ${yS(p.h)}`
      v[i] = `${px} ${yS(p.v)}`
    }

    const altPath = `M${alt.join('L')}`
    const firstX = x(points[0].t)
    const lastX = x(points[points.length - 1].t)

    target.area.setAttribute('d', `${altPath}L${lastX} ${plot}L${firstX} ${plot}Z`)
    target.alt.setAttribute('d', altPath)
    target.hspeed.setAttribute('d', `M${h.join('L')}`)
    target.vspeed.setAttribute('d', `M${v.join('L')}`)
  }

  windowSamples(t0, t1) {
    const from = this.indexAt(t0)
    let to = this.indexAt(t1)
    if (to < this.samples.length && this.samples[to].t <= t1) to++
    const count = to - from
    if (count <= SAMPLE_LIMIT) return this.samples.slice(from, to)

    const step = Math.ceil(count / SAMPLE_LIMIT)
    const result = []
    for (let i = from; i < to; i += step) result.push(this.samples[i])
    if ((count - 1) % step !== 0) result.push(this.samples[to - 1])
    return result
  }

  indexAt(t) {
    const samples = this.samples
    let lo = 0
    let hi = samples.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (samples[mid].t < t) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  axis(position) {
    return el(
      'div',
      `range-editor__axis range-editor__axis--${position} range-editor__axis--alt`
    )
  }

  onHover = event => {
    this.hoverX = event.clientX
    if (this.hoverFrame) return
    this.hoverFrame = requestAnimationFrame(this.drawHover)
  }

  drawHover = () => {
    this.hoverFrame = null
    if (!this.samples.length || this.hoverX == null) return

    const rect = this.chartEl.getBoundingClientRect()
    const ratio = (this.hoverX - rect.left) / rect.width
    if (ratio < 0 || ratio > 1) return this.hideHover()

    const sample = this.sampleAt(this.viewStart + ratio * this.windowLen)
    if (!sample) return this.hideHover()
    if (sample === this.hoverSample && !this.cursorEl.hidden) return
    this.hoverSample = sample

    const pct = this.viewPct(sample.t)
    const offset = `translate3d(${((pct * rect.width) / 100).toFixed(1)}px, 0, 0)`
    const flip = pct > FLIP_THRESHOLD

    this.cursorEl.hidden = false
    this.cursorEl.style.transform = offset

    this.tooltipEl.hidden = false
    this.tooltipEl.innerHTML = this.tooltipFormatter(sample)
    this.tooltipEl.classList.toggle('range-editor__tooltip--flip', flip)
    this.tooltipEl.style.transform = flip ? `${offset} translateX(-100%)` : offset
  }

  onLeave = () => {
    this.hoverX = null
    this.hideHover()
  }

  hideHover() {
    this.hoverSample = null
    this.cursorEl.hidden = true
    this.tooltipEl.hidden = true
  }

  sampleAt(t) {
    const samples = this.samples
    const index = Math.min(this.indexAt(t), samples.length - 1)
    const prev = samples[index - 1]
    if (prev && Math.abs(prev.t - t) < Math.abs(samples[index].t - t)) return prev
    return samples[index]
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
    let frame = null
    let lastX = startX

    const apply = () => {
      frame = null
      const deltaT = ((lastX - startX) / rect.width) * this.maxT
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

    const move = ev => {
      lastX = pointerX(ev)
      if (!frame) frame = requestAnimationFrame(apply)
    }

    const up = () => {
      if (frame) {
        cancelAnimationFrame(frame)
        apply()
      }
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
