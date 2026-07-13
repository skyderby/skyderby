import { Controller } from '@hotwired/stimulus'
import I18n from 'i18n'
import { patch } from '@rails/request.js'
import { fetchTrackPoints } from 'utils/tracks/trackData'
import { convertSpeed, convertLength, speedUnitLabel, lengthUnitLabel } from 'utils/units'
import {
  analyzeTrack,
  decompose,
  renderChart,
  sampleAt
} from 'charts/SpeedSkydivingProChart'

const SVG_NS = 'http://www.w3.org/2000/svg'
const VB_W = 1000
const GAIN_PHASES = [
  [0, 6, 'gain1'],
  [6, 12, 'gain2'],
  [12, 18, 'gain3']
]

export default class extends Controller {
  static targets = [
    'chart',
    'summary',
    'compare',
    'axisButton',
    'compareModal',
    'tooltip',
    'unitsItem'
  ]

  static values = {
    pointsUrl: String,
    comparePointsUrl: String,
    trackName: String,
    compareName: String,
    trackId: Number,
    windowEnd: Number,
    compareWindowEnd: Number,
    chartsUnits: { type: String, default: 'metric' },
    chartSettingsUrl: String
  }

  connect() {
    this.axis = 'time'
    this.load()
  }

  get units() {
    return this.chartsUnitsValue
  }

  setUnits(event) {
    const units = event.currentTarget.dataset.units
    if (units === this.chartsUnitsValue) return

    this.chartsUnitsValue = units
    this.unitsItemTargets.forEach(item =>
      item.classList.toggle('active', item.dataset.units === units)
    )
    if (this.hasChartSettingsUrlValue)
      patch(this.chartSettingsUrlValue, {
        body: { charts_units: units },
        responseKind: 'json'
      })
  }

  chartsUnitsValueChanged(value, previousValue) {
    if (previousValue === undefined || value === previousValue || !this.profileA) return
    this.render()
  }

  async load() {
    const requests = [this.fetchProfile(this.pointsUrlValue, this.windowEndValue)]
    if (this.hasComparePointsUrlValue && this.comparePointsUrlValue)
      requests.push(
        this.fetchProfile(this.comparePointsUrlValue, this.compareWindowEndValue)
      )

    const [a, b] = await Promise.all(requests)
    this.profileA = a
    this.profileB = b || null
    this.render()
  }

  async fetchProfile(url, windowEndAltitude) {
    const data = await fetchTrackPoints(url, { convertSpeeds: false })
    const profile = analyzeTrack(data.points)
    if (!profile) return null
    profile.window = this.windowFor(profile, windowEndAltitude)
    if (profile.window)
      profile.s.forEach(d => {
        if (d.alt < profile.window.alt) {
          d.bc = null
          d.vterm = null
        }
      })
    return profile
  }

  windowFor(profile, altitude) {
    if (!altitude) return null
    const alts = profile.s.map(d => d.alt)
    const ts = profile.s.map(d => d.t)
    const asc = alts.slice().reverse()
    const tsAsc = ts.slice().reverse()
    return { alt: altitude, t: sampleAt(asc, tsAsc, altitude) }
  }

  openCompareModal() {
    if (this.hasCompareModalTarget) this.compareModalTarget.showModal()
  }

  selectCompareTrack(event) {
    const item = event.target.closest('a.tracks-item')
    if (!item) return

    event.preventDefault()

    const trackId = item.dataset.id
    if (!trackId || Number(trackId) === this.trackIdValue) return

    const url = new URL(window.location)
    url.searchParams.set('compare_id', trackId)
    Turbo.visit(url.toString())
  }

  setAxis(event) {
    const axis = event.currentTarget.dataset.axis
    if (axis === this.axis) return
    this.axis = axis
    this.axisButtonTargets.forEach(btn =>
      btn.setAttribute('aria-pressed', btn.dataset.axis === axis)
    )
    this.render()
  }

  render() {
    if (!this.profileA) return
    const profiles = this.profileB ? [this.profileA, this.profileB] : [this.profileA]

    renderChart(this.chartTarget, {
      profiles,
      axis: this.axis,
      labels: this.chartLabels(),
      units: this.units
    })

    this.summaryTarget.innerHTML = this.summaryHtml()

    if (this.profileB) {
      const dc = decompose(this.profileA, this.profileB)
      this.compareTarget.innerHTML = this.waterfallHtml(dc)
      this.compareTarget.hidden = false
    } else {
      this.compareTarget.hidden = true
    }
  }

  chartLabels() {
    const imperial = this.units === 'imperial'
    return {
      speedAxis: `${I18n.t('tracks.speed_pro.chart.speed_axis')}  ${I18n.t(imperial ? 'units.mph' : 'units.ms')}`,
      accelAxis: I18n.t('tracks.speed_pro.chart.accel_axis'),
      kmMsl: imperial
        ? I18n.t('tracks.speed_pro.chart.kft_msl')
        : I18n.t('tracks.speed_pro.chart.km_msl'),
      windowEnd: I18n.t('tracks.speed_pro.chart.window_end'),
      sep: I18n.t('tracks.speed_pro.chart.sep')
    }
  }

  hover(event) {
    if (!this.profileA) return
    const svg = this.chartTarget
    const rect = svg.getBoundingClientRect()
    if (!rect.width) return
    const px = ((event.clientX - rect.left) / rect.width) * VB_W
    const x0 = +svg.dataset.x0
    const x1 = +svg.dataset.x1
    const frac = (px - x0) / (x1 - x0)
    if (frac < 0 || frac > 1) {
      this.hoverOut()
      return
    }
    const xVal = +svg.dataset.xa + frac * (+svg.dataset.xb - +svg.dataset.xa)
    this.drawCrosshair(this.chartTarget, xVal)
    this.drawMarkers(xVal)
    this.showReadout(event, xVal)
  }

  hoverOut() {
    if (this.hasTooltipTarget) this.tooltipTarget.hidden = true
    const svg = this.chartTarget
    const line = svg.querySelector('.ssp-crosshair')
    if (line) line.setAttribute('opacity', '0')
    svg.querySelectorAll('.ssp-marker').forEach(m => m.setAttribute('opacity', '0'))
  }

  projectX(svg, xVal) {
    const x0 = +svg.dataset.x0
    const x1 = +svg.dataset.x1
    return (
      x0 + ((xVal - +svg.dataset.xa) / (+svg.dataset.xb - +svg.dataset.xa)) * (x1 - x0)
    )
  }

  drawMarkers(xVal) {
    const svg = this.chartTarget
    const x0 = +svg.dataset.x0
    const x1 = +svg.dataset.x1
    const X = this.projectX(svg, xVal)
    const vmax = +svg.dataset.vmax
    const spY0 = +svg.dataset.spY0
    const spY1 = +svg.dataset.spY1
    const profiles = this.profileB ? [this.profileA, this.profileB] : [this.profileA]
    const colors = ['var(--ssp-a)', 'var(--ssp-b)']
    profiles.forEach((p, i) => {
      let dot = svg.querySelector(`.ssp-marker-${i}`)
      if (!dot) {
        dot = document.createElementNS(SVG_NS, 'circle')
        dot.setAttribute('class', `ssp-marker ssp-marker-${i}`)
        dot.setAttribute('r', '3.6')
        svg.appendChild(dot)
      }
      const vz = this.valueAt(p, xVal, 'vz')
      if (vz == null || X < x0 || X > x1) {
        dot.setAttribute('opacity', '0')
        return
      }
      dot.setAttribute('cx', X)
      dot.setAttribute('cy', spY1 - (vz / vmax) * (spY1 - spY0))
      dot.setAttribute('fill', colors[i])
      dot.setAttribute('opacity', '1')
    })
  }

  drawCrosshair(svg, xVal) {
    let line = svg.querySelector('.ssp-crosshair')
    if (!line) {
      line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('class', 'ssp-crosshair')
      svg.appendChild(line)
    }
    const x0 = +svg.dataset.x0
    const x1 = +svg.dataset.x1
    const X = this.projectX(svg, xVal)
    if (X < x0 || X > x1) {
      line.setAttribute('opacity', '0')
      return
    }
    const h = svg.viewBox.baseVal.height
    line.setAttribute('x1', X)
    line.setAttribute('x2', X)
    line.setAttribute('y1', 10)
    line.setAttribute('y2', h - 24)
    line.setAttribute('opacity', '1')
  }

  valueAt(profile, xVal, key) {
    const pts = profile.s
    const xOf = d => (this.axis === 'time' ? d.t : d.alt)
    for (let i = 1; i < pts.length; i++) {
      const xa = xOf(pts[i - 1])
      const xb = xOf(pts[i])
      if ((xa <= xVal && xVal <= xb) || (xb <= xVal && xVal <= xa)) {
        const ya = pts[i - 1][key]
        const yb = pts[i][key]
        if (ya == null || yb == null) return null
        const f = xb === xa ? 0 : (xVal - xa) / (xb - xa)
        return ya + f * (yb - ya)
      }
    }
    return null
  }

  metricRows(xVal) {
    const signed1 = d => `${d >= 0 ? '+' : ''}${d.toFixed(1)}`
    const signed0 = d => `${d >= 0 ? '+' : ''}${Math.round(d)}`
    const rows = [
      {
        key: 'vspeed',
        get: p => {
          const v = this.valueAt(p, xVal, 'vz')
          return v == null ? null : convertSpeed(v * 3.6, this.units)
        },
        ref: 20,
        fmt: v => v.toFixed(0),
        dfmt: signed0
      },
      {
        key: 'ceiling',
        get: p => {
          const v = this.valueAt(p, xVal, 'vterm')
          return v == null ? null : convertSpeed(v * 3.6, this.units)
        },
        ref: 20,
        fmt: v => v.toFixed(0),
        dfmt: signed0
      },
      {
        key: 'accel',
        get: p => this.valueAt(p, xVal, 'az'),
        ref: 4,
        fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}`,
        dfmt: signed1
      },
      {
        key: 'bc',
        get: p => this.valueAt(p, xVal, 'bc'),
        ref: 300,
        fmt: Math.round,
        dfmt: signed0
      },
      {
        key: 'sep',
        get: p => this.valueAt(p, xVal, 'sep'),
        fmt: v => v.toFixed(1),
        trackOnly: true,
        alert: v => v >= 3
      }
    ]
    if (this.axis === 'time')
      rows.splice(2, 0, {
        key: 'altitude',
        get: p => {
          const v = this.valueAt(p, xVal, 'alt')
          return v == null ? null : convertLength(v, this.units)
        },
        ref: 400,
        fmt: Math.round,
        dfmt: signed0
      })
    return rows
  }

  showReadout(event, xVal) {
    const tip = this.tooltipTarget
    const compare = !!this.profileB
    const xLabel =
      this.axis === 'time'
        ? `${xVal.toFixed(1)} ${I18n.t('units.sec')}`
        : `${Math.round(convertLength(xVal, this.units))} ${lengthUnitLabel(this.units)} MSL`

    let head = `<th></th><th><span class="ssp-dot is-a"></span>${I18n.t('tracks.speed_pro.col_track')}</th>`
    if (compare)
      head += `<th><span class="ssp-dot is-b"></span>${I18n.t('tracks.speed_pro.col_comparison')}</th><th></th>`

    const body = this.metricRows(xVal)
      .map(m => {
        const va = m.get(this.profileA)
        const label = I18n.t(`tracks.speed_pro.metrics.${m.key}`)
        if (m.trackOnly) {
          const alert = va != null && m.alert && m.alert(va)
          const cls = alert ? ' class="ssp-tt__alert"' : ''
          let cells = `<td${cls}>${va == null ? '—' : m.fmt(va)}</td>`
          if (compare) cells += '<td></td><td></td>'
          return `<tr class="ssp-tt__minor"><th>${label}</th>${cells}</tr>`
        }
        let cells = `<td>${va == null ? '—' : m.fmt(va)}</td>`
        if (compare) {
          const vb = m.get(this.profileB)
          cells += `<td>${vb == null ? '—' : m.fmt(vb)}</td>`
          cells += `<td class="ssp-tt__delta">${this.deltaCell(va, vb, m.ref, m.dfmt)}</td>`
        }
        return `<tr><th>${label}</th>${cells}</tr>`
      })
      .join('')

    tip.innerHTML = `<div class="ssp-tt__x">${xLabel}</div>
      <table class="ssp-tt__table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`

    const wrap = this.chartTarget.closest('.speed-pro__chart-wrap')
    const wrapRect = wrap.getBoundingClientRect()
    const width = compare ? 320 : 190
    let left = event.clientX - wrapRect.left + 16
    if (left > wrapRect.width - width) left = event.clientX - wrapRect.left - width
    tip.style.left = `${left}px`
    tip.style.top = `${event.clientY - wrapRect.top + 12}px`
    tip.hidden = false
  }

  deltaCell(va, vb, ref, dfmt) {
    if (va == null || vb == null) return '<span class="ssp-tt__dval">—</span>'
    const d = va - vb
    const pos = d >= 0
    const w = Math.min(50, (Math.abs(d) / ref) * 50)
    const style = pos
      ? `left:50%;width:${w}%;background:var(--ssp-pos)`
      : `right:50%;width:${w}%;background:var(--ssp-neg)`
    return `<span class="ssp-tt__bar"><span class="ssp-tt__mid"></span><span class="ssp-tt__fill" style="${style}"></span></span><span class="ssp-tt__dval ${pos ? 'is-pos' : 'is-neg'}">${dfmt(d)}</span>`
  }

  summaryHtml() {
    const speedU = speedUnitLabel(this.units)
    const lengthU = lengthUnitLabel(this.units)
    const unit = u => `<span class="ssp-unit">${u}</span>`
    const speed = s => `${convertSpeed(s.scoreKmh, this.units).toFixed(1)}${unit(speedU)}`
    const alt = s => `${Math.round(convertLength(s.hPeak, this.units))}${unit(lengthU)}`
    const bc = s => (s.bcMean ? `${Math.round(s.bcMean)}` : '—')
    const gap = s => (s.gap ? `${(s.gap * 100).toFixed(0)}${unit('%')}` : '—')
    const c = this.profileB ? this.profileB.summary : null
    const tiles = [
      { key: 'peak_speed', fmt: speed },
      { key: 'peak_alt', fmt: alt },
      { key: 'bc', fmt: bc },
      { key: 'ceiling_gap', fmt: gap }
    ]
    return tiles
      .map(
        t => `
        <div class="ssp-tile">
          <div class="ssp-tile__label">
            ${I18n.t(`tracks.speed_pro.summary.${t.key}`)}
            ${this.helpHtml(I18n.t(`tracks.speed_pro.tooltip.${t.key}`))}
          </div>
          <div class="ssp-tile__value">${t.fmt(this.profileA.summary)}</div>
          ${c ? `<div class="ssp-tile__cmp"><span class="ssp-dot is-b"></span>${t.fmt(c)}</div>` : ''}
        </div>`
      )
      .join('')
  }

  helpHtml(text) {
    return `<span class="ssp-help" tabindex="0" role="button" aria-label="${text}">?<span class="ssp-help__bubble">${text}</span></span>`
  }

  speedGain(profile, t0, t1) {
    const ts = profile.s.map(d => d.t)
    const vs = profile.s.map(d => d.vz)
    return convertSpeed((sampleAt(ts, vs, t1) - sampleAt(ts, vs, t0)) * 3.6, this.units)
  }

  waterfallHtml(dc) {
    const a = this.profileA.summary
    const b = this.profileB.summary
    const speedU = speedUnitLabel(this.units)
    const lengthU = lengthUnitLabel(this.units)
    const gainRows = GAIN_PHASES.map(([t0, t1, key]) => {
      const ga = this.speedGain(this.profileA, t0, t1)
      const gb = this.speedGain(this.profileB, t0, t1)
      return { key, valA: Math.round(ga), valB: Math.round(gb), unit: speedU, v: ga - gb }
    })
    const rows = [
      ...gainRows,
      {
        key: 'peak_altitude',
        valA: Math.round(convertLength(a.hPeak, this.units)),
        valB: Math.round(convertLength(b.hPeak, this.units)),
        unit: lengthU,
        v: dc.alt
      },
      {
        key: 'acceleration',
        valA: Math.round(a.gap * 100),
        valB: Math.round(b.gap * 100),
        unit: '%',
        v: dc.accel
      }
    ]
    const maxAbs = Math.max(...rows.map(r => Math.abs(r.v)), 0.1)
    const rowsHtml = rows
      .map(r => {
        const pos = r.v >= 0
        const w = Math.min(46, (Math.abs(r.v) / maxAbs) * 46)
        const style = pos
          ? `right:50%;width:${w}%;background:var(--ssp-pos)`
          : `left:50%;width:${w}%;background:var(--ssp-neg)`
        const unit = `<span class="ssp-cmp__unit">${r.unit}</span>`
        return `
          <div class="ssp-cmp__row">
            <div class="ssp-cmp__val ${pos ? 'is-lead' : ''}">${r.valA}${unit}</div>
            <div class="ssp-cmp__mid">
              <div class="ssp-cmp__name">${I18n.t(`tracks.speed_pro.waterfall.${r.key}`)}</div>
              <div class="ssp-cmp__bar"><span class="ssp-cmp__mark"></span><span class="ssp-cmp__fill" style="${style}"></span></div>
            </div>
            <div class="ssp-cmp__val ${pos ? '' : 'is-lead'}">${r.valB}${unit}</div>
          </div>`
      })
      .join('')
    return `
      <div class="ssp-cmp__cols">
        <span><span class="ssp-dot is-a"></span>${I18n.t('tracks.speed_pro.col_track')}</span>
        <span>${I18n.t('tracks.speed_pro.col_comparison')}<span class="ssp-dot is-b ssp-dot--trail"></span></span>
      </div>
      <div class="ssp-cmp__rows">${rowsHtml}</div>`
  }
}
