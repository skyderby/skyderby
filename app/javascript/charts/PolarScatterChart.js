import { svgEl } from './svg/elements'

const ANGLE_STEP = 45
const LABEL_GAP = 12
const POINT_RADIUS = 4
const TOOLTIP_OFFSET = 12

const el = (tag, className) => {
  const node = document.createElement(tag)
  node.className = className
  return node
}

const toRadians = degrees => (degrees * Math.PI) / 180

export default class PolarScatterChart {
  constructor(
    container,
    { title = null, points, radiusMax, radiusStep = 1, radiusFormat = String, color }
  ) {
    this.container = container
    this.title = title
    this.points = points
    this.radiusMax = radiusMax
    this.radiusStep = radiusStep
    this.radiusFormat = radiusFormat
    this.color = color

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
    this.cx = width / 2
    this.cy = height / 2
    this.radius = Math.min(width, height) / 2 - LABEL_GAP - 8

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.svg.replaceChildren(...this.gridNodes(), ...this.pointNodes())
  }

  position(angle, value) {
    const r = (value / this.radiusMax) * this.radius
    const radians = toRadians(angle)
    return [this.cx + r * Math.sin(radians), this.cy - r * Math.cos(radians)]
  }

  gridNodes() {
    const nodes = []

    for (let value = this.radiusStep; value <= this.radiusMax; value += this.radiusStep) {
      const r = (value / this.radiusMax) * this.radius
      nodes.push(
        svgEl('circle', {
          cx: this.cx,
          cy: this.cy,
          r: r.toFixed(1),
          fill: 'none',
          class: 'ts-chart__grid'
        }),
        svgEl(
          'text',
          { x: this.cx + 2, y: (this.cy - r - 2).toFixed(1), class: 'ts-chart__label' },
          this.radiusFormat(value)
        )
      )
    }

    for (let angle = 0; angle < 360; angle += ANGLE_STEP) {
      const [x, y] = this.position(angle, this.radiusMax)
      const [lx, ly] = this.position(
        angle,
        this.radiusMax * (1 + LABEL_GAP / this.radius)
      )
      nodes.push(
        svgEl('line', {
          x1: this.cx,
          y1: this.cy,
          x2: x.toFixed(1),
          y2: y.toFixed(1),
          class: 'ts-chart__grid'
        }),
        svgEl(
          'text',
          {
            x: lx.toFixed(1),
            y: (ly + 4).toFixed(1),
            'text-anchor': 'middle',
            class: 'ts-chart__label'
          },
          `${angle}°`
        )
      )
    }

    return nodes
  }

  pointNodes() {
    return this.points.flatMap((point, index) => {
      const [x, y] = this.position(point.angle, point.radius)
      const nodes = [
        svgEl('circle', {
          cx: x.toFixed(1),
          cy: y.toFixed(1),
          r: POINT_RADIUS,
          fill: this.color,
          class: 'polar-chart__point',
          'data-point': index
        })
      ]
      if (point.label) {
        nodes.push(
          svgEl(
            'text',
            {
              x: (x + POINT_RADIUS + 2).toFixed(1),
              y: (y + 4).toFixed(1),
              class: 'ts-chart__label'
            },
            point.label
          )
        )
      }
      return nodes
    })
  }

  onPointerMove = event => {
    const index = event.target.dataset?.point
    if (index == null) return this.onPointerLeave()

    const point = this.points[Number(index)]
    if (this.activePoint !== index) {
      this.activePoint = index
      this.tooltipEl.replaceChildren(
        ...point.tooltip.map(([label, value]) => {
          const row = el('div', 'ts-chart__tooltip-row')
          const strong = document.createElement('b')
          strong.textContent = `${label}: `
          row.append(strong, document.createTextNode(value))
          return row
        })
      )
    }

    const rect = this.plotEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const flip = x > this.width / 2
    this.tooltipEl.hidden = false
    this.tooltipEl.style.transform = `translate3d(${(flip ? x - TOOLTIP_OFFSET : x + TOOLTIP_OFFSET).toFixed(1)}px, ${(y + TOOLTIP_OFFSET).toFixed(1)}px, 0)${flip ? ' translateX(-100%)' : ''}`
  }

  onPointerLeave = () => {
    this.activePoint = null
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
