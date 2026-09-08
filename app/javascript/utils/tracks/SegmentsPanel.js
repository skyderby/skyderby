import { cloneTemplate, fillSlots, slot, slots } from 'utils/templates'
import { convertLength, convertSpeed, speedUnitLabel, lengthUnitLabel } from 'utils/units'

const MIN_RATIO = 0.0001

const barWidth = (ratio, max) => Math.max(2, Math.min(max, ratio * max))

const signOf = value => (value >= 0 ? '+' : '−')

const maxAbs = values => Math.max(...values.map(Math.abs), MIN_RATIO)

export default class SegmentsPanel {
  constructor({ container, templates }) {
    this.container = container
    this.templates = templates
  }

  clear() {
    this.container.replaceChildren()
  }

  render({ analysis, compareAnalysis = null, units = 'metric' }) {
    this.units = units
    this.clear()

    if (!analysis) return

    if (compareAnalysis) {
      this.renderCompare(analysis, compareAnalysis)
    } else {
      this.renderSingle(analysis)
    }
  }

  get speedUnit() {
    return speedUnitLabel(this.units)
  }

  get lengthUnit() {
    return lengthUnitLabel(this.units)
  }

  length(meters) {
    return Math.round(convertLength(meters, this.units))
  }

  speed(kmh) {
    return Math.round(convertSpeed(kmh, this.units))
  }

  renderSingle({ entry, segments }) {
    const maxes = {
      distance: maxAbs(segments.map(s => s.distance)),
      time: maxAbs(segments.map(s => s.time)),
      delta: maxAbs(segments.map(s => s.deltaSpeed))
    }

    this.container.append(
      this.entryNode(entry),
      this.list(segments.map(segment => this.segmentNode(segment, maxes)))
    )
  }

  renderCompare(a, b) {
    const pairs = a.segments.map((segment, index) => [segment, b.segments[index]])
    const maxes = {
      distance: maxAbs(pairs.map(([x, y]) => x.distance - y.distance)),
      time: maxAbs(pairs.map(([x, y]) => x.time - y.time)),
      delta: maxAbs(pairs.map(([x, y]) => x.deltaSpeed - y.deltaSpeed))
    }

    this.container.append(
      cloneTemplate(this.templates.columns),
      this.entryCompareNode(a.entry, b.entry),
      this.list(pairs.map(([x, y]) => this.segmentCompareNode(x, y, maxes)))
    )
  }

  list(nodes) {
    const wrapper = document.createElement('div')
    wrapper.className = 'sps-seg-list'
    wrapper.append(...nodes)
    return wrapper
  }

  entryValues(entry, suffix = '') {
    return {
      [`topSpeed${suffix}`]: this.speed(entry.maxSpeedBefore),
      [`components${suffix}`]: `${this.speed(entry.hSpeed)}/${this.speed(entry.vSpeed)}`,
      [`lossSpeed${suffix}`]: `${signOf(entry.deltaFromMax)}${Math.abs(this.speed(entry.deltaFromMax))}`,
      [`lossEnergy${suffix}`]: `${signOf(entry.deltaFromMax)}${Math.round(Math.abs(entry.energyFromMax))}`
    }
  }

  entryNode(entry) {
    const node = cloneTemplate(this.templates.entry)
    fillSlots(node, { ...this.entryValues(entry), speedUnit: this.speedUnit })
    slot(node, 'loss')?.classList.add(entry.deltaFromMax >= 0 ? 'is-gain' : 'is-loss')
    return node
  }

  entryCompareNode(a, b) {
    const node = cloneTemplate(this.templates.entryCompare)
    fillSlots(node, {
      ...this.entryValues(a, 'A'),
      ...this.entryValues(b, 'B'),
      speedUnit: this.speedUnit
    })
    return node
  }

  sideValues(segment) {
    return {
      badge: `S${segment.index + 1}`,
      drop: `${this.length(segment.fromAltitude - segment.toAltitude)} ${this.lengthUnit}`
    }
  }

  segmentNode(segment, maxes) {
    const node = cloneTemplate(this.templates.segment)
    const gain = segment.deltaSpeed >= 0

    fillSlots(node, {
      ...this.sideValues(segment),
      distance: this.length(segment.distance),
      time: segment.time.toFixed(1),
      deltaSpeed: `${signOf(segment.deltaSpeed)}${Math.abs(this.speed(segment.deltaSpeed))}`,
      deltaEnergy: `${signOf(segment.deltaSpeed)}${Math.round(Math.abs(segment.deltaEnergy))}`,
      lengthUnit: this.lengthUnit,
      speedUnit: this.speedUnit
    })

    slot(node, 'distanceBar').style.width =
      `${barWidth(Math.abs(segment.distance) / maxes.distance, 100)}%`
    slot(node, 'timeBar').style.width =
      `${barWidth(Math.abs(segment.time) / maxes.time, 100)}%`

    const energyBar = slot(node, 'energyBar')
    energyBar.classList.add(gain ? 'is-gain' : 'is-loss')
    energyBar.style.width = `${barWidth(Math.abs(segment.deltaSpeed) / maxes.delta, 48)}%`
    energyBar.style[gain ? 'left' : 'right'] = '50%'

    slot(node, 'energyDelta').classList.add(gain ? 'is-gain' : 'is-loss')

    return node
  }

  segmentCompareNode(a, b, maxes) {
    const node = cloneTemplate(this.templates.segmentCompare)
    const delta = value => `${signOf(value)}${Math.abs(this.speed(value))}`

    fillSlots(node, {
      ...this.sideValues(a),
      distanceA: this.length(a.distance),
      distanceB: this.length(b.distance),
      timeA: a.time.toFixed(1),
      timeB: b.time.toFixed(1),
      energyA: delta(a.deltaSpeed),
      energyB: delta(b.deltaSpeed),
      lengthUnit: this.lengthUnit,
      speedUnit: this.speedUnit
    })

    this.compareBar(node, 'distance', a.distance - b.distance, maxes.distance)
    this.compareBar(node, 'time', a.time - b.time, maxes.time)
    this.compareBar(node, 'energy', a.deltaSpeed - b.deltaSpeed, maxes.delta)

    return node
  }

  compareBar(node, name, delta, maxDelta) {
    const trackLeads = delta >= 0
    const fill = slot(node, `${name}Bar`)
    fill.style.width = `${barWidth(Math.abs(delta) / maxDelta, 46)}%`
    fill.style[trackLeads ? 'right' : 'left'] = '50%'
    fill.style.background = trackLeads ? 'var(--sps-a)' : 'var(--sps-b)'

    slots(node, `${name}A`)[0]
      ?.closest('.sps-cmp__val')
      ?.classList.toggle('is-lead', trackLeads)
    slots(node, `${name}B`)[0]
      ?.closest('.sps-cmp__val')
      ?.classList.toggle('is-lead', !trackLeads)
  }
}
