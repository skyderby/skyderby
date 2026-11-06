import LabeledController from '../labeled_controller'
import TimeSeriesChart from 'charts/TimeSeriesChart'
import FlightProfileChart from 'charts/FlightProfileChart'
import { accelerationHtml } from 'charts/svg/format'
import { accelerationBetween } from 'utils/tracks/playback/indicators'
import { cloneTemplate, fillSlots, slot } from 'utils/templates'

const AXES = {
  window_speed: { x: 'time', yUnit: 'units.kmh', xUnit: 'units.sec' },
  flare_speed: { x: 'time_from_flare', yUnit: 'units.kmh', xUnit: 'units.sec' },
  flare_dive: { x: 'time_from_flare', yUnit: 'units.kmh', xUnit: 'units.sec' },
  flare_gain: { x: 'time_from_flare', yUnit: 'units.m', xUnit: 'units.sec' }
}

const PROFILE_MIN_HEIGHT = 180
const PROFILE_MAX_HEIGHT = 520
const PROFILE_LABEL_SPACING = 60
const LABEL_OFFSET = 10
const LABEL_GAP = 4
const LABEL_EDGE = 2
const ACCELERATION_LOOKAHEAD = 1

const formatNumber = value => String(Math.round(value * 10) / 10)

const escapeHtml = text => {
  const node = document.createElement('span')
  node.textContent = text
  return node.innerHTML
}

const interpolate = (a, b, ratio) => a + (b - a) * ratio

const positionAt = (rows, time) => {
  const next = rows.findIndex(row => row[2] >= time)
  if (next === -1) return null

  const before = rows[Math.max(next - 1, 0)]
  const after = rows[next]
  const span = after[2] - before[2]
  const ratio = span > 0 ? (time - before[2]) / span : 0
  const hSpeed = interpolate(before[3], after[3], ratio)
  const vSpeed = interpolate(before[4], after[4], ratio)

  return {
    x: interpolate(before[0], after[0], ratio),
    y: interpolate(before[1], after[1], ratio),
    hSpeed,
    vSpeed,
    fullSpeed: Math.hypot(hSpeed, vSpeed)
  }
}

const overlapsHorizontally = (a, b) =>
  a.left < b.left + b.width && b.left < a.left + a.width

const layoutLabels = (items, width, height) => {
  items.forEach(item => {
    let left = item.px + LABEL_OFFSET
    if (left + item.width > width - LABEL_EDGE) left = item.px - LABEL_OFFSET - item.width
    item.left = Math.max(LABEL_EDGE, Math.min(left, width - item.width - LABEL_EDGE))
    item.top = item.py - item.height / 2
  })

  const sorted = [...items].sort((a, b) => a.top - b.top)
  sorted.forEach((item, index) => {
    sorted.slice(0, index).forEach(above => {
      if (overlapsHorizontally(item, above)) {
        item.top = Math.max(item.top, above.top + above.height + LABEL_GAP)
      }
    })
  })

  for (let index = sorted.length - 1; index >= 0; index--) {
    const item = sorted[index]
    item.top = Math.min(item.top, height - item.height - LABEL_EDGE)
    sorted.slice(index + 1).forEach(below => {
      if (overlapsHorizontally(item, below)) {
        item.top = Math.min(item.top, below.top - item.height - LABEL_GAP)
      }
    })
    item.top = Math.max(item.top, LABEL_EDGE)
  }
}

const cssColor = variable =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim()

export default class extends LabeledController {
  static targets = ['plot', 'playButton', 'slider', 'clock', 'labelTemplate']
  static values = { ...LabeledController.values, chart: Object }

  connect() {
    if (this.chartValue.name === 'window_side') {
      this.connectProfile()
    } else {
      this.connectTimeSeries()
    }
  }

  disconnect() {
    this.pause()
    this.resizeObserver?.disconnect()
    cancelAnimationFrame(this.resizeFrame)
    this.chart?.destroy()
    this.chart = null
  }

  connectProfile() {
    const meters = this.labels.t('units.m')
    const series = this.chartValue.series
    const xMax = Math.max(...series.flatMap(entry => entry.rows.map(row => row[0])), 1)
    const yMax = Math.max(...series.flatMap(entry => entry.rows.map(row => row[1])), 1)

    this.fitProfileHeight(xMax, yMax)

    this.chart = new FlightProfileChart({
      profileHost: this.plotTarget,
      labelSpacing: PROFILE_LABEL_SPACING,
      onRender: () => this.renderReplayLabels(),
      formatters: {
        profile: (sample, track) =>
          `<div class="fp-tooltip-row"><span class="fp-tooltip-name" style="color: var(${track.colorVar})">${escapeHtml(track.name)}</span>` +
          `<span>→${Math.round(sample.x)} ${meters} ↓${Math.round(sample.y)} ${meters}</span></div>`
      },
      labels: {
        zoomAll: this.labels.t('flight_profiles.zoom_all'),
        preset: value => `${value} ${meters}`,
        zoomTo: value =>
          this.labels.t('flight_profiles.zoom_to_first', { distance: Math.round(value) })
      }
    })

    series.forEach((entry, index) => {
      this.chart.setTrack(`s${index}`, {
        name: entry.name,
        profile: entry.rows.map(([x, y]) => ({ x, y }))
      })
    })

    this.resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(this.resizeFrame)
      this.resizeFrame = requestAnimationFrame(() => {
        this.fitProfileHeight(xMax, yMax)
        this.chart?.resize()
      })
    })
    this.resizeObserver.observe(this.element)

    this.replayTracks = series.map((entry, index) => ({
      id: `s${index}`,
      name: entry.name,
      rows: entry.rows
    }))
    this.replayPositions = []
    this.replayDuration = Math.max(
      ...series.map(entry => entry.rows[entry.rows.length - 1]?.[2] ?? 0)
    )
    this.playerTime = 0
    this.updateClock()
  }

  togglePlay() {
    if (this.animationFrame) {
      this.pause()
      return
    }

    if (this.playerTime >= this.replayDuration) this.playerTime = 0
    this.lastFrame = performance.now()
    this.playButtonTarget.classList.add('playing')
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  pause() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
    if (this.hasPlayButtonTarget) this.playButtonTarget.classList.remove('playing')
  }

  animate = now => {
    const time = Math.min(
      this.playerTime + (now - this.lastFrame) / 1000,
      this.replayDuration
    )
    this.lastFrame = now
    this.showTime(time)

    if (time >= this.replayDuration) {
      this.pause()
    } else {
      this.animationFrame = requestAnimationFrame(this.animate)
    }
  }

  seek() {
    this.lastFrame = performance.now()
    this.showTime((this.sliderTarget.value / this.sliderTarget.max) * this.replayDuration)
  }

  showTime(time) {
    this.playerTime = time
    this.replayPositions = this.replayTracks.flatMap(track => {
      const position = time < this.replayDuration ? positionAt(track.rows, time) : null
      if (!position) return []

      const future = positionAt(track.rows, time + ACCELERATION_LOOKAHEAD)
      const acceleration = accelerationBetween(position, future, ACCELERATION_LOOKAHEAD)
      return [{ id: track.id, name: track.name, ...position, acceleration }]
    })
    this.chart.setPlayback(this.replayPositions)
    this.renderReplayLabels()
    this.sliderTarget.value = Math.round(
      (time / this.replayDuration) * this.sliderTarget.max
    )
    this.updateClock()
  }

  renderReplayLabels() {
    if (!this.hasLabelTemplateTarget || !this.chart || !this.replayPositions) return

    this.labelsLayer ||= this.buildLabelsLayer()
    this.labelElements ||= new Map()
    const visible = new Set(this.replayPositions.map(position => position.id))
    this.labelElements.forEach((element, id) => {
      element.hidden = !visible.has(id)
    })

    const speed = value => String(Math.round(value))
    const length = value => `${Math.round(value)} ${this.labels.t('units.m')}`
    const items = this.replayPositions.map(position => {
      const element = this.labelElement(position.id)
      fillSlots(element, {
        name: position.name,
        lost: length(position.y),
        distance: length(position.x),
        hSpeed: speed(position.hSpeed),
        vSpeed: speed(position.vSpeed),
        fullSpeed: speed(position.fullSpeed)
      })
      slot(element, 'hAccel').innerHTML = accelerationHtml(
        position.acceleration?.hSpeedAccel
      )
      slot(element, 'vAccel').innerHTML = accelerationHtml(
        position.acceleration?.vSpeedAccel
      )
      slot(element, 'fullAccel').innerHTML = accelerationHtml(
        position.acceleration?.fullSpeedAccel
      )

      return {
        element,
        px: this.chart.x(position.x),
        py: this.chart.yProfile(position.y),
        width: element.offsetWidth,
        height: element.offsetHeight
      }
    })

    const { width, height } = this.plotTarget.getBoundingClientRect()
    layoutLabels(items, width, height)
    items.forEach(({ element, left, top }) => {
      element.style.left = `${Math.round(left)}px`
      element.style.top = `${Math.round(top)}px`
    })
  }

  buildLabelsLayer() {
    const layer = document.createElement('div')
    layer.className = 'debrief-replay-labels'
    this.plotTarget.appendChild(layer)
    return layer
  }

  labelElement(id) {
    let element = this.labelElements.get(id)
    if (!element) {
      element = cloneTemplate(this.labelTemplateTarget)
      element.style.setProperty(
        '--debrief-label-color',
        `var(${this.chart.colorVarFor(id)})`
      )
      this.labelsLayer.appendChild(element)
      this.labelElements.set(id, element)
    }
    element.hidden = false
    return element
  }

  updateClock() {
    if (!this.hasClockTarget) return
    this.clockTarget.textContent = `${this.playerTime.toFixed(1)} ${this.labels.t('units.sec')}`
  }

  fitProfileHeight(xMax, yMax) {
    const width = this.plotTarget.getBoundingClientRect().width
    const height = Math.min(
      Math.max((width * yMax) / xMax, PROFILE_MIN_HEIGHT),
      PROFILE_MAX_HEIGHT
    )
    this.plotTarget.style.height = `${Math.round(height)}px`
  }

  connectTimeSeries() {
    const axes = AXES[this.chartValue.name]
    if (!axes) return

    const yUnit = this.labels.t(axes.yUnit)
    const xUnit = this.labels.t(axes.xUnit)
    const series = this.chartValue.series.map((entry, index) => ({
      code: `s${index}`,
      name: entry.name,
      color: cssColor(entry.color),
      xs: entry.rows.map(row => row[0]),
      ys: entry.rows.map(row => row[1]),
      value: i => `${formatNumber(entry.rows[i][1])} ${yUnit}`
    }))

    this.chart = new TimeSeriesChart(this.plotTarget, {
      series,
      legend: {},
      xAxis: { labels: true },
      tooltipHeader: index => {
        const x = series[0]?.xs[index]
        if (x == null) return ''
        return `${this.labels.t(`tracks.debriefs.axes.${axes.x}`)}: ${formatNumber(x)} ${xUnit}`
      }
    })
  }
}
