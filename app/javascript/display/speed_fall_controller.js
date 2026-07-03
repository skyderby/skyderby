import { Controller } from '@hotwired/stimulus'

const SVG_NS = 'http://www.w3.org/2000/svg'

const COUNTDOWN = 3 // seconds
const RACE_WINDOW = 16 // seconds of wall-clock the descent is compressed into
const HOLD = 4 // seconds to hold the result before the slide advances

const VIEW_W = 1200
const PLOT_X = 118
const PLOT_TOP = 44
const PLOT_BOTTOM = 584
const PLOT_W = VIEW_W - PLOT_X - 24
const PLOT_H = PLOT_BOTTOM - PLOT_TOP
const GRID_STEP = 500 // metres between altitude gridlines

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

  // Sync every faller by window start (t = 0 is their window entry) and work out
  // the shared altitude scale and how fast to compress the descent.
  prepare() {
    this.fallers = this.fallers.filter(f => f.points && f.points.length >= 2)
    if (this.fallers.length === 0) return

    this.topAlt = Math.max(...this.fallers.map(f => f.points[0].alt))
    this.bottomAlt = Math.min(...this.fallers.map(f => f.windowEnd))
    if (this.topAlt <= this.bottomAlt) this.topAlt = this.bottomAlt + GRID_STEP

    this.maxT = Math.max(...this.fallers.map(f => f.points[f.points.length - 1].t))
    this.rate = Math.max(1, this.maxT / RACE_WINDOW)
    this.laneWidth = PLOT_W / this.fallers.length
    this.ready = true
  }

  y(alt) {
    const clamped = Math.max(this.bottomAlt, Math.min(this.topAlt, alt))
    return PLOT_TOP + ((this.topAlt - clamped) / (this.topAlt - this.bottomAlt)) * PLOT_H
  }

  laneX(index) {
    return PLOT_X + this.laneWidth * (index + 0.5)
  }

  buildScene() {
    if (!this.ready) return

    const svg = this.svgTarget
    svg.innerHTML = ''

    this.drawGrid(svg)
    this.drawFinish(svg)

    this.fallers.forEach((faller, index) => {
      const x = this.laneX(index)

      this.line(svg, x, PLOT_TOP, x, PLOT_BOTTOM, {
        stroke: 'rgba(255,255,255,0.08)',
        'stroke-width': 2
      })

      faller.trail = this.el('polyline', {
        fill: 'none',
        stroke: faller.color,
        'stroke-width': 3,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: 0.55
      })
      svg.appendChild(faller.trail)

      faller.marker = this.buildMarker(svg, faller)
    })

    this.reset()
  }

  drawGrid(svg) {
    const start = Math.ceil(this.bottomAlt / GRID_STEP) * GRID_STEP
    for (let alt = start; alt < this.topAlt; alt += GRID_STEP) {
      const y = this.y(alt)
      this.line(svg, PLOT_X, y, PLOT_X + PLOT_W, y, {
        stroke: 'rgba(255,255,255,0.06)',
        'stroke-width': 1
      })
      const label = this.el('text', {
        x: PLOT_X - 14,
        y: y + 5,
        'text-anchor': 'end',
        class: 'display-fall-axis'
      })
      label.textContent = `${Math.round(alt)}`
      svg.appendChild(label)
    }
  }

  drawFinish(svg) {
    const y = this.y(this.bottomAlt)
    this.line(svg, PLOT_X, y, PLOT_X + PLOT_W, y, {
      stroke: '#ff5a52',
      'stroke-width': 3,
      'stroke-dasharray': '10 8'
    })
    const label = this.el('text', {
      x: PLOT_X + PLOT_W,
      y: y - 12,
      'text-anchor': 'end',
      class: 'display-fall-finish-label'
    })
    label.textContent = this.element.dataset.finishLabel || 'WINDOW END'
    svg.appendChild(label)
  }

  buildMarker(svg, faller) {
    const group = this.el('g', { class: 'display-fall-marker' })

    const glow = this.el('circle', { r: 20, fill: faller.color, opacity: 0.18 })
    const dot = this.el('circle', {
      r: 14,
      fill: faller.color,
      stroke: '#06080d',
      'stroke-width': 2
    })
    const bib = this.el('text', {
      'text-anchor': 'middle',
      y: 5,
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
      this.place(faller, faller.points[0])
      this.renderCard(index, faller.points[0], faller)
    })
    this.hideCountdown()
  }

  frame(now) {
    this.raf = requestAnimationFrame(t => this.frame(t))
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000)
    this.lastFrame = now

    if (this.phase === 'countdown') {
      this.countdownLeft -= dt
      this.showCountdown(this.countdownLeft)
      if (this.countdownLeft <= 0) {
        this.hideCountdown()
        this.phase = 'running'
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
      const at = finished ? last : this.interpolate(faller.points, this.playerT)

      this.place(faller, at)
      this.updateTrail(faller, at)
      this.renderCard(index, at, faller)

      if (finished && !faller.finished) {
        faller.finished = true
        if (this.cardTargets[index]) this.cardTargets[index].classList.add('is-finished')
      }
    })
  }

  place(faller, at) {
    if (!faller.marker) return
    const x = this.laneX(this.fallers.indexOf(faller))
    faller.marker.setAttribute('transform', `translate(${x}, ${this.y(at.alt)})`)
  }

  updateTrail(faller, at) {
    const x = this.laneX(this.fallers.indexOf(faller))
    let points = ''
    for (const p of faller.points) {
      if (p.t > this.playerT) break
      points += `${x},${this.y(p.alt)} `
    }
    points += `${x},${this.y(at.alt)}`
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
    const n = Math.ceil(remaining)
    this.countTextTarget.textContent = n > 0 ? String(n) : 'GO'
  }

  hideCountdown() {
    this.countdownTarget.hidden = true
  }

  line(svg, x1, y1, x2, y2, attrs) {
    svg.appendChild(this.el('line', { x1, y1, x2, y2, ...attrs }))
  }

  el(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag)
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value))
    return node
  }
}
