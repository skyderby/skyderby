import { Controller } from '@hotwired/stimulus'

const SVG_NS = 'http://www.w3.org/2000/svg'

const COUNTDOWN = 3 // seconds
const RACE_WINDOW = 16 // seconds of wall-clock the descent is compressed into
const HOLD = 4 // seconds to hold the result before the slide advances

const AXIS_LEFT = 62 // viewBox units reserved for the altitude axis
const MARGIN_TOP = 28
const MARGIN_BOTTOM = 42 // room for the distance axis
const MARGIN_RIGHT = 34
const PLOT_H = 560 // viewBox units for the vertical (altitude) span
const ALT_STEP = 500 // metres between altitude gridlines
const STEPS = [50, 100, 200, 250, 500, 1000] // candidate distance gridline steps

export default class extends Controller {
  static targets = [
    'data',
    'svg',
    'card',
    'speed',
    'accel',
    'altitude',
    'remaining',
    'countdown',
    'countText'
  ]

  connect() {
    this.fallers = JSON.parse(this.dataTarget.textContent)
    this.prepare()
    this.buildScene()
    this.observeActive()
  }

  disconnect() {
    this.stop()
    if (this.observer) this.observer.disconnect()
  }

  // Sync every faller by window start (t = 0 is their window entry) and build a
  // true-scale side view: the same metres-per-unit applies to both axes, so the
  // plot is honestly narrow rather than horizontally stretched.
  prepare() {
    this.fallers = this.fallers.filter(f => f.points && f.points.length >= 2)
    if (this.fallers.length === 0) return

    this.topAlt = Math.max(...this.fallers.map(f => f.points[0].alt))
    this.bottomAlt = Math.min(...this.fallers.map(f => f.windowEnd))
    if (this.topAlt <= this.bottomAlt) this.topAlt = this.bottomAlt + ALT_STEP

    this.maxX = Math.max(...this.fallers.map(f => f.points[f.points.length - 1].x), 1)
    this.maxT = Math.max(...this.fallers.map(f => f.points[f.points.length - 1].t))
    this.rate = Math.max(1, this.maxT / RACE_WINDOW)

    this.scale = PLOT_H / (this.topAlt - this.bottomAlt)
    this.plotW = this.maxX * this.scale
    this.vbW = AXIS_LEFT + this.plotW + MARGIN_RIGHT
    this.vbH = MARGIN_TOP + PLOT_H + MARGIN_BOTTOM
    this.ready = true
  }

  x(metres) {
    return AXIS_LEFT + metres * this.scale
  }

  y(alt) {
    const clamped = Math.max(this.bottomAlt, Math.min(this.topAlt, alt))
    return MARGIN_TOP + (this.topAlt - clamped) * this.scale
  }

  buildScene() {
    if (!this.ready) return

    const svg = this.svgTarget
    svg.setAttribute('viewBox', `0 0 ${this.vbW} ${this.vbH}`)
    svg.innerHTML = ''

    this.drawGrid(svg)
    this.drawFinish(svg)

    this.fallers.forEach(faller => {
      faller.trail = this.el('polyline', {
        fill: 'none',
        stroke: faller.color,
        'stroke-width': 3,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: 0.95
      })
      svg.appendChild(faller.trail)
      faller.marker = this.buildMarker(svg, faller)
    })

    this.reset()
  }

  drawGrid(svg) {
    const right = AXIS_LEFT + this.plotW
    const bottom = MARGIN_TOP + PLOT_H

    const startAlt = Math.ceil(this.bottomAlt / ALT_STEP) * ALT_STEP
    for (let alt = startAlt; alt < this.topAlt; alt += ALT_STEP) {
      const y = this.y(alt)
      this.line(svg, AXIS_LEFT, y, right, y, {
        stroke: 'rgba(255,255,255,0.06)',
        'stroke-width': 0.8
      })
      this.text(
        svg,
        AXIS_LEFT - 8,
        y + 4,
        `${Math.round(alt)}`,
        'display-fall-axis',
        'end'
      )
    }

    const xStep = STEPS.find(step => this.maxX / step <= 2) || 1000
    for (let dist = 0; dist <= this.maxX + 1; dist += xStep) {
      const x = this.x(dist)
      this.line(svg, x, MARGIN_TOP, x, bottom, {
        stroke: 'rgba(255,255,255,0.05)',
        'stroke-width': 0.8
      })
      this.text(svg, x, bottom + 20, `${dist}`, 'display-fall-axis', 'middle')
    }
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

  buildMarker(svg, faller) {
    const group = this.el('g', { class: 'display-fall-marker' })
    const glow = this.el('circle', { r: 17, fill: faller.color, opacity: 0.16 })
    const dot = this.el('circle', {
      r: 11,
      fill: faller.color,
      stroke: '#06080d',
      'stroke-width': 1.5
    })
    const bib = this.el('text', {
      'text-anchor': 'middle',
      y: 4,
      class: 'display-fall-bib-text'
    })
    bib.textContent = faller.bib

    group.append(glow, dot, bib)
    svg.appendChild(group)
    return group
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

  start() {
    if (!this.ready) return
    this.stop()
    this.reset()
    this.phase = 'countdown'
    this.countdownLeft = COUNTDOWN
    this.playerT = 0
    this.doneAt = null
    this.lastFrame = performance.now()
    this.raf = requestAnimationFrame(t => this.frame(t))
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  reset() {
    if (!this.ready) return
    this.cardTargets.forEach(card => card.classList.remove('is-finished'))
    this.fallers.forEach((faller, index) => {
      faller.finished = false
      const first = faller.points[0]
      faller.marker.setAttribute(
        'transform',
        `translate(${this.x(first.x)}, ${this.y(first.alt)})`
      )
      faller.trail.setAttribute('points', `${this.x(first.x)},${this.y(first.alt)}`)
      this.renderCard(index, first, faller)
    })
    this.hideCountdown()
  }

  frame(now) {
    this.raf = requestAnimationFrame(t => this.frame(t))
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000)
    this.lastFrame = now

    if (this.phase === 'countdown') {
      this.countdownLeft -= dt
      if (this.countdownLeft <= 0) {
        this.hideCountdown()
        this.phase = 'running'
      } else {
        this.showCountdown(this.countdownLeft)
      }
      return
    }

    this.playerT += dt * this.rate
    this.render()

    if (this.playerT >= this.maxT) {
      if (this.doneAt == null) this.doneAt = now
      else if (now - this.doneAt > HOLD * 1000) this.stop()
    }
  }

  render() {
    this.fallers.forEach((faller, index) => {
      const last = faller.points[faller.points.length - 1]
      const finished = this.playerT >= last.t
      const tt = Math.min(this.playerT, last.t)
      const at = finished ? last : this.interpolate(faller.points, tt)

      faller.marker.setAttribute(
        'transform',
        `translate(${this.x(at.x)}, ${this.y(at.alt)})`
      )
      this.updateTrail(faller, tt, at)
      this.renderCard(index, at, faller)

      if (finished && !faller.finished) {
        faller.finished = true
        if (this.cardTargets[index]) this.cardTargets[index].classList.add('is-finished')
      }
    })
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

  renderCard(index, at, faller) {
    if (this.speedTargets[index])
      this.speedTargets[index].textContent = Math.round(at.speed)
    if (this.accelTargets[index]) {
      const a = at.accel || 0
      this.accelTargets[index].textContent = `${a >= 0 ? '+' : ''}${a.toFixed(1)}`
    }
    if (this.altitudeTargets[index])
      this.altitudeTargets[index].textContent = Math.round(at.alt)
    if (this.remainingTargets[index]) {
      this.remainingTargets[index].textContent = Math.max(
        0,
        Math.round(at.alt - faller.windowEnd)
      )
    }
  }

  interpolate(points, t) {
    if (t <= points[0].t) return points[0]
    const last = points[points.length - 1]
    if (t >= last.t) return last

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]
      if (t >= curr.t && t < next.t) {
        const f = (t - curr.t) / (next.t - curr.t)
        return {
          x: curr.x + (next.x - curr.x) * f,
          alt: curr.alt + (next.alt - curr.alt) * f,
          speed: curr.speed + (next.speed - curr.speed) * f,
          accel: curr.accel + (next.accel - curr.accel) * f
        }
      }
    }
    return last
  }

  showCountdown(remaining) {
    if (this.countdownTarget.hidden) this.countdownTarget.hidden = false
    this.countTextTarget.textContent = String(Math.ceil(remaining))
  }

  hideCountdown() {
    this.countdownTarget.hidden = true
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
