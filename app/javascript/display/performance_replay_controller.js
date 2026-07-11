import SideViewReplayController, {
  AXIS_LEFT,
  MARGIN_TOP,
  MARGIN_BOTTOM,
  MARGIN_RIGHT,
  PLOT_H,
  ALT_STEP,
  STEPS
} from './side_view_replay_controller'

const COUNTDOWN = 5 // number the countdown starts from as the approach flies in
const GO_HOLD = 700 // ms to keep "Go!" on screen after the window opens
const RACE_WINDOW = 16 // seconds of wall-clock the descent is compressed into (speed)
const REALTIME_END = 5 // time/distance: real time until this many seconds into the window
const FAST_RATE = 3 // then play the rest at 3x
const HOLD = 4 // seconds to hold the result before the slide advances

export default class extends SideViewReplayController {
  static targets = [
    'data',
    'svg',
    'card',
    'result',
    'vspeed',
    'hspeed',
    'glide',
    'altitude',
    'remaining',
    'countdown',
    'countText'
  ]

  static values = {
    discipline: String,
    windowStart: Number,
    windowEnd: Number
  }

  connect() {
    this.fallers = JSON.parse(this.dataTarget.textContent)
    this.prepare()
    this.buildScene()
    this.observeActive()
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

    // x is zeroed at the window entry, so lead-in x is negative and the window
    // entry of every track lines up at x = 0.
    this.minX = Math.min(...this.fallers.map(f => f.points[0].x), 0)
    this.maxX = Math.max(...this.fallers.map(f => f.points[f.points.length - 1].x), 1)
    this.maxT = Math.max(...this.fallers.map(f => f.points[f.points.length - 1].t))
    // t = 0 is the window entry; lead-in points carry negative t, so playback
    // starts a few seconds before the window opens.
    this.minT = Math.min(...this.fallers.map(f => f.points[0].t))
    this.rate = Math.max(1, (this.maxT - this.minT) / RACE_WINDOW)

    // Time & distance play in real time through the window entry, then 2x for
    // the long tail — and the slide is held open exactly as long as that takes.
    this.realtime = this.disciplineValue === 'time' || this.disciplineValue === 'distance'
    if (this.realtime) {
      const realSeconds = Math.min(this.maxT, REALTIME_END) - this.minT
      const fastSeconds = Math.max(0, this.maxT - REALTIME_END) / FAST_RATE
      this.element.dataset.slideshowDuration = String(
        Math.ceil(realSeconds + fastSeconds + HOLD)
      )
    }

    this.scale = PLOT_H / (this.topAlt - this.bottomAlt)
    this.plotW = (this.maxX - this.minX) * this.scale
    this.vbW = AXIS_LEFT + this.plotW + MARGIN_RIGHT
    this.vbH = MARGIN_TOP + PLOT_H + MARGIN_BOTTOM
    this.ready = true
  }

  x(metres) {
    return AXIS_LEFT + (metres - this.minX) * this.scale
  }

  buildScene() {
    if (!this.ready) return

    const svg = this.svgTarget
    svg.setAttribute('viewBox', `0 0 ${this.vbW} ${this.vbH}`)
    svg.innerHTML = ''

    this.drawGrid(svg)
    this.drawStart(svg)
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

    const range = this.maxX - this.minX
    const xStep = STEPS.find(step => range / step <= 3) || 1000
    const firstDist = Math.ceil(this.minX / xStep) * xStep
    for (let dist = firstDist; dist <= this.maxX + 1; dist += xStep) {
      const x = this.x(dist)
      const isEntry = Math.abs(dist) < 0.5
      this.line(svg, x, MARGIN_TOP, x, bottom, {
        stroke: isEntry ? 'rgba(124,255,166,0.3)' : 'rgba(255,255,255,0.05)',
        'stroke-width': isEntry ? 1.4 : 0.8
      })
      this.text(svg, x, bottom + 20, `${dist}`, 'display-fall-axis', 'middle')
    }
  }

  drawStart(svg) {
    if (!this.hasWindowStartValue) return

    const y = this.y(this.windowStartValue)
    this.line(svg, AXIS_LEFT, y, AXIS_LEFT + this.plotW, y, {
      stroke: '#4cd964',
      'stroke-width': 2,
      'stroke-dasharray': '7 6'
    })
    this.text(
      svg,
      AXIS_LEFT + this.plotW,
      y - 8,
      this.element.dataset.startLabel || 'WINDOW START',
      'display-fall-start-label',
      'end'
    )
  }

  start() {
    if (!this.ready) return
    this.stop()
    this.reset()
    this.playerT = this.minT
    this.doneAt = null
    this.goShown = false
    this.goAt = null
    this.lastFrame = performance.now()
    this.raf = requestAnimationFrame(t => this.frame(t))
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
      this.renderCard(index, first, faller, first.t)
    })
    this.hideCountdown()
  }

  frame(now) {
    this.raf = requestAnimationFrame(t => this.frame(t))
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000)
    this.lastFrame = now

    // Speed compresses the whole clip to a constant rate. Time & distance play
    // in real time up to REALTIME_END seconds into the window, then 2x. Either
    // way the marker never jumps speed at the window crossing. The countdown is
    // an overlay during the lead-in; "Go!" lands exactly at window entry (t = 0).
    const fast = this.realtime && this.playerT >= REALTIME_END
    const rate = this.realtime ? (fast ? FAST_RATE : 1) : this.rate
    this.playerT += dt * rate
    this.render()

    if (this.playerT < 0) {
      this.showCountdown(Math.max(1, Math.ceil(COUNTDOWN * (this.playerT / this.minT))))
    } else if (fast) {
      this.showRate()
    } else if (!this.goShown) {
      this.showGo()
      this.goShown = true
      this.goAt = now
    } else if (this.goAt != null && now - this.goAt > GO_HOLD) {
      this.hideCountdown()
      this.goAt = null
    }

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
      this.renderCard(index, at, faller, tt)

      if (finished && !faller.finished) {
        faller.finished = true
        if (this.cardTargets[index]) this.cardTargets[index].classList.add('is-finished')
      }
    })
  }

  renderCard(index, at, faller, t) {
    if (this.vspeedTargets[index])
      this.vspeedTargets[index].textContent = Math.round(at.vs)
    if (this.hspeedTargets[index])
      this.hspeedTargets[index].textContent = Math.round(at.hs)
    if (this.glideTargets[index])
      this.glideTargets[index].textContent = at.vs > 0 ? (at.hs / at.vs).toFixed(1) : '—'
    if (this.altitudeTargets[index])
      this.altitudeTargets[index].textContent = Math.round(at.alt)
    if (this.remainingTargets[index]) {
      this.remainingTargets[index].textContent = Math.max(
        0,
        Math.round(at.alt - faller.windowEnd)
      )
    }
    if (this.resultTargets[index]) {
      this.resultTargets[index].textContent = this.formatResult(
        this.runningResult(faller, at, t)
      )
    }
  }

  // The result value the window would score if the flight ended at the current
  // moment: distance covered from the window entry, its average speed, or the
  // elapsed window time. Zero before the window opens; snapped to the exact
  // final result once the window is complete.
  runningResult(faller, at, t) {
    if (t <= 0) return 0

    const windowEndT = faller.points[faller.points.length - 1].t
    if (t >= windowEndT) return faller.resultValue || 0

    if (this.disciplineValue === 'distance') return at.d
    if (this.disciplineValue === 'speed') return (at.d / t) * 3.6
    return t
  }

  formatResult(value) {
    if (this.disciplineValue === 'distance') return String(Math.round(value))
    return value.toFixed(1)
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
          d: curr.d + (next.d - curr.d) * f,
          alt: curr.alt + (next.alt - curr.alt) * f,
          hs: curr.hs + (next.hs - curr.hs) * f,
          vs: curr.vs + (next.vs - curr.vs) * f
        }
      }
    }
    return last
  }

  showCountdown(value) {
    this.reveal(String(value), false)
  }

  showGo() {
    this.reveal('Go!', false)
  }

  showRate() {
    this.reveal(`${FAST_RATE}×`, true)
  }

  reveal(text, isRate) {
    if (this.countdownTarget.hidden) this.countdownTarget.hidden = false
    this.countdownTarget.classList.toggle('is-rate', isRate)
    this.countTextTarget.textContent = text
  }

  hideCountdown() {
    this.countdownTarget.hidden = true
    this.countdownTarget.classList.remove('is-rate')
  }
}
