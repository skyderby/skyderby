import LabeledController from '../labeled_controller'
import { accelerationHtml } from 'charts/svg/format'
import { cloneTemplate, fillSlots, slot } from 'utils/templates'

const SVG_NS = 'http://www.w3.org/2000/svg'
const DEFAULT_WIDTH = 760
const MIN_WIDTH = 280
const PADDING = { left: 48, right: 16, top: 18, bottom: 26 }
const FLARE_ASPECT = 0.45
const EXAGGERATIONS = [1, 2, 3, 4, 5]
const GRID_STEPS = [10, 20, 25, 50, 100, 200, 250, 500, 1000]
const GRID_LINES = 6
const LOOKAHEAD = 1
const MIN_LOOKAHEAD = 0.2
const KMH_TO_MS = 1 / 3.6
const PLAYBACK_RATE = { window: 1.6, flare: 0.6 }
const MAX_PLAY_SECONDS = 15
const MOMENT_PAUSE = 2600
const AUTOPLAY_THRESHOLD = 0.55

const reducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const svgElement = (tag, attributes, parent) => {
  const node = document.createElementNS(SVG_NS, tag)
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value))
  parent?.appendChild(node)
  return node
}

const svgText = (parent, x, y, content, attributes = {}) => {
  const node = svgElement(
    'text',
    { x, y, class: 'debrief-replay__axis', ...attributes },
    parent
  )
  node.textContent = content
  return node
}

const gridStep = span =>
  GRID_STEPS.find(step => span / step <= GRID_LINES) ?? GRID_STEPS[GRID_STEPS.length - 1]

const toPoint = ([t, x, y, h, v]) => ({ t, x, y, h, v })

const pathData = (points, px, py) =>
  points
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'}${px(point.x).toFixed(1)},${py(point.y).toFixed(1)}`
    )
    .join('')

export default class extends LabeledController {
  static targets = [
    'svg',
    'play',
    'scrub',
    'clock',
    'moment',
    'caption',
    'readout',
    'readoutTemplate'
  ]
  static values = { ...LabeledController.values, replay: Object }

  connect() {
    this.flare = this.replayValue.phase === 'flare'
    this.tracks = this.replayValue.series.map(entry => ({
      ...entry,
      points: entry.rows.map(toPoint)
    }))
    this.moments = this.replayValue.moments
    this.start = Math.max(...this.tracks.map(track => track.points[0].t))
    this.finish = Math.max(
      ...this.tracks.map(track => track.points[track.points.length - 1].t)
    )

    this.draw()
    this.observeSize()
    this.readouts = this.readoutTargets.map(target => {
      const element = cloneTemplate(this.readoutTemplateTarget)
      target.replaceChildren(element)
      return element
    })
    this.setTime(this.moments[0]?.t ?? this.finish)
    this.observeVisibility()
  }

  disconnect() {
    this.stop()
    this.visibilityObserver?.disconnect()
    this.sizeObserver?.disconnect()
    cancelAnimationFrame(this.resizeFrame)
  }

  get stageWidth() {
    const width = this.svgTarget.parentElement.clientWidth || DEFAULT_WIDTH
    return Math.max(Math.round(width), MIN_WIDTH)
  }

  observeSize() {
    if (!('ResizeObserver' in window)) return

    this.sizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(this.resizeFrame)
      this.resizeFrame = requestAnimationFrame(() => {
        if (Math.abs(this.stageWidth - this.width) < 2) return

        this.draw()
        this.setTime(this.time)
      })
    })
    this.sizeObserver.observe(this.svgTarget.parentElement)
  }

  draw() {
    this.width = this.stageWidth
    const points = this.tracks.flatMap(track => track.points)
    const xs = points.map(point => point.x)
    const ys = points.map(point => point.y)
    const [xMin, xMax] = [Math.min(...xs), Math.max(...xs)]
    const [yMin, yMax] = [Math.min(...ys), Math.max(...ys)]
    const scale = (this.width - PADDING.left - PADDING.right) / (xMax - xMin)
    this.exaggeration = this.flare
      ? (EXAGGERATIONS.find(
          factor => (yMax - yMin) * factor >= (xMax - xMin) * FLARE_ASPECT
        ) ?? EXAGGERATIONS[EXAGGERATIONS.length - 1])
      : 1
    const height = Math.round(
      PADDING.top + PADDING.bottom + (yMax - yMin) * scale * this.exaggeration
    )

    this.px = x => PADDING.left + (x - xMin) * scale
    this.py = this.flare
      ? y => height - PADDING.bottom - (y - yMin) * scale * this.exaggeration
      : y => PADDING.top + (y - yMin) * scale

    const svg = this.svgTarget
    svg.setAttribute('viewBox', `0 0 ${this.width} ${height}`)
    svg.replaceChildren()
    this.drawGrid(svg, { xMin, xMax, yMin, yMax, height })

    this.tracks.forEach(track => {
      const style = `stroke: var(${track.color})`
      svgElement(
        'path',
        {
          d: pathData(track.points, this.px, this.py),
          class: 'debrief-replay__trail',
          style
        },
        svg
      )
      track.progress = svgElement(
        'path',
        { class: 'debrief-replay__progress', style },
        svg
      )
      track.dot = svgElement(
        'circle',
        {
          r: 6,
          class: 'debrief-replay__marker',
          style: `fill: var(${track.color})`
        },
        svg
      )
    })
  }

  drawGrid(svg, { xMin, xMax, yMin, yMax, height }) {
    const meters = this.labels.t('units.m')
    const xStep = gridStep(xMax - xMin)
    const yStep = gridStep(yMax - yMin)

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      svgElement(
        'line',
        {
          x1: this.px(x),
          x2: this.px(x),
          y1: PADDING.top,
          y2: height - PADDING.bottom,
          class: 'debrief-figure__grid'
        },
        svg
      )
      svgText(svg, this.px(x), height - 8, `${x} ${meters}`, { 'text-anchor': 'middle' })
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      svgElement(
        'line',
        {
          x1: PADDING.left,
          x2: this.width - PADDING.right,
          y1: this.py(y),
          y2: this.py(y),
          class: 'debrief-figure__grid'
        },
        svg
      )
      const label = this.flare && y > 0 ? `+${y}` : `${y}`
      svgText(svg, PADDING.left - 6, this.py(y) + 4, `${label} ${meters}`, {
        'text-anchor': 'end'
      })
    }
    if (this.exaggeration > 1) {
      svgText(
        svg,
        this.width - PADDING.right,
        PADDING.top + 4,
        this.labels.t('tracks.debriefs.axes.exaggerated', { factor: this.exaggeration }),
        { 'text-anchor': 'end' }
      )
    }
  }

  sample(track, time) {
    const { points } = track
    if (time <= points[0].t) return points[0]
    if (time >= points[points.length - 1].t) return points[points.length - 1]

    const index = points.findIndex(point => point.t >= time)
    const before = points[index - 1]
    const after = points[index]
    const ratio = (time - before.t) / (after.t - before.t)
    const mix = key => before[key] + (after[key] - before[key]) * ratio
    return { t: time, x: mix('x'), y: mix('y'), h: mix('h'), v: mix('v') }
  }

  setTime(time) {
    this.time = Math.max(this.start, Math.min(time, this.finish))
    this.tracks.forEach((track, index) => {
      const now = this.sample(track, this.time)
      const passed = track.points.filter(point => point.t <= this.time).concat([now])
      track.progress.setAttribute('d', pathData(passed, this.px, this.py))
      track.dot.setAttribute('cx', this.px(now.x))
      track.dot.setAttribute('cy', this.py(now.y))
      this.fillReadout(this.readouts[index], track, now)
    })

    const span = this.finish - this.start
    this.scrubTarget.value =
      span > 0 ? Math.round(((this.time - this.start) / span) * 1000) : 0
    const sign = this.flare && this.time > 0 ? '+' : ''
    this.clockTarget.textContent = `${sign}${this.time.toFixed(1)} ${this.labels.t('units.sec')}`
  }

  fillReadout(element, track, now) {
    const meters = this.labels.t('units.m')
    const last = track.points[track.points.length - 1]
    const ahead = Math.min(this.time + LOOKAHEAD, last.t) - this.time
    const later = ahead >= MIN_LOOKAHEAD ? this.sample(track, this.time + ahead) : null
    const rate = (from, to) => (later ? ((to - from) * KMH_TO_MS) / ahead : null)
    const full = Math.hypot(now.h, now.v)
    const height = this.flare
      ? `${now.y >= 0 ? '↑' : '↓'}${Math.abs(Math.round(now.y))} ${meters}`
      : `↓${Math.round(now.y)} ${meters}`

    fillSlots(element, {
      height,
      distance: `→${Math.round(now.x)} ${meters}`,
      full: Math.round(full),
      vArrow: now.v < -0.5 ? '↑' : '↓',
      v: Math.round(Math.abs(now.v)),
      h: Math.round(now.h)
    })
    slot(element, 'fullAccel').innerHTML = accelerationHtml(
      rate(full, later && Math.hypot(later.h, later.v))
    )
    slot(element, 'vAccel').innerHTML = accelerationHtml(
      rate(Math.abs(now.v), later && Math.abs(later.v))
    )
    slot(element, 'hAccel').innerHTML = accelerationHtml(rate(now.h, later?.h))
  }

  markMoment(index) {
    this.momentTargets.forEach((button, position) => {
      button.setAttribute('aria-pressed', String(position === index))
    })
    if (index == null) return

    this.captionTargets.forEach((caption, position) => {
      caption.hidden = position !== index
    })
  }

  goTo({ params: { index } }) {
    this.stop()
    this.markMoment(index)
    const target = this.moments[index].t
    if (reducedMotion()) {
      this.setTime(target)
    } else {
      this.animate(this.time, target)
    }
  }

  seek() {
    this.stop()
    this.markMoment(null)
    this.setTime(
      this.start + (this.scrubTarget.value / 1000) * (this.finish - this.start)
    )
  }

  toggle() {
    if (this.frame) {
      this.stop()
      return
    }
    this.markMoment(null)
    this.animate(this.time >= this.finish - 0.01 ? this.start : this.time, this.finish)
  }

  animate(from, to, done) {
    this.stop()
    const rate = Math.max(
      PLAYBACK_RATE[this.replayValue.phase],
      (this.finish - this.start) / MAX_PLAY_SECONDS
    )
    const duration = (Math.abs(to - from) / rate) * 1000
    const began = performance.now()
    const step = now => {
      const progress = duration ? Math.min((now - began) / duration, 1) : 1
      this.setTime(from + (to - from) * progress)
      if (progress < 1) {
        this.frame = requestAnimationFrame(step)
      } else {
        this.frame = null
        this.playTarget.classList.remove('playing')
        done?.()
      }
    }
    this.playTarget.classList.add('playing')
    this.frame = requestAnimationFrame(step)
  }

  stop() {
    if (this.frame) cancelAnimationFrame(this.frame)
    clearTimeout(this.pause)
    this.frame = null
    if (this.hasPlayTarget) this.playTarget.classList.remove('playing')
  }

  tour() {
    this.setTime(this.start)
    const visit = index => {
      if (index >= this.moments.length) return

      this.animate(this.time, this.moments[index].t, () => {
        this.markMoment(index)
        this.pause = setTimeout(() => visit(index + 1), MOMENT_PAUSE)
      })
    }
    visit(0)
  }

  observeVisibility() {
    if (reducedMotion() || !('IntersectionObserver' in window)) return

    this.visibilityObserver = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return

        this.visibilityObserver.disconnect()
        this.tour()
      },
      { threshold: AUTOPLAY_THRESHOLD }
    )
    this.visibilityObserver.observe(this.svgTarget)
  }
}
