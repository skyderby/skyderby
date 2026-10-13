import { svgEl } from './svg/elements'

const LABEL_OFFSET = 14
const TOOLTIP_OFFSET = 12

const el = (tag, className) => {
  const node = document.createElement(tag)
  node.className = className
  return node
}

const polar = (cx, cy, radius, angle) => [
  cx + radius * Math.sin(angle),
  cy - radius * Math.cos(angle)
]

const f = value => value.toFixed(1)

const arc = (cx, cy, radius, from, to, sweepFlag) => {
  const middle = (from + to) / 2
  const [mx, my] = polar(cx, cy, radius, middle)
  const [ex, ey] = polar(cx, cy, radius, to)
  return (
    `A${radius} ${radius} 0 0 ${sweepFlag} ${f(mx)} ${f(my)}` +
    `A${radius} ${radius} 0 0 ${sweepFlag} ${f(ex)} ${f(ey)}`
  )
}

const arcPath = (cx, cy, inner, outer, start, end) => {
  const [x1, y1] = polar(cx, cy, outer, start)
  const [x3, y3] = polar(cx, cy, inner, end)

  if (inner <= 0) {
    return `M${f(cx)} ${f(cy)}L${f(x1)} ${f(y1)}${arc(cx, cy, outer, start, end, 1)}Z`
  }

  return (
    `M${f(x1)} ${f(y1)}${arc(cx, cy, outer, start, end, 1)}` +
    `L${f(x3)} ${f(y3)}${arc(cx, cy, inner, end, start, 0)}Z`
  )
}

export default class DonutChart {
  constructor(container, { title = null, rings, valueSuffix = '' }) {
    this.container = container
    this.title = title
    this.rings = rings
    this.valueSuffix = valueSuffix

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
    this.tooltipEl = el('div', 'ts-chart__tooltip')
    this.tooltipEl.hidden = true
    this.plotEl.append(this.svg, this.tooltipEl)
    this.container.append(this.plotEl)

    this.svg.addEventListener('pointermove', this.onPointerMove)
    this.svg.addEventListener('pointerleave', this.onPointerLeave)
  }

  render() {
    const width = this.plotEl.clientWidth
    const height = this.plotEl.clientHeight
    if (!width || !height) return

    this.width = width
    const cx = width / 2
    const cy = height / 2
    const radius = Math.min(width, height) / 2 - 8
    const nodes = []
    const labels = []

    this.slices = []
    this.rings.forEach((ring, ringIndex) => {
      const total = ring.data.reduce((sum, item) => sum + item.value, 0) || 1
      const inner = radius * ring.inner
      const outer = radius * ring.outer
      let angle = 0

      ring.data.forEach(item => {
        const sweep = (item.value / total) * Math.PI * 2
        const sliceIndex = this.slices.length
        this.slices.push({ ring, item })

        nodes.push(
          svgEl('path', {
            d: arcPath(cx, cy, inner, outer, angle, angle + sweep),
            fill: item.color,
            class: 'donut-chart__slice',
            'data-slice': sliceIndex,
            'data-ring': ringIndex
          })
        )

        const label = ring.label?.(item)
        if (label) {
          const middle = angle + sweep / 2
          const labelRadius = ring.labelInside
            ? (inner + outer) / 2
            : outer + LABEL_OFFSET
          const [lx, ly] = polar(cx, cy, labelRadius, middle)
          const anchor = ring.labelInside ? 'middle' : middle < Math.PI ? 'start' : 'end'
          labels.push(
            svgEl(
              'text',
              {
                x: lx.toFixed(1),
                y: (ly + 4).toFixed(1),
                'text-anchor': anchor,
                class: ring.labelInside
                  ? 'donut-chart__label donut-chart__label--inside'
                  : 'donut-chart__label'
              },
              label
            )
          )
        }

        angle += sweep
      })
    })

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.svg.replaceChildren(...nodes, ...labels)
  }

  onPointerMove = event => {
    const sliceIndex = event.target.dataset?.slice
    if (sliceIndex == null) return this.onPointerLeave()

    const { ring, item } = this.slices[Number(sliceIndex)]
    if (this.activeSlice !== sliceIndex) {
      this.activeSlice = sliceIndex
      const header = el('div', 'ts-chart__tooltip-header')
      header.textContent = ring.name
      const row = el('div', 'ts-chart__tooltip-row')
      const swatch = el('span', 'ts-chart__tooltip-swatch')
      swatch.style.background = item.color
      const value = document.createElement('b')
      value.textContent = `${item.value}${this.valueSuffix}`
      row.append(swatch, document.createTextNode(`${item.name}: `), value)
      this.tooltipEl.replaceChildren(header, row)
    }

    const rect = this.plotEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const flip = x > this.width / 2
    this.tooltipEl.hidden = false
    this.tooltipEl.style.transform = `translate3d(${(flip ? x - TOOLTIP_OFFSET : x + TOOLTIP_OFFSET).toFixed(1)}px, ${(y + TOOLTIP_OFFSET).toFixed(1)}px, 0)${flip ? ' translateX(-100%)' : ''}`
  }

  onPointerLeave = () => {
    this.activeSlice = null
    this.tooltipEl.hidden = true
  }

  destroy() {
    this.resizeObserver.disconnect()
    this.svg.removeEventListener('pointermove', this.onPointerMove)
    this.svg.removeEventListener('pointerleave', this.onPointerLeave)
    this.titleEl?.remove()
    this.plotEl.remove()
    this.container.classList.remove('ts-chart')
  }
}
