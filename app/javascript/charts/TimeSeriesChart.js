import { svgEl } from './svg/elements'

const PADDING = { top: 8, right: 8, bottom: 22, left: 8 }
const COMPACT_BOTTOM = 2
const RIGHT_AXIS_WIDTH = 36
const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]
const MIN_X_TICK_PX = 60
const MIN_Y_TICK_PX = 50
const MIN_Y_LABEL_PX = 22
const TOOLTIP_OFFSET = 12
const FLIP_THRESHOLD = 0.6
const DASHES = { dash: '6 4', dot: '2 3' }
const POINT_TOLERANCE = 1
const MAX_COLUMN_WIDTH = 8
const FULL_PANE = [0, 1]

let uid = 0

const niceStep = (range, maxTicks) => {
  const raw = range / Math.max(maxTicks, 1)
  return NICE_STEPS.find(step => step >= raw) ?? NICE_STEPS[NICE_STEPS.length - 1]
}

const nearestIndex = (xs, x) => {
  let lo = 0
  let hi = xs.length - 1
  if (hi < 0) return -1

  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (xs[mid] < x) lo = mid + 1
    else hi = mid
  }

  if (lo > 0 && Math.abs(xs[lo - 1] - x) <= Math.abs(xs[lo] - x)) return lo - 1
  return lo
}

const el = (tag, className) => {
  const node = document.createElement(tag)
  node.className = className
  return node
}

const readVisibility = key => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeVisibility = (key, visible) => {
  try {
    localStorage.setItem(key, String(visible))
  } catch {
    return
  }
}

const seriesValues = series =>
  series.type === 'range' ? [...series.ysLow, ...series.ysHigh] : series.ys

export default class TimeSeriesChart {
  constructor(
    container,
    {
      title = null,
      series,
      yAxes = null,
      yAxis = {},
      xAxis = { labels: true },
      legend = null,
      plotLines = [],
      plotBands = [],
      tooltipHeader = () => '',
      onHover = null,
      onLeave = null,
      onClick = null
    }
  ) {
    this.container = container
    this.title = title
    this.yAxes = (yAxes || [{ id: 'y', ...yAxis }]).map(axis => ({
      position: 'left',
      labels: true,
      grid: true,
      format: value => String(value),
      ...axis
    }))
    this.series = series.map(item => ({ axis: this.yAxes[0].id, ...item }))
    this.xAxis = xAxis
    this.legend = legend
    this.plotLines = plotLines
    this.plotBands = plotBands
    this.tooltipHeader = tooltipHeader
    this.onHover = onHover
    this.onLeave = onLeave
    this.onClick = onClick
    this.id = `ts-chart-${++uid}`
    this.index = null
    this.tooltipIndex = null

    if (legend?.storageKey) this.restoreVisibility()
    this.buildDom()
    this.render()

    this.resizeObserver = new ResizeObserver(() => this.render())
    this.resizeObserver.observe(this.plotEl)
  }

  buildDom() {
    this.container.classList.add('ts-chart')

    if (this.title) {
      this.titleEl = el('div', 'ts-chart__title')
      this.titleEl.textContent = this.title
      this.container.append(this.titleEl)
    }

    this.plotEl = el('div', 'ts-chart__plot')
    this.svg = svgEl('svg', { class: 'ts-chart__svg' })
    this.cursorEl = el('div', 'ts-chart__cursor')
    this.cursorEl.hidden = true
    this.tooltipEl = el('div', 'ts-chart__tooltip')
    this.tooltipEl.hidden = true
    this.dotEls = this.series.map(series => {
      const dot = el('span', 'ts-chart__dot')
      dot.style.background = series.color
      dot.hidden = true
      return dot
    })

    this.plotEl.append(this.svg, this.cursorEl, ...this.dotEls, this.tooltipEl)
    this.container.append(this.plotEl)

    this.plotEl.addEventListener('pointerdown', this.onPointerDown)
    this.plotEl.addEventListener('pointermove', this.onPointerMove)
    this.plotEl.addEventListener('pointerleave', this.onPointerLeave)
    if (this.onClick) this.plotEl.addEventListener('click', this.onPlotClick)

    if (this.legend) this.buildLegend()
  }

  buildLegend() {
    this.legendEl = el('div', 'ts-chart__legend')

    this.series.forEach(series => {
      if (series.legend === false) return

      const item = el('button', 'ts-chart__legend-item')
      item.type = 'button'
      item.dataset.code = series.code
      item.setAttribute('aria-pressed', String(series.visible !== false))

      const swatch = el('span', 'ts-chart__legend-swatch')
      swatch.style.setProperty('--swatch-color', series.color)
      if (series.dashed || series.type === 'range') {
        swatch.classList.add('ts-chart__legend-swatch--dashed')
      }

      item.append(swatch, document.createTextNode(series.name))
      item.addEventListener('click', () => this.toggleSeries(series.code))
      this.legendEl.append(item)
    })

    this.container.append(this.legendEl)
  }

  restoreVisibility() {
    this.series.forEach(series => {
      const stored = readVisibility(`${this.legend.storageKey}/${series.code}`)
      if (stored === 'true') series.visible = true
      if (stored === 'false') series.visible = false
    })
  }

  toggleSeries(code) {
    const series = this.series.find(item => item.code === code)
    if (!series) return

    series.visible = series.visible === false
    if (this.legend?.storageKey) {
      writeVisibility(`${this.legend.storageKey}/${code}`, series.visible)
    }

    const item = this.legendEl?.querySelector(`[data-code="${code}"]`)
    item?.setAttribute('aria-pressed', String(series.visible))

    this.tooltipIndex = null
    this.render()
  }

  get visibleSeries() {
    return this.series.filter(series => series.visible !== false && series.xs.length)
  }

  get primary() {
    return this.series[0]
  }

  get rightAxes() {
    return this.yAxes.filter(axis => axis.position === 'right' && axis.labels)
  }

  axisFor(series) {
    return this.yAxes.find(axis => axis.id === series.axis) || this.yAxes[0]
  }

  setPlotLines(plotLines) {
    this.plotLines = plotLines
    if (this.plotLineGroup && this.plot) {
      this.plotLineGroup.replaceChildren(...this.xPlotLineNodes())
    }
  }

  computeScales() {
    const width = this.plotEl.clientWidth
    const height = this.plotEl.clientHeight
    const bottom = this.xAxis.labels ? PADDING.bottom : COMPACT_BOTTOM

    this.width = width
    this.height = height
    this.plot = {
      left: PADDING.left,
      right: width - PADDING.right - this.rightAxes.length * RIGHT_AXIS_WIDTH,
      top: PADDING.top,
      bottom: height - bottom
    }

    let xMin = Infinity
    let xMax = -Infinity
    this.series.forEach(series => {
      if (!series.xs.length) return
      xMin = Math.min(xMin, series.xs[0])
      xMax = Math.max(xMax, series.xs[series.xs.length - 1])
    })
    if (!Number.isFinite(xMin)) {
      xMin = 0
      xMax = 1
    }
    if (xMax - xMin < 1e-6) xMax = xMin + 1

    this.xMin = xMin
    this.xMax = xMax
    this.yAxes.forEach(axis => this.computeAxisScale(axis))
  }

  computeAxisScale(axis) {
    const visible = this.visibleSeries.filter(series => series.axis === axis.id)
    axis.active = visible.length > 0
    const maxTicks = Math.max(2, Math.floor(this.paneHeight(axis) / MIN_Y_TICK_PX))

    if (axis.max != null) {
      const min = axis.min ?? 0
      axis.scale = {
        min,
        max: axis.max,
        step: axis.tickInterval ?? niceStep(axis.max - min, maxTicks)
      }
      return
    }

    let dataMin = Infinity
    let dataMax = -Infinity
    visible.forEach(series => {
      seriesValues(series).forEach(value => {
        if (value == null) return
        if (value < dataMin) dataMin = value
        if (value > dataMax) dataMax = value
      })
    })
    if (!Number.isFinite(dataMin)) {
      dataMin = axis.min ?? 0
      dataMax = dataMin + 1
    }

    const floor = axis.min ?? dataMin
    const step = axis.tickInterval ?? niceStep(Math.max(dataMax - floor, 1), maxTicks)
    const min = axis.min ?? Math.floor(dataMin / step) * step
    let max = Math.ceil(dataMax / step) * step
    if (max <= min) max = min + step

    axis.scale = { min, max, step }
  }

  get plotHeight() {
    return Math.max(this.plot.bottom - this.plot.top, 1)
  }

  get plotWidth() {
    return Math.max(this.plot.right - this.plot.left, 1)
  }

  x(value) {
    return (
      this.plot.left + ((value - this.xMin) / (this.xMax - this.xMin)) * this.plotWidth
    )
  }

  paneHeight(axis) {
    const [start, end] = axis.pane || FULL_PANE
    return this.plotHeight * (end - start)
  }

  y(value, axis = this.yAxes[0]) {
    const { min, max } = axis.scale
    const [, end] = axis.pane || FULL_PANE
    const bottom = this.plot.top + this.plotHeight * end
    return bottom - ((value - min) / (max - min)) * this.paneHeight(axis)
  }

  render() {
    if (!this.plotEl.clientWidth || !this.plotEl.clientHeight) return

    this.computeScales()
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)

    const defs = svgEl('defs')
    const clipId = `${this.id}-clip`
    const clip = svgEl('clipPath', { id: clipId })
    clip.append(
      svgEl('rect', {
        x: this.plot.left,
        y: this.plot.top - 2,
        width: this.plotWidth,
        height: this.plotHeight + 4
      })
    )
    defs.append(clip)

    const seriesGroup = svgEl('g', { 'clip-path': `url(#${clipId})` })
    this.visibleSeries.forEach(series => {
      seriesGroup.append(...this.seriesNodes(series, defs))
    })

    this.plotLineGroup = svgEl('g')
    this.plotLineGroup.append(...this.xPlotLineNodes())

    this.svg.replaceChildren(
      defs,
      ...this.plotBandNodes(),
      ...this.yAxes.flatMap(axis => this.yAxisNodes(axis, 'grid')),
      ...this.xAxisNodes(),
      ...this.yAxes.flatMap(axis => this.yPlotLineNodes(axis)),
      seriesGroup,
      ...this.yAxes.flatMap(axis => this.yAxisNodes(axis, 'labels')),
      this.plotLineGroup
    )

    if (this.index != null) this.showIndex(this.index, { force: true })
  }

  plotBandNodes() {
    return this.plotBands.flatMap(band => {
      if (!Number.isFinite(band.from) || !Number.isFinite(band.to)) return []

      const from = Math.max(this.x(Math.min(band.from, band.to)), this.plot.left)
      const to = Math.min(this.x(Math.max(band.from, band.to)), this.plot.right)
      if (to <= from) return []

      const nodes = [
        svgEl('rect', {
          x: from.toFixed(1),
          y: this.plot.top,
          width: (to - from).toFixed(1),
          height: this.plotHeight,
          fill: band.color
        })
      ]
      if (band.label) {
        nodes.push(
          svgEl(
            'text',
            {
              x: (from + 4).toFixed(1),
              y: this.plot.top + 14,
              class: 'ts-chart__band-label'
            },
            band.label
          )
        )
      }
      return nodes
    })
  }

  yAxisNodes(axis, layer) {
    const nodes = []
    if (!axis.active || !axis[layer]) return nodes

    const { min, max, step } = axis.scale
    const tickMax = axis.tickMax ?? max
    const ticks = []
    for (let value = min; value <= tickMax + 1e-9; value += step) ticks.push(value)

    const spacing = (step / (max - min)) * this.paneHeight(axis)
    const every = Math.max(1, Math.ceil(MIN_Y_LABEL_PX / Math.max(spacing, 1)))
    const lastIndex = ticks.length - 1
    const right = axis.position === 'right'
    const column = this.rightAxes.indexOf(axis)

    ticks.forEach((value, i) => {
      const shown = i === lastIndex || (i % every === 0 && lastIndex - i >= every)
      if (!shown) return

      const gy = this.y(value, axis)
      if (layer === 'grid') {
        if (right) return
        nodes.push(
          svgEl('line', {
            x1: this.plot.left,
            x2: this.plot.right,
            y1: gy.toFixed(1),
            y2: gy.toFixed(1),
            class: 'ts-chart__grid'
          })
        )
        return
      }

      const attrs = right
        ? {
            x: this.plot.right + 4 + column * RIGHT_AXIS_WIDTH,
            y: (gy + 4).toFixed(1),
            class: 'ts-chart__label'
          }
        : { x: this.plot.left + 2, y: (gy - 3).toFixed(1), class: 'ts-chart__label' }
      if (axis.color) attrs.fill = axis.color

      nodes.push(svgEl('text', attrs, axis.format(value, i === lastIndex)))
    })

    return nodes
  }

  xAxisNodes() {
    const nodes = [
      svgEl('line', {
        x1: this.plot.left,
        x2: this.plot.right,
        y1: this.plot.bottom,
        y2: this.plot.bottom,
        class: 'ts-chart__axis'
      })
    ]
    if (!this.xAxis.labels) return nodes

    const step = niceStep(
      this.xMax - this.xMin,
      Math.max(2, Math.floor(this.plotWidth / MIN_X_TICK_PX))
    )
    for (
      let value = Math.ceil(this.xMin / step) * step;
      value <= this.xMax;
      value += step
    ) {
      nodes.push(
        svgEl(
          'text',
          {
            x: this.x(value).toFixed(1),
            y: this.plot.bottom + 15,
            class: 'ts-chart__label ts-chart__label--x'
          },
          String(Math.round(value))
        )
      )
    }

    return nodes
  }

  yPlotLineNodes(axis) {
    return (axis.plotLines || [])
      .filter(line => Number.isFinite(line.value))
      .map(line => {
        const gy = this.y(line.value, axis).toFixed(1)
        return svgEl('line', {
          x1: this.plot.left,
          x2: this.plot.right,
          y1: gy,
          y2: gy,
          stroke: line.color,
          'stroke-dasharray': DASHES[line.dash] || '',
          class: 'ts-chart__plot-line'
        })
      })
  }

  xPlotLineNodes() {
    const nodes = []

    this.plotLines.forEach(line => {
      if (
        !Number.isFinite(line.value) ||
        line.value < this.xMin ||
        line.value > this.xMax
      ) {
        return
      }

      const gx = this.x(line.value).toFixed(1)
      nodes.push(
        svgEl('line', {
          x1: gx,
          x2: gx,
          y1: this.plot.top,
          y2: this.plot.bottom,
          stroke: line.color,
          'stroke-dasharray': DASHES[line.dash] || '',
          class: 'ts-chart__plot-line'
        })
      )

      if (line.label) {
        const labelY =
          line.labelPosition === 'bottom' ? this.plot.bottom - 4 : this.plot.top + 10
        nodes.push(
          svgEl(
            'text',
            { x: gx, y: labelY, fill: line.color, class: 'ts-chart__plot-line-label' },
            line.label
          )
        )
      }
    })

    return nodes
  }

  linePath(xs, ys, axis) {
    let d = ''
    let started = false

    for (let i = 0; i < xs.length; i++) {
      if (ys[i] == null) {
        started = false
        continue
      }
      d += `${started ? 'L' : 'M'}${this.x(xs[i]).toFixed(1)} ${this.y(ys[i], axis).toFixed(1)}`
      started = true
    }

    return d
  }

  seriesNodes(series, defs) {
    const axis = this.axisFor(series)
    if (series.type === 'range') return this.rangeNodes(series, axis)
    if (series.type === 'column') return this.columnNodes(series, axis, defs)

    const d = this.linePath(series.xs, series.ys, axis)
    if (!d) return []

    const paint = series.zones ? this.zoneGradient(series, axis, defs) : series.color
    const nodes = []

    if (series.type === 'area') {
      const first = series.ys.findIndex(value => value != null)
      const last = series.ys.findLastIndex(value => value != null)
      const base = this.y(axis.scale.min, axis).toFixed(1)
      nodes.push(
        svgEl('path', {
          d: `${d}L${this.x(series.xs[last]).toFixed(1)} ${base}L${this.x(series.xs[first]).toFixed(1)} ${base}Z`,
          fill: paint,
          class: 'ts-chart__area'
        })
      )
    }

    nodes.push(
      svgEl('path', {
        d,
        stroke: paint,
        'stroke-dasharray': series.dashed ? DASHES.dash : '',
        class: series.thin ? 'ts-chart__line ts-chart__line--thin' : 'ts-chart__line'
      })
    )

    return nodes
  }

  columnNodes(series, axis, defs) {
    const { xs, ys } = series
    const base = this.y(Math.max(axis.scale.min, 0), axis).toFixed(1)
    let d = ''

    for (let i = 0; i < xs.length; i++) {
      if (ys[i] == null) continue
      d += `M${this.x(xs[i]).toFixed(1)} ${base}V${this.y(ys[i], axis).toFixed(1)}`
    }
    if (!d) return []

    const step =
      this.plotWidth / Math.max((this.xMax - this.xMin) / this.sampleSpacing(xs), 1)
    const width = Math.min(Math.max(step * 0.7, 1), MAX_COLUMN_WIDTH)

    return [
      svgEl('path', {
        d,
        stroke: series.zones ? this.zoneGradient(series, axis, defs) : series.color,
        'stroke-width': width.toFixed(1),
        class: 'ts-chart__column'
      })
    ]
  }

  sampleSpacing(xs) {
    if (xs.length < 2) return 1
    return Math.max((xs[xs.length - 1] - xs[0]) / (xs.length - 1), 1e-3)
  }

  rangeNodes(series, axis) {
    const { xs, ysLow, ysHigh } = series
    const upper = []
    const lower = []

    for (let i = 0; i < xs.length; i++) {
      if (ysLow[i] == null || ysHigh[i] == null) continue
      const px = this.x(xs[i]).toFixed(1)
      upper.push(`${px} ${this.y(ysHigh[i], axis).toFixed(1)}`)
      lower.push(`${px} ${this.y(ysLow[i], axis).toFixed(1)}`)
    }
    if (!upper.length) return []

    return [
      svgEl('path', {
        d: `M${upper.join('L')}L${lower.reverse().join('L')}Z`,
        fill: series.color,
        class: 'ts-chart__range'
      }),
      svgEl('path', {
        d: `M${upper.join('L')}`,
        stroke: series.lineColor || series.color,
        'stroke-dasharray': DASHES.dash,
        class: 'ts-chart__line ts-chart__line--thin'
      })
    ]
  }

  zoneGradient(series, axis, defs) {
    const id = `${this.id}-${series.code}-zones`
    const gradient = svgEl('linearGradient', {
      id,
      gradientUnits: 'userSpaceOnUse',
      x1: 0,
      x2: 0,
      y1: this.plot.top,
      y2: this.plot.bottom
    })

    const offset = value =>
      Math.min(1, Math.max(0, (this.y(value, axis) - this.plot.top) / this.plotHeight))
    const zones = series.zones
    const stop = (at, color) => svgEl('stop', { offset: at, 'stop-color': color })

    gradient.append(stop(0, zones[zones.length - 1].color))
    for (let k = zones.length - 2; k >= 0; k--) {
      const at = offset(zones[k].upTo)
      gradient.append(stop(at, zones[k + 1].color), stop(at, zones[k].color))
    }
    gradient.append(stop(1, zones[0].color))

    defs.append(gradient)
    return `url(#${id})`
  }

  onPointerDown = event => {
    if (event.pointerType !== 'mouse') this.onPointerMove(event)
  }

  onPointerMove = event => {
    this.pointerX = event.clientX
    if (this.hoverFrame) return

    this.hoverFrame = requestAnimationFrame(() => {
      this.hoverFrame = null
      this.handleHover()
    })
  }

  onPointerLeave = event => {
    if (event.pointerType === 'touch') return

    cancelAnimationFrame(this.hoverFrame)
    this.hoverFrame = null

    if (this.onLeave) this.onLeave()
    else this.hideTooltip()
  }

  onPlotClick = event => {
    const index = this.indexAt(event.clientX)
    if (index >= 0) this.onClick(this.primary.xs[index])
  }

  indexAt(clientX) {
    const primary = this.primary
    if (!primary?.xs.length || !this.plot) return -1

    const rect = this.plotEl.getBoundingClientRect()
    const px = clientX - rect.left
    const time =
      this.xMin + ((px - this.plot.left) / this.plotWidth) * (this.xMax - this.xMin)
    return nearestIndex(primary.xs, time)
  }

  handleHover() {
    const primary = this.primary
    const index = this.indexAt(this.pointerX)
    if (index < 0 || (index === this.index && !this.tooltipEl.hidden)) return

    if (this.onHover) this.onHover(index, primary.xs[index])
    else this.showIndex(index)
  }

  showTime(time) {
    const primary = this.primary
    if (!primary?.xs.length) return

    const first = primary.xs[0]
    const last = primary.xs[primary.xs.length - 1]
    if (time < first - POINT_TOLERANCE || time > last + POINT_TOLERANCE) {
      this.hideCursor()
      return
    }

    this.showIndex(nearestIndex(primary.xs, time))
  }

  showIndex(index, { force = false } = {}) {
    const primary = this.primary
    if (!this.plot || !primary || index == null || index >= primary.xs.length) return
    if (!force && index === this.index && !this.tooltipEl.hidden) return

    this.index = index
    const time = primary.xs[index]
    const cx = this.x(time)

    this.cursorEl.hidden = false
    this.cursorEl.style.transform = `translate3d(${cx.toFixed(1)}px, 0, 0)`
    this.cursorEl.style.top = `${this.plot.top}px`
    this.cursorEl.style.height = `${this.plotHeight}px`

    const rows = []
    this.series.forEach((series, i) => {
      const dot = this.dotEls[i]
      const pointIndex = series === primary ? index : nearestIndex(series.xs, time)
      const ys = series.type === 'range' ? series.ysHigh : series.ys
      const visible =
        series.visible !== false &&
        pointIndex >= 0 &&
        ys[pointIndex] != null &&
        Math.abs(series.xs[pointIndex] - time) < POINT_TOLERANCE

      dot.hidden = !visible || series.type === 'range'
      if (!visible) return

      rows.push({ series, pointIndex })
      if (dot.hidden) return

      const dx = this.x(series.xs[pointIndex]).toFixed(1)
      const dy = this.y(ys[pointIndex], this.axisFor(series)).toFixed(1)
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
    })

    this.renderTooltip(index, rows, cx)
  }

  renderTooltip(index, rows, cx) {
    if (!rows.length) {
      this.tooltipEl.hidden = true
      return
    }

    if (this.tooltipIndex !== index) {
      this.tooltipIndex = index
      const nodes = []
      const header = this.tooltipHeader?.(index)
      if (header) {
        const headerEl = el('div', 'ts-chart__tooltip-header')
        headerEl.textContent = header
        nodes.push(headerEl)
      }

      rows.forEach(({ series, pointIndex }) => {
        const row = el('div', 'ts-chart__tooltip-row')
        const swatch = el('span', 'ts-chart__tooltip-swatch')
        swatch.style.background = series.lineColor || series.color
        const value = document.createElement('b')
        value.textContent = series.value(pointIndex)
        row.append(swatch, document.createTextNode(`${series.name}: `), value)
        nodes.push(row)
      })

      this.tooltipEl.replaceChildren(...nodes)
    }

    const flip = cx > this.width * FLIP_THRESHOLD
    const tx = flip ? cx - TOOLTIP_OFFSET : cx + TOOLTIP_OFFSET
    this.tooltipEl.hidden = false
    this.tooltipEl.style.transform = `translate3d(${tx.toFixed(1)}px, ${this.plot.top}px, 0)${flip ? ' translateX(-100%)' : ''}`
  }

  hideTooltip() {
    this.tooltipEl.hidden = true
  }

  hideCursor() {
    this.index = null
    this.tooltipIndex = null
    this.cursorEl.hidden = true
    this.tooltipEl.hidden = true
    this.dotEls.forEach(dot => (dot.hidden = true))
  }

  destroy() {
    cancelAnimationFrame(this.hoverFrame)
    this.resizeObserver?.disconnect()
    this.plotEl.removeEventListener('pointerdown', this.onPointerDown)
    this.plotEl.removeEventListener('pointermove', this.onPointerMove)
    this.plotEl.removeEventListener('pointerleave', this.onPointerLeave)
    this.plotEl.removeEventListener('click', this.onPlotClick)
    this.titleEl?.remove()
    this.plotEl.remove()
    this.legendEl?.remove()
    this.container.classList.remove('ts-chart')
  }
}
