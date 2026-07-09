import { Controller } from '@hotwired/stimulus'
import RangeChart from 'charts/RangeChart'

const PHASES = ['exit', 'deploy', 'landing']
const MIN_WINDOW = 30
const LANDING_OFFSET = 120
const EXIT_PADDING = 30
const LANDING_PADDING = 30
const NO_LANDING_TAIL = 180
const DEPLOY_LANDING_GAP = 5
const HANDLE_EDGE_PCT = 82
const SPEED_UNIT = 'km/h'

export default class extends Controller {
  static targets = [
    'chart',
    'minimap',
    'times',
    'rangeInput',
    'landingInput',
    'landingToggle'
  ]

  static values = {
    altitudeUrl: String,
    startEpoch: Number,
    duration: Number,
    exit: String,
    deploy: String,
    landing: String,
    exitLabel: String,
    deployLabel: String,
    landingLabel: String,
    removeLabel: String
  }

  connect() {
    this.maxT = Math.max(this.durationValue, MIN_WINDOW)
    this.moments = {
      exit: this.parse(this.exitValue, 0),
      deploy: this.parse(this.deployValue, this.maxT),
      landing: this.parse(this.landingValue, null)
    }
    this.labels = {
      exit: this.exitLabelValue,
      deploy: this.deployLabelValue,
      landing: this.landingLabelValue
    }
    this.handleEls = []
    this.tickEls = []

    this.chart = new RangeChart(this.chartTarget, this.minimapTarget, {
      onViewChange: () => this.renderHandles(),
      tooltipFormatter: sample => this.tooltip(sample)
    })

    this.load()
  }

  disconnect() {
    this.chart?.destroy()
  }

  load() {
    fetch(this.altitudeUrlValue, { credentials: 'same-origin' })
      .then(response => response.json())
      .then(data => {
        const samples = data.map(point => ({
          t: point.fl_time,
          alt: point.altitude,
          v: Math.round(point.v_speed),
          h: Math.round(point.h_speed)
        }))
        this.chart.setData(samples)
        this.maxT = this.chart.maxT
        this.applyDefaultView()
        this.drawOverlays()
      })
  }

  applyDefaultView() {
    const start = this.moments.exit - EXIT_PADDING
    const end =
      this.moments.landing == null
        ? this.moments.deploy + NO_LANDING_TAIL
        : this.moments.landing + LANDING_PADDING

    this.chart.setView(start, end - start)
  }

  drawOverlays() {
    this.renderHandles()
    this.renderTicks()
    this.renderTimes()
    this.syncInputs()
    this.updateLandingToggle()
  }

  renderHandles() {
    this.handleEls.forEach(el => el.remove())
    this.handleEls = []

    PHASES.forEach(phase => {
      const value = this.moments[phase]
      if (value == null || !this.chart.isInView(value)) return
      const el = this.buildHandle(phase)
      this.placeHandle(el, phase)
      this.chartTarget.appendChild(el)
      this.handleEls.push(el)
    })
  }

  buildHandle(phase) {
    const el = document.createElement('div')
    el.className = `range-editor__handle range-editor__handle--${phase}`
    el.dataset.phase = phase
    el.innerHTML =
      '<span class="range-editor__grip"></span>' +
      `<span class="range-editor__tag">${this.labels[phase]}</span>`

    if (phase === 'landing') {
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'range-editor__remove'
      remove.innerHTML = '&times;'
      remove.title = this.removeLabelValue
      remove.setAttribute('aria-label', this.removeLabelValue)
      remove.addEventListener('pointerdown', event => event.stopPropagation())
      remove.addEventListener('click', () => this.removeLanding())
      el.querySelector('.range-editor__tag').appendChild(remove)
    }

    el.addEventListener('pointerdown', this.onHandleDown)
    return el
  }

  placeHandle(el, phase) {
    const pct = this.chart.viewPct(this.moments[phase])
    el.style.left = `${pct}%`
    el.classList.toggle('range-editor__handle--right', pct > HANDLE_EDGE_PCT)
  }

  onHandleDown = event => {
    event.preventDefault()
    event.stopPropagation()
    const el = event.currentTarget
    const phase = el.dataset.phase

    const move = ev => {
      const time = this.chart.clientXToTime(this.pointerX(ev))
      this.moments[phase] = this.clamp(time, ...this.handleBounds(phase))
      if (phase === 'deploy') this.followLandingToDeploy()
      this.placeHandle(el, phase)
      this.renderTimes()
      this.syncInputs()
      this.updateTick(phase)
    }

    const up = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      this.renderHandles()
    }

    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  followLandingToDeploy() {
    if (this.moments.landing == null) return
    const minLanding = this.moments.deploy + DEPLOY_LANDING_GAP
    if (this.moments.landing >= minLanding) return

    this.moments.landing = Math.min(minLanding, this.maxT)
    const landingEl = this.chartTarget.querySelector('.range-editor__handle--landing')
    if (landingEl) this.placeHandle(landingEl, 'landing')
    this.updateTick('landing')
  }

  handleBounds(phase) {
    const t0 = this.chart.viewStart
    const t1 = this.chart.viewEnd
    if (phase === 'exit') return [t0, Math.min(this.moments.deploy, t1)]
    if (phase === 'deploy') return [Math.max(this.moments.exit, t0), t1]
    return [Math.max(this.moments.deploy, t0), t1]
  }

  renderTicks() {
    this.tickEls.forEach(el => el.remove())
    this.tickEls = []

    PHASES.forEach(phase => {
      const value = this.moments[phase]
      if (value == null) return
      const tick = document.createElement('div')
      tick.className = `range-editor__tick range-editor__tick--${phase}`
      tick.style.left = `${this.chart.trackPct(value)}%`
      this.minimapTarget.appendChild(tick)
      this.tickEls.push(tick)
    })
  }

  updateTick(phase) {
    const tick = this.minimapTarget.querySelector(`.range-editor__tick--${phase}`)
    if (tick) tick.style.left = `${this.chart.trackPct(this.moments[phase])}%`
  }

  addLanding() {
    this.moments.landing = this.clamp(
      this.moments.deploy + LANDING_OFFSET,
      this.moments.deploy,
      this.maxT
    )
    this.focusOn(this.moments.landing)
    this.drawOverlays()
  }

  removeLanding() {
    this.moments.landing = null
    this.drawOverlays()
  }

  focusOn(time) {
    if (this.chart.isInView(time)) return
    this.chart.setView(time - this.chart.windowLen / 2, this.chart.windowLen)
  }

  updateLandingToggle() {
    this.landingToggleTarget.hidden = this.moments.landing != null
  }

  renderTimes() {
    this.timesTarget.innerHTML = PHASES.map(phase => {
      const value = this.moments[phase]
      const time = value == null ? '—' : this.formatUtc(value)
      return (
        `<div class="range-editor__time range-editor__time--${phase}">` +
        `<dt>${this.labels[phase]}</dt><dd>${time}</dd></div>`
      )
    }).join('')
  }

  syncInputs() {
    this.rangeInputTarget.value = `${Math.round(this.moments.exit)};${Math.round(this.moments.deploy)}`
    this.landingInputTarget.value =
      this.moments.landing == null ? '' : Math.round(this.moments.landing)
  }

  tooltip(sample) {
    return (
      `<div class="range-editor__tooltip-time">${this.formatUtc(sample.t)}</div>` +
      `<div class="range-editor__tooltip-row"><span>Alt</span><b>${Math.round(sample.alt)} m</b></div>` +
      `<div class="range-editor__tooltip-row range-editor__tooltip-row--v"><span>V</span><b>${sample.v} ${SPEED_UNIT}</b></div>` +
      `<div class="range-editor__tooltip-row range-editor__tooltip-row--h"><span>H</span><b>${sample.h} ${SPEED_UNIT}</b></div>`
    )
  }

  formatUtc(seconds) {
    const date = new Date((this.startEpochValue + seconds) * 1000)
    const pad = n => String(n).padStart(2, '0')
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0')
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${ms} UTC`
  }

  pointerX(event) {
    return event.touches ? event.touches[0].clientX : event.clientX
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
  }

  parse(value, fallback) {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : fallback
  }
}
