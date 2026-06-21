import I18n from 'i18n'

const SVG_NS = 'http://www.w3.org/2000/svg'

const VIEWBOX = { width: 1000, height: 600 }
const PADDING = { left: 86, right: 120, top: 54, bottom: 64 }

// Atmosphere / physics constants (SI)
const A_GRAVITY = 9.80665
const SL_PRESSURE = 101325
const SL_TEMP = 288.15
const LAPSE_RATE = 0.0065
const MM_AIR = 0.0289644
const GAS_CONST = 8.31447

// Wing loading used to scale lift/drag into coefficients. The polar shape and
// max L/D are independent of this value; it only sets the CL/CD axis scale.
const WING_LOADING = 64

const SLOPE_HALF_WINDOW = 3
const MIN_SPEED = 5
const MAX_COEFFICIENT = 2.5

const CLOUD_LIMIT = 2000
const DOMAIN_PERCENTILE = 0.96

const GLIDE_RATIO_RAYS = [2, 2.5, 3, 3.5, 4, 4.5]

const TO_RAD = Math.PI / 180

const percentile = (sortedValues, ratio) => {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0]
  const index = ratio * (sortedValues.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sortedValues[lower]
  return (
    sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower)
  )
}

const niceStep = range => {
  const rough = range / 6
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const normalized = rough / magnitude
  let step
  if (normalized < 1.5) step = 1
  else if (normalized < 3) step = 2
  else if (normalized < 7) step = 5
  else step = 10
  return step * magnitude
}

const bearing = (a, b) => {
  const y = Math.sin((b.longitude - a.longitude) * TO_RAD) * Math.cos(b.latitude * TO_RAD)
  const x =
    Math.cos(a.latitude * TO_RAD) * Math.sin(b.latitude * TO_RAD) -
    Math.sin(a.latitude * TO_RAD) *
      Math.cos(b.latitude * TO_RAD) *
      Math.cos((b.longitude - a.longitude) * TO_RAD)
  return Math.atan2(y, x)
}

const airDensity = altitude => {
  const pressure =
    SL_PRESSURE *
    Math.pow(
      1 - (LAPSE_RATE * altitude) / SL_TEMP,
      (A_GRAVITY * MM_AIR) / GAS_CONST / LAPSE_RATE
    )
  const temperature = SL_TEMP - LAPSE_RATE * altitude
  return pressure / (GAS_CONST / MM_AIR) / temperature
}

// Least squares CD = a * CL^2 + c (linear in u = CL^2)
const fitDragPolar = points => {
  let n = 0
  let Su = 0
  let Suu = 0
  let Sx = 0
  let Sux = 0

  points.forEach(({ cl, cd }) => {
    const u = cl * cl
    n += 1
    Su += u
    Suu += u * u
    Sx += cd
    Sux += u * cd
  })

  const det = n * Suu - Su * Su
  if (Math.abs(det) < 1e-12) return null

  const a = (n * Sux - Su * Sx) / det
  const c = (Sx - a * Su) / n
  if (a <= 0 || c <= 0) return null

  return { a, c, maxLD: 1 / Math.sqrt(4 * a * c), clOpt: Math.sqrt(c / a) }
}

export default class SkydivePerformancePolar {
  constructor({ svg }) {
    this.svg = svg
  }

  destroy() {
    if (this.svg) this.svg.innerHTML = ''
  }

  render({ points, fitRange = null, comparePoints = null, compareFitRange = null }) {
    this.svg.setAttribute('viewBox', `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`)
    this.svg.innerHTML = ''

    this.samples = this.computeAeroPoints(points || [])
    if (this.samples.length < 10) return

    this.fit = fitDragPolar(this.selectFitSamples(this.samples, fitRange))

    this.compareSamples =
      comparePoints && comparePoints.length ? this.computeAeroPoints(comparePoints) : null
    this.compareFit =
      this.compareSamples && this.compareSamples.length >= 10
        ? fitDragPolar(this.selectFitSamples(this.compareSamples, compareFitRange))
        : null

    const allSamples = this.compareSamples
      ? this.samples.concat(this.compareSamples)
      : this.samples
    const cds = allSamples.map(p => p.cd).sort((a, b) => a - b)
    const cls = allSamples.map(p => p.cl).sort((a, b) => a - b)

    this.domain = {
      x: Math.ceil(percentile(cds, DOMAIN_PERCENTILE) * 1.1 * 100) / 100,
      y: Math.ceil(percentile(cls, DOMAIN_PERCENTILE) * 1.1 * 10) / 10
    }

    this.plot = {
      width: VIEWBOX.width - PADDING.left - PADDING.right,
      height: VIEWBOX.height - PADDING.top - PADDING.bottom
    }

    const inDomain = sample => sample.cd <= this.domain.x && sample.cl <= this.domain.y

    this.renderTitle()
    this.renderGrid()
    this.renderGlideRatioRays()
    if (this.compareSamples) {
      this.renderCloud(this.compareSamples.filter(inDomain), 'polar-sample-compare')
    }
    this.renderCloud(this.samples.filter(inDomain), 'polar-sample')
    if (this.compareFit) this.renderCompareCurve(this.compareFit)
    this.renderCurve()
    this.renderStats()
    this.createMarker()
  }

  selectFitSamples(samples, fitRange) {
    if (!fitRange) return samples
    const inRange = samples.filter(
      p => p.altitude <= fitRange.from && p.altitude >= fitRange.to
    )
    return inRange.length >= 10 ? inRange : samples
  }

  computeAeroPoints(points) {
    const data = points
      .filter(
        p =>
          Number.isFinite(p.hSpeed) &&
          Number.isFinite(p.vSpeed) &&
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude) &&
          p.gpsTime
      )
      .map(p => ({
        t: p.gpsTime.getTime() / 1000,
        gpsTime: p.gpsTime.getTime(),
        latitude: p.latitude,
        longitude: p.longitude,
        h: p.hSpeed / 3.6,
        vD: p.vSpeed / 3.6,
        altitude: p.altitude,
        hMSL: p.absAltitude
      }))

    if (data.length < 2 * SLOPE_HALF_WINDOW + 1) return []

    data.forEach((point, i) => {
      const prev = data[Math.max(0, i - 1)]
      const next = data[Math.min(data.length - 1, i + 1)]
      const course = bearing(prev, next)
      point.vN = point.h * Math.cos(course)
      point.vE = point.h * Math.sin(course)
    })

    const slope = (i, key) => {
      const t0 = data[i].t
      let n = 0
      let St = 0
      let Sf = 0
      let Stt = 0
      let Stf = 0
      for (
        let j = Math.max(0, i - SLOPE_HALF_WINDOW);
        j <= Math.min(data.length - 1, i + SLOPE_HALF_WINDOW);
        j++
      ) {
        const dt = data[j].t - t0
        const f = data[j][key]
        n += 1
        St += dt
        Sf += f
        Stt += dt * dt
        Stf += dt * f
      }
      const det = n * Stt - St * St
      return det ? (n * Stf - St * Sf) / det : 0
    }

    const result = []
    for (let i = SLOPE_HALF_WINDOW; i < data.length - SLOPE_HALF_WINDOW; i++) {
      const point = data[i]
      const vel = Math.sqrt(point.vN ** 2 + point.vE ** 2 + point.vD ** 2)
      if (vel < MIN_SPEED) continue

      const aN = slope(i, 'vN')
      const aE = slope(i, 'vE')
      const aD = slope(i, 'vD') - A_GRAVITY

      const proj = (aN * point.vN + aE * point.vE + aD * point.vD) / vel
      const dN = (proj * point.vN) / vel
      const dE = (proj * point.vE) / vel
      const dD = (proj * point.vD) / vel
      const aDrag = Math.sqrt(dN * dN + dE * dE + dD * dD)

      const lN = aN - dN
      const lE = aE - dE
      const lD = aD - dD
      const aLift = Math.sqrt(lN * lN + lE * lE + lD * lD)

      const q = (airDensity(point.hMSL) * vel * vel) / 2
      if (q <= 0) continue

      const cl = (WING_LOADING * aLift) / q
      const cd = (WING_LOADING * aDrag) / q

      if (cl > 0 && cd > 0 && cl < MAX_COEFFICIENT && cd < MAX_COEFFICIENT) {
        result.push({
          cl,
          cd,
          ld: aLift / aDrag,
          gpsTime: point.gpsTime,
          altitude: point.altitude
        })
      }
    }

    return result
  }

  scaleX(cd) {
    return PADDING.left + (cd / this.domain.x) * this.plot.width
  }

  scaleY(cl) {
    return PADDING.top + (1 - cl / this.domain.y) * this.plot.height
  }

  appendText(parent, x, y, text, className, { anchor = 'middle', size = 20 } = {}) {
    const node = document.createElementNS(SVG_NS, 'text')
    node.setAttribute('x', x)
    node.setAttribute('y', y)
    node.setAttribute('text-anchor', anchor)
    node.setAttribute('font-size', size)
    node.setAttribute('class', className)
    node.textContent = text
    parent.appendChild(node)
    return node
  }

  renderTitle() {
    const group = document.createElementNS(SVG_NS, 'g')
    this.appendText(
      group,
      PADDING.left,
      24,
      I18n.t('charts.polar.title'),
      'polar-title',
      {
        anchor: 'start',
        size: 26
      }
    )
    this.appendText(
      group,
      PADDING.left,
      44,
      I18n.t('charts.polar.subtitle'),
      'polar-subtitle',
      { anchor: 'start', size: 15 }
    )

    this.svg.appendChild(group)
  }

  renderGrid() {
    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', 'polar-grid')

    const left = PADDING.left
    const right = PADDING.left + this.plot.width
    const top = PADDING.top
    const bottom = PADDING.top + this.plot.height

    const xStep = niceStep(this.domain.x)
    for (let value = 0; value <= this.domain.x + 1e-6; value += xStep) {
      const x = this.scaleX(value)
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', x)
      line.setAttribute('y1', top)
      line.setAttribute('x2', x)
      line.setAttribute('y2', bottom)
      line.setAttribute('class', value === 0 ? 'polar-axis-line' : 'polar-grid-line')
      group.appendChild(line)
      if (value > 0) {
        this.appendText(group, x, bottom + 24, value.toFixed(2), 'polar-tick', {
          size: 18
        })
      }
    }

    const yStep = niceStep(this.domain.y)
    for (let value = 0; value <= this.domain.y + 1e-6; value += yStep) {
      const y = this.scaleY(value)
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', left)
      line.setAttribute('y1', y)
      line.setAttribute('x2', right)
      line.setAttribute('y2', y)
      line.setAttribute('class', value === 0 ? 'polar-axis-line' : 'polar-grid-line')
      group.appendChild(line)
      if (value > 0) {
        this.appendText(group, left - 10, y + 6, value.toFixed(1), 'polar-tick', {
          anchor: 'end',
          size: 18
        })
      }
    }

    this.appendText(
      group,
      left + this.plot.width / 2,
      VIEWBOX.height - 14,
      I18n.t('charts.polar.axis.drag'),
      'polar-axis-title',
      { size: 18 }
    )

    const cy = top + this.plot.height / 2
    const yTitle = this.appendText(
      group,
      22,
      cy,
      I18n.t('charts.polar.axis.lift'),
      'polar-axis-title',
      { size: 18 }
    )
    yTitle.setAttribute('transform', `rotate(-90 22 ${cy})`)

    this.svg.appendChild(group)
  }

  renderGlideRatioRays() {
    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', 'polar-rays')

    GLIDE_RATIO_RAYS.forEach(ratio => {
      // L/D = CL / CD => CL = ratio * CD
      let endCd = this.domain.x
      let endCl = ratio * endCd
      if (endCl > this.domain.y) {
        endCl = this.domain.y
        endCd = endCl / ratio
      }
      if (endCd <= 0 || endCl <= 0) return

      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', this.scaleX(0))
      line.setAttribute('y1', this.scaleY(0))
      line.setAttribute('x2', this.scaleX(endCd))
      line.setAttribute('y2', this.scaleY(endCl))
      line.setAttribute('class', 'polar-ray')
      group.appendChild(line)

      this.appendText(
        group,
        this.scaleX(endCd),
        this.scaleY(endCl) - 6,
        `${ratio}`,
        'polar-ray-label',
        { anchor: 'middle', size: 15 }
      )
    })

    this.svg.appendChild(group)
  }

  renderCloud(points, className) {
    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', 'polar-cloud')

    const stride = Math.max(1, Math.ceil(points.length / CLOUD_LIMIT))
    for (let i = 0; i < points.length; i += stride) {
      const dot = document.createElementNS(SVG_NS, 'circle')
      dot.setAttribute('cx', this.scaleX(points[i].cd))
      dot.setAttribute('cy', this.scaleY(points[i].cl))
      dot.setAttribute('r', 2.5)
      dot.setAttribute('class', className)
      group.appendChild(dot)
    }

    this.svg.appendChild(group)
  }

  renderCompareCurve(fit) {
    const { a, c } = fit
    const coords = []
    for (let i = 0; i <= 64; i++) {
      const cl = (this.domain.y * i) / 64
      const cd = a * cl * cl + c
      if (cd > this.domain.x) continue
      coords.push(`${this.scaleX(cd)} ${this.scaleY(cl)}`)
    }
    if (coords.length < 2) return

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', `M ${coords.join(' L ')}`)
    path.setAttribute('class', 'polar-curve-compare')
    this.svg.appendChild(path)
  }

  renderStats() {
    const right = PADDING.left + this.plot.width
    const bottom = PADDING.top + this.plot.height
    const lineHeight = 26
    let y = bottom - 12

    if (this.fit) {
      this.appendText(
        this.svg,
        right,
        y,
        I18n.t('charts.polar.max_ld', { value: this.fit.maxLD.toFixed(2) }),
        'polar-stat',
        { anchor: 'end', size: 22 }
      )
      y -= lineHeight
    }

    if (this.compareFit) {
      this.appendText(
        this.svg,
        right,
        y,
        I18n.t('charts.polar.max_ld', { value: this.compareFit.maxLD.toFixed(2) }),
        'polar-stat-compare',
        { anchor: 'end', size: 22 }
      )
      y -= lineHeight
    }

    this.markerLabel = this.appendText(this.svg, right, y, '', 'polar-marker-label', {
      anchor: 'end',
      size: 22
    })
  }

  renderCurve() {
    if (!this.fit) return

    const { a, c, maxLD, clOpt } = this.fit
    const group = document.createElementNS(SVG_NS, 'g')

    // Tangent line at max L/D (from origin)
    let tanCl = this.domain.y
    let tanCd = tanCl / maxLD
    if (tanCd > this.domain.x) {
      tanCd = this.domain.x
      tanCl = tanCd * maxLD
    }
    const tangent = document.createElementNS(SVG_NS, 'line')
    tangent.setAttribute('x1', this.scaleX(0))
    tangent.setAttribute('y1', this.scaleY(0))
    tangent.setAttribute('x2', this.scaleX(tanCd))
    tangent.setAttribute('y2', this.scaleY(tanCl))
    tangent.setAttribute('class', 'polar-tangent')
    group.appendChild(tangent)

    // Fitted parabola CD = a*CL^2 + c
    const steps = 64
    const coords = []
    for (let i = 0; i <= steps; i++) {
      const cl = (this.domain.y * i) / steps
      const cd = a * cl * cl + c
      if (cd > this.domain.x) continue
      coords.push(`${this.scaleX(cd)} ${this.scaleY(cl)}`)
    }
    if (coords.length >= 2) {
      const path = document.createElementNS(SVG_NS, 'path')
      path.setAttribute('d', `M ${coords.join(' L ')}`)
      path.setAttribute('class', 'polar-curve')
      group.appendChild(path)
    }

    // Dot at max L/D (CD = 2c, CL = clOpt)
    if (clOpt <= this.domain.y) {
      const dot = document.createElementNS(SVG_NS, 'circle')
      dot.setAttribute('cx', this.scaleX(2 * c))
      dot.setAttribute('cy', this.scaleY(clOpt))
      dot.setAttribute('r', 6)
      dot.setAttribute('class', 'polar-ld-dot')
      group.appendChild(dot)
    }

    this.svg.appendChild(group)
  }

  createMarker() {
    this.marker = document.createElementNS(SVG_NS, 'circle')
    this.marker.setAttribute('r', 6)
    this.marker.setAttribute('class', 'polar-marker')
    this.marker.style.display = 'none'
    this.svg.appendChild(this.marker)
  }

  nearestSample(gpsTime) {
    const samples = this.samples
    let lo = 0
    let hi = samples.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (samples[mid].gpsTime < gpsTime) lo = mid + 1
      else hi = mid
    }
    const candidate = samples[lo]
    const prev = samples[lo - 1]
    if (
      prev &&
      Math.abs(prev.gpsTime - gpsTime) < Math.abs(candidate.gpsTime - gpsTime)
    ) {
      return prev
    }
    return candidate
  }

  setMarker(gpsTime) {
    if (!this.marker || !this.samples || this.samples.length === 0 || !this.domain) return

    if (!Number.isFinite(gpsTime)) {
      this.marker.style.display = 'none'
      this.markerLabel.textContent = ''
      return
    }

    const sample = this.nearestSample(gpsTime)
    if (!sample) {
      this.marker.style.display = 'none'
      this.markerLabel.textContent = ''
      return
    }

    const cx = Math.min(this.scaleX(sample.cd), this.scaleX(this.domain.x))
    const cy = Math.max(this.scaleY(sample.cl), this.scaleY(this.domain.y))
    this.marker.setAttribute('cx', cx)
    this.marker.setAttribute('cy', cy)
    this.marker.style.display = ''

    this.markerLabel.textContent = I18n.t('charts.polar.current_ld', {
      value: sample.ld.toFixed(1)
    })
  }
}
