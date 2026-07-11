import { Controller } from '@hotwired/stimulus'

export const SVG_NS = 'http://www.w3.org/2000/svg'

export const AXIS_LEFT = 62 // viewBox units reserved for the altitude axis
export const MARGIN_TOP = 28
export const MARGIN_BOTTOM = 42 // room for the distance axis
export const MARGIN_RIGHT = 34
export const PLOT_H = 560 // viewBox units for the vertical (altitude) span
export const ALT_STEP = 500 // metres between altitude gridlines
export const STEPS = [50, 100, 200, 250, 500, 1000] // candidate distance gridline steps

// Shared side-view replay plumbing: the SVG primitives, altitude axis, marker,
// trail, window-end line, and the active-slide observer. Subclasses provide
// prepare()/buildScene()/x()/frame()/reset()/render() with their discipline
// specifics.
export default class extends Controller {
  disconnect() {
    this.stop()
    if (this.observer) this.observer.disconnect()
  }

  y(alt) {
    const clamped = Math.max(this.bottomAlt, Math.min(this.topAlt, alt))
    return MARGIN_TOP + (this.topAlt - clamped) * this.scale
  }

  buildMarker(svg, faller) {
    const group = this.el('g', { class: 'display-fall-marker' })
    const glow = this.el('circle', { r: 17, fill: faller.color, opacity: 0.16 })
    const dot = this.el('circle', {
      r: 11,
      fill: faller.color,
      stroke: '#06080d',
      'stroke-width': 1.5
    })

    group.append(glow, dot)
    svg.appendChild(group)
    return group
  }

  drawFinish(svg) {
    const y = this.y(this.bottomAlt)
    this.line(svg, AXIS_LEFT, y, AXIS_LEFT + this.plotW, y, {
      stroke: '#ff5a52',
      'stroke-width': 2,
      'stroke-dasharray': '7 6'
    })
    this.text(
      svg,
      AXIS_LEFT + this.plotW,
      y - 8,
      this.element.dataset.finishLabel || 'WINDOW END',
      'display-fall-finish-label',
      'end'
    )
  }

  updateTrail(faller, tt, head) {
    let points = ''
    for (const p of faller.points) {
      if (p.t > tt) break
      points += `${this.x(p.x)},${this.y(p.alt)} `
    }
    points += `${this.x(head.x)},${this.y(head.alt)}`
    faller.trail.setAttribute('points', points)
  }

  observeActive() {
    this.active = this.element.classList.contains('is-active')
    this.observer = new MutationObserver(() => {
      const nowActive = this.element.classList.contains('is-active')
      if (nowActive === this.active) return
      this.active = nowActive
      if (nowActive) this.start()
      else this.stop()
    })
    this.observer.observe(this.element, { attributes: true, attributeFilter: ['class'] })
    if (this.active) this.start()
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  line(svg, x1, y1, x2, y2, attrs) {
    svg.appendChild(this.el('line', { x1, y1, x2, y2, ...attrs }))
  }

  text(svg, x, y, content, className, anchor) {
    const node = this.el('text', { x, y, 'text-anchor': anchor, class: className })
    node.textContent = content
    svg.appendChild(node)
  }

  el(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag)
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value))
    return node
  }
}
