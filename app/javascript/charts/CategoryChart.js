import { svgEl } from './svg/elements'

const PADDING = { top: 8, right: 8, bottom: 20, left: 8 }
const MAX_COLUMN_WIDTH = 16
const COLUMN_RADIUS = 4
const MIN_LABEL_PX = 48
const TOOLTIP_OFFSET = 12
const FLIP_THRESHOLD = 0.6

const el = (tag, className) => {
  const node = document.createElement(tag)
  node.className = className
  return node
}

const niceMax = value => {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step =
    [1, 2, 2.5, 5, 10].find(factor => factor * magnitude >= value / 4) * magnitude
  return Math.ceil(value / step) * step
}

export default class CategoryChart {
  constructor(
    container,
    {
      title = null,
      categories,
      series,
      xLabels = true,
      yLabels = false,
      tooltipTitle = null
    }
  ) {
    this.container = container
    this.title = title
    this.categories = categories
    this.series = series.map(item => ({ type: 'column', format: String, ...item }))
    this.xLabels = xLabels
    this.yLabels = yLabels
    this.tooltipTitle = tooltipTitle || (index => this.categories[index])
    this.index = null

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
    this.highlightEl = el('div', 'category-chart__highlight')
    this.highlightEl.hidden = true
    this.tooltipEl = el('div', 'ts-chart__tooltip')
    this.tooltipEl.hidden = true
    this.plotEl.append(this.highlightEl, this.svg, this.tooltipEl)
    this.container.append(this.plotEl)

    this.plotEl.addEventListener('pointermove', this.onPointerMove)
    this.plotEl.addEventListener('pointerdown', this.onPointerMove)
    this.plotEl.addEventListener('pointerleave', this.onPointerLeave)
  }

  get columns() {
    return this.series.filter(series => series.type === 'column')
  }

  render() {
    const width = this.plotEl.clientWidth
    const height = this.plotEl.clientHeight
    if (!width || !height || !this.categories.length) return

    this.width = width
    this.plot = {
      left: PADDING.left + (this.yLabels ? 28 : 0),
      right: width - PADDING.right,
      top: PADDING.top,
      bottom: height - (this.xLabels ? PADDING.bottom : 2)
    }
    this.band = (this.plot.right - this.plot.left) / this.categories.length
    this.series.forEach(series => {
      const max = Math.max(...series.values.filter(value => value != null), 0)
      series.max = series.max ?? niceMax(max)
    })

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.svg.replaceChildren(
      ...this.gridNodes(),
      ...this.columnNodes(),
      ...this.lineNodes(),
      ...this.labelNodes()
    )

    if (this.index != null) this.show(this.index)
  }

  y(value, series) {
    return this.plot.bottom - (value / series.max) * (this.plot.bottom - this.plot.top)
  }

  center(index) {
    return this.plot.left + this.band * (index + 0.5)
  }

  gridNodes() {
    const nodes = [
      svgEl('line', {
        x1: this.plot.left,
        x2: this.plot.right,
        y1: this.plot.bottom,
        y2: this.plot.bottom,
        class: 'ts-chart__axis'
      })
    ]
    if (!this.yLabels) return nodes

    const series = this.series[0]
    for (let i = 1; i <= 4; i++) {
      const value = (series.max * i) / 4
      const gy = this.y(value, series).toFixed(1)
      nodes.push(
        svgEl('line', {
          x1: this.plot.left,
          x2: this.plot.right,
          y1: gy,
          y2: gy,
          class: 'ts-chart__grid'
        }),
        svgEl(
          'text',
          { x: PADDING.left, y: Number(gy) + 4, class: 'ts-chart__label' },
          series.format(Math.round(value))
        )
      )
    }
    return nodes
  }

  columnNodes() {
    const columns = this.columns
    if (!columns.length) return []

    const width = Math.min(MAX_COLUMN_WIDTH, (this.band * 0.8) / columns.length)
    const nodes = []

    columns.forEach((series, k) => {
      const offset = (k - (columns.length - 1) / 2) * width
      series.values.forEach((value, index) => {
        if (!value) return
        const top = this.y(value, series)
        nodes.push(
          svgEl('rect', {
            x: (this.center(index) + offset - width / 2 + 1).toFixed(1),
            y: top.toFixed(1),
            width: Math.max(width - 2, 1).toFixed(1),
            height: (this.plot.bottom - top).toFixed(1),
            rx: Math.min(COLUMN_RADIUS, width / 2),
            fill: series.color
          })
        )
      })
    })

    return nodes
  }

  lineNodes() {
    return this.series
      .filter(series => series.type === 'line')
      .map(series => {
        const d = series.values
          .map(
            (value, index) =>
              `${index ? 'L' : 'M'}${this.center(index).toFixed(1)} ${this.y(value ?? 0, series).toFixed(1)}`
          )
          .join('')
        return svgEl('path', { d, stroke: series.color, class: 'ts-chart__line' })
      })
  }

  labelNodes() {
    if (!this.xLabels) return []

    const every = Math.max(1, Math.ceil(MIN_LABEL_PX / this.band))
    return this.categories
      .map((category, index) =>
        index % every === 0
          ? svgEl(
              'text',
              {
                x: this.center(index).toFixed(1),
                y: this.plot.bottom + 14,
                class: 'ts-chart__label ts-chart__label--x'
              },
              category
            )
          : null
      )
      .filter(Boolean)
  }

  onPointerMove = event => {
    if (!this.plot) return

    const rect = this.plotEl.getBoundingClientRect()
    const index = Math.floor((event.clientX - rect.left - this.plot.left) / this.band)
    if (index < 0 || index >= this.categories.length) return this.onPointerLeave()
    if (index !== this.index || this.tooltipEl.hidden) this.show(index)
  }

  onPointerLeave = () => {
    this.index = null
    this.highlightEl.hidden = true
    this.tooltipEl.hidden = true
  }

  show(index) {
    this.index = index
    const left = this.plot.left + this.band * index

    this.highlightEl.hidden = false
    this.highlightEl.style.transform = `translate3d(${left.toFixed(1)}px, ${this.plot.top}px, 0)`
    this.highlightEl.style.width = `${this.band.toFixed(1)}px`
    this.highlightEl.style.height = `${this.plot.bottom - this.plot.top}px`

    const header = el('div', 'ts-chart__tooltip-header')
    header.textContent = this.tooltipTitle(index)
    const rows = this.series.map(series => {
      const row = el('div', 'ts-chart__tooltip-row')
      const swatch = el('span', 'ts-chart__tooltip-swatch')
      swatch.style.background = series.color
      const value = document.createElement('b')
      value.textContent = series.format(series.values[index] ?? 0)
      row.append(swatch, document.createTextNode(`${series.name}: `), value)
      return row
    })
    this.tooltipEl.replaceChildren(header, ...rows)

    const cx = this.center(index)
    const flip = cx > this.width * FLIP_THRESHOLD
    const tx = flip ? cx - TOOLTIP_OFFSET : cx + TOOLTIP_OFFSET
    this.tooltipEl.hidden = false
    this.tooltipEl.style.transform = `translate3d(${tx.toFixed(1)}px, ${this.plot.top}px, 0)${flip ? ' translateX(-100%)' : ''}`
  }

  destroy() {
    this.resizeObserver.disconnect()
    this.plotEl.removeEventListener('pointermove', this.onPointerMove)
    this.plotEl.removeEventListener('pointerdown', this.onPointerMove)
    this.plotEl.removeEventListener('pointerleave', this.onPointerLeave)
    this.titleEl?.remove()
    this.plotEl.remove()
    this.container.classList.remove('ts-chart')
  }
}
