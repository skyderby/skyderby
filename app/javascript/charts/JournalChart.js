const SVG_NS = 'http://www.w3.org/2000/svg'
const MARGIN = { top: 12, right: 14, bottom: 26, left: 44 }
const SERIES_COUNT = 6

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

const niceTicks = (min, max, count = 5) => {
  const span = max - min || 1
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const ticks = []
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-6; t += step) ticks.push(t)
  return ticks
}

const runningBest = (values, higherIsBetter, rank) => {
  const direction = higherIsBetter ? (a, b) => b - a : (a, b) => a - b
  const top = []
  return values.map(value => {
    top.push(value)
    top.sort(direction)
    if (top.length > rank) top.length = rank
    return top.length >= rank ? top[rank - 1] : null
  })
}

export default class JournalChart {
  constructor(host, data, { formatValue } = {}) {
    this.host = host
    this.data = data
    this.formatValue = formatValue || (value => String(value))
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'journal-chart__tooltip'
    this.tooltip.hidden = true
    this.host.appendChild(this.tooltip)
    this.onOver = this.onOver.bind(this)
    this.onOut = this.onOut.bind(this)
  }

  render() {
    const rect = this.host.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 600
    const height = rect.height > 0 ? rect.height : 160

    const points = this.data.series.flatMap(s => s.points)
    if (this.svg) this.svg.remove()
    if (!points.length) return

    const xMax = Math.max(...points.map(p => p.x))
    const ys = points.map(p => p.y)
    let yMin = Math.min(...ys)
    let yMax = Math.max(...ys)
    if (yMax - yMin < 1e-6) yMax = yMin + 1
    const pad = (yMax - yMin) * 0.08
    yMin -= pad
    yMax += pad

    const plotW = width - MARGIN.left - MARGIN.right
    const plotH = height - MARGIN.top - MARGIN.bottom
    const x = v => MARGIN.left + (xMax <= 1 ? plotW / 2 : (plotW * (v - 1)) / (xMax - 1))
    const invertY = !this.data.higherIsBetter
    const y = v => {
      const frac = (v - yMin) / (yMax - yMin)
      return MARGIN.top + plotH * (invertY ? frac : 1 - frac)
    }

    const svg = svgEl('svg', {
      viewBox: `0 0 ${width} ${height}`,
      class: 'journal-chart__svg'
    })

    this.renderAxes(svg, { x, y, xMax, yMin, yMax, plotW, plotH, width })
    this.data.series.forEach((series, index) =>
      this.renderSeries(svg, series, index, { x, y })
    )

    svg.addEventListener('pointerover', this.onOver)
    svg.addEventListener('pointerout', this.onOut)

    this.host.insertBefore(svg, this.tooltip)
    this.svg = svg

    this.renderLegend()
  }

  renderLegend() {
    if (this.legend) this.legend.remove()
    if (this.data.series.length < 2 || !this.data.series.some(series => series.label))
      return

    const legend = document.createElement('div')
    legend.className = 'journal-chart__legend'
    legend.innerHTML = this.data.series
      .map((series, index) =>
        series.label
          ? '<span class="journal-chart__legend-item">' +
            `<span class="journal-chart__legend-swatch journal-series-${index % SERIES_COUNT}"></span>` +
            `${escapeHtml(series.label)}</span>`
          : ''
      )
      .join('')
    this.host.appendChild(legend)
    this.legend = legend
  }

  renderAxes(svg, { x, y, xMax, yMin, yMax, plotW, plotH, width }) {
    svg.appendChild(
      svgEl('line', {
        class: 'journal-chart__axis',
        x1: MARGIN.left,
        y1: MARGIN.top + plotH,
        x2: MARGIN.left + plotW,
        y2: MARGIN.top + plotH
      })
    )

    niceTicks(yMin, yMax, 4).forEach(value => {
      const gy = y(value)
      svg.appendChild(
        svgEl('line', {
          class: 'journal-chart__grid',
          x1: MARGIN.left,
          y1: gy,
          x2: width - MARGIN.right,
          y2: gy
        })
      )
      const label = svgEl('text', {
        class: 'journal-chart__tick journal-chart__tick--y',
        x: MARGIN.left - 6,
        y: gy + 3
      })
      label.textContent = this.formatValue(value)
      svg.appendChild(label)
    })

    const xStep = Math.max(1, Math.ceil(xMax / 12))
    for (let attempt = 1; attempt <= xMax; attempt += xStep) {
      const label = svgEl('text', {
        class: 'journal-chart__tick journal-chart__tick--x',
        x: x(attempt),
        y: MARGIN.top + plotH + 16
      })
      label.textContent = attempt
      svg.appendChild(label)
    }
  }

  renderSeries(svg, series, index, { x, y }) {
    const cls = `journal-series-${index % SERIES_COUNT}`
    const values = series.points.map(p => p.y)

    this.renderLine(
      svg,
      series.points,
      runningBest(values, this.data.higherIsBetter, 1),
      { x, y },
      `journal-chart__best ${cls}`
    )
    this.renderLine(
      svg,
      series.points,
      runningBest(values, this.data.higherIsBetter, 3),
      { x, y },
      `journal-chart__third ${cls}`
    )

    series.points.forEach(point => {
      const dot = svgEl('circle', {
        class: `journal-chart__dot ${cls}`,
        cx: x(point.x),
        cy: y(point.y),
        r: 4
      })
      dot.setAttribute('data-track-compare-target', 'row')
      dot.setAttribute(
        'data-action',
        'click->track-compare#selectRow click->journal#openTrack'
      )
      dot.dataset.trackId = point.trackId
      dot.dataset.trackUrl = point.trackUrl || ''
      dot.dataset.pilot = this.data.pilot
      dot.dataset.result = `${this.formatValue(point.y)} ${this.data.unit}`
      dot.dataset.kind = this.data.kind
      dot.dataset.date = point.date
      dot.dataset.suit = point.suit || ''
      dot.dataset.place = point.place || ''
      dot.dataset.comment = point.comment || ''
      svg.appendChild(dot)
    })
  }

  renderLine(svg, points, line, { x, y }, className) {
    const steps = []
    let prev = null
    points.forEach((point, i) => {
      const value = line[i]
      if (value == null) return
      if (prev == null) steps.push(`M${x(point.x).toFixed(1)} ${y(value).toFixed(1)}`)
      else
        steps.push(
          `L${x(point.x).toFixed(1)} ${y(prev).toFixed(1)} L${x(point.x).toFixed(1)} ${y(value).toFixed(1)}`
        )
      prev = value
    })
    if (steps.length < 2) return
    svg.appendChild(svgEl('path', { class: className, d: steps.join(' '), fill: 'none' }))
  }

  onOver(event) {
    const dot = event.target
    if (!dot.classList || !dot.classList.contains('journal-chart__dot')) return

    if (this.hoveredDot && this.hoveredDot !== dot)
      this.hoveredDot.classList.remove('is-hovered')
    dot.classList.add('is-hovered')
    this.hoveredDot = dot

    const rect = this.host.getBoundingClientRect()
    this.tooltip.innerHTML = this.tooltipHtml(dot.dataset)
    this.tooltip.hidden = false
    this.tooltip.style.left = `${event.clientX - rect.left}px`
    this.tooltip.style.top = `${event.clientY - rect.top}px`
  }

  tooltipHtml(data) {
    const rows = [
      `<span class="journal-chart__tooltip-main"><b>${escapeHtml(data.result)}</b>` +
        `<span class="journal-chart__tooltip-date">${escapeHtml(data.date)}</span></span>`
    ]
    if (data.suit) rows.push(`<span>${data.suit}</span>`)
    if (data.place) rows.push(`<span>${data.place}</span>`)
    if (data.comment)
      rows.push(
        `<span class="journal-chart__tooltip-comment">${escapeHtml(data.comment)}</span>`
      )
    return rows.join('')
  }

  onOut(event) {
    const dot = event.target
    if (!dot.classList || !dot.classList.contains('journal-chart__dot')) return
    dot.classList.remove('is-hovered')
    if (this.hoveredDot === dot) this.hoveredDot = null
    this.tooltip.hidden = true
  }

  destroy() {
    if (this.svg) {
      this.svg.removeEventListener('pointerover', this.onOver)
      this.svg.removeEventListener('pointerout', this.onOut)
      this.svg.remove()
    }
    if (this.legend) this.legend.remove()
    this.tooltip.remove()
  }
}
