import { convertSpeed, convertLength } from 'utils/units'

const G = 9.80665
const SG_WINDOW_SEC = 1.4
const SCORE_WINDOW_SEC = 3
const MIN_POINTS = 3

const COLORS = {
  a: 'var(--ssp-a)',
  b: 'var(--ssp-b)',
  aAccel: 'var(--ssp-a-accel)',
  bAccel: 'var(--ssp-b-accel)',
  alt: 'var(--ssp-alt)',
  grid: 'var(--ssp-grid)',
  ink: 'var(--ssp-ink)',
  muted: 'var(--ssp-muted)',
  pos: 'var(--ssp-pos)',
  neg: 'var(--ssp-neg)'
}

const isaRho = h => {
  const T = 288.15 - 0.0065 * h
  const p = 101325 * Math.pow(T / 288.15, 5.25588)
  return p / (287.05 * T)
}

const solve3 = m => {
  const [m00, m01, m02, m10, m11, m12, m20, m21, m22, r0, r1, r2] = m
  const det =
    m00 * (m11 * m22 - m12 * m21) -
    m01 * (m10 * m22 - m12 * m20) +
    m02 * (m10 * m21 - m11 * m20)
  if (Math.abs(det) < 1e-12) return [r0 / Math.max(m00, 1e-9), 0, 0]
  const dA =
    r0 * (m11 * m22 - m12 * m21) -
    m01 * (r1 * m22 - m12 * r2) +
    m02 * (r1 * m21 - m11 * r2)
  const dB =
    m00 * (r1 * m22 - m12 * r2) -
    r0 * (m10 * m22 - m12 * m20) +
    m02 * (m10 * r2 - r1 * m20)
  return [dA / det, dB / det, 0]
}

const sampleSpacing = ts => {
  const d = []
  for (let i = 1; i < ts.length; i++) d.push(ts[i] - ts[i - 1])
  if (!d.length) return 0.2
  d.sort((a, b) => a - b)
  const dt = d[d.length >> 1]
  return dt > 0 ? dt : 0.2
}

const sg = (y, half, dt) => {
  const n = y.length
  const val = new Array(n)
  const der = new Array(n)
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half)
    const hi = Math.min(n - 1, i + half)
    let s0 = 0
    let s1 = 0
    let s2 = 0
    let s3 = 0
    let s4 = 0
    let t0 = 0
    let t1 = 0
    let t2 = 0
    for (let j = lo; j <= hi; j++) {
      const x = j - i
      const yj = y[j]
      const x2 = x * x
      s0 += 1
      s1 += x
      s2 += x2
      s3 += x2 * x
      s4 += x2 * x2
      t0 += yj
      t1 += x * yj
      t2 += x2 * yj
    }
    const sol = solve3([s0, s1, s2, s1, s2, s3, s2, s3, s4, t0, t1, t2])
    val[i] = sol[0]
    der[i] = sol[1] / dt
  }
  return { val, der }
}

const interp = (xs, ys, x) => {
  if (x <= xs[0]) return ys[0]
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1]
  let lo = 0
  let hi = xs.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (xs[mid] <= x) lo = mid
    else hi = mid
  }
  const f = (x - xs[lo]) / (xs[hi] - xs[lo])
  return ys[lo] + f * (ys[hi] - ys[lo])
}

export const analyzeTrack = points => {
  if (!points || points.length < MIN_POINTS) return null
  const rawT = points.map(p => p.flTime)
  const alt = points.map(p => p.absAltitude)
  const rvz = points.map(p => p.vSpeed)
  const rvh = points.map(p => p.hSpeed)
  const vacc = points.map(p => p.verticalAccuracy)
  const dt = sampleSpacing(rawT)
  const half = Math.max(1, Math.round(SG_WINDOW_SEC / dt / 2))
  const vzF = sg(rvz, half, dt)
  const vhF = sg(rvh, half, dt)
  const vz = vzF.val
  const az = vzF.der
  const vh = vhF.val

  let ex = 0
  for (let i = 0; i < vz.length; i++) {
    let ok = true
    for (let k = 0; k < 5 && i + k < vz.length; k++) {
      if (!(vz[i + k] > 10 && az[i + k] > 5)) {
        ok = false
        break
      }
    }
    if (ok) {
      ex = i
      break
    }
  }
  const t0 = rawT[ex]
  const n = points.length
  const s = []
  for (let i = 0; i < n; i++) {
    const v = Math.hypot(vz[i], vh[i])
    const rho = isaRho(alt[i])
    const denom = G - az[i]
    const valid = vz[i] > 45 && denom > 1.5
    const bc = valid ? (rho * v * vz[i]) / (2 * denom) : null
    const vterm = valid ? Math.sqrt((2 * G * bc) / rho) : null
    s.push({
      t: rawT[i] - t0,
      alt: alt[i],
      vz: vz[i],
      vh: vh[i],
      az: az[i],
      v,
      rho,
      bc,
      vterm,
      sep: vacc[i] != null ? (Math.SQRT2 * vacc[i]) / 3 : null
    })
  }

  const win = Math.min(n, Math.max(1, Math.round(SCORE_WINDOW_SEC / dt)))
  let best = -1
  let bi = 0
  for (let i = 0; i + win <= n; i++) {
    let sum = 0
    for (let k = 0; k < win; k++) sum += s[i + k].vz
    const mean = sum / win
    if (mean > best) {
      best = mean
      bi = i
    }
  }
  const c = bi + (win >> 1)
  const idx = []
  for (let k = 0; k < win; k++) idx.push(bi + k)
  const bcs = idx.map(i => s[i].bc).filter(x => x != null)
  const bcMean = bcs.length ? bcs.reduce((a, b) => a + b, 0) / bcs.length : null
  const bcStd =
    bcs.length > 1
      ? Math.sqrt(bcs.reduce((a, b) => a + (b - bcMean) ** 2, 0) / bcs.length)
      : 0
  const vhMean = idx.reduce((a, i) => a + s[i].vh, 0) / win
  const hPeak = s[c].alt
  const rhoPeak = isaRho(hPeak)
  const vtermPeak = bcMean != null ? Math.sqrt((2 * G * bcMean) / rhoPeak) : null
  const gap = bcMean != null ? best / vtermPeak : null
  const pre = s[Math.max(0, c - Math.round(5 / dt))].bc
  const bcFalling = pre != null && bcMean != null ? bcMean < pre * 0.97 : false

  return {
    s,
    summary: {
      scoreVz: best,
      scoreKmh: best * 3.6,
      tPeak: s[c].t,
      hPeak,
      rhoPeak,
      bcMean,
      bcStd,
      bcCv: bcMean ? bcStd / bcMean : 0,
      vhMean,
      gap,
      vtermPeak,
      bcFalling
    },
    tMin: s[0].t,
    tMax: s[n - 1].t,
    altMax: Math.max(...alt),
    altMin: Math.min(...alt)
  }
}

export const decompose = (a, b) => {
  const va = a.summary.scoreVz
  const vb = b.summary.scoreVz
  const vlog =
    Math.abs(Math.log(va) - Math.log(vb)) < 1e-9
      ? va
      : (va - vb) / (Math.log(va) - Math.log(vb))
  const ratio = (x, y) => (x && y ? Math.log(x) - Math.log(y) : 0)
  const pose = 0.5 * ratio(a.summary.bcMean, b.summary.bcMean) * vlog * 3.6
  const alt = -0.5 * ratio(a.summary.rhoPeak, b.summary.rhoPeak) * vlog * 3.6
  const accel = ratio(a.summary.gap, b.summary.gap) * vlog * 3.6
  return { pose, alt, accel, total: (va - vb) * 3.6 }
}

const niceTicks = (a, b, count) => {
  const span = b - a
  if (span <= 0) return [a]
  const step0 = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(a / step) * step
  const out = []
  for (let v = start; v <= b + step * 0.001; v += step)
    out.push(Math.round(v * 1e6) / 1e6)
  return out
}

const xDomain = (profiles, axis) => {
  if (axis === 'time') {
    let hi = 0
    for (const p of profiles) hi = Math.max(hi, p.tMax)
    return [0, hi]
  }
  let hi = -1e9
  let lo = 1e9
  for (const p of profiles) {
    hi = Math.max(hi, p.altMax)
    lo = Math.min(lo, p.altMin)
  }
  return [hi, lo]
}

const series = (profile, axis, fields) =>
  profile.s.map(d => {
    const o = { x: axis === 'time' ? d.t : d.alt }
    for (const f of fields) o[f] = d[f]
    return o
  })

const makeCanvas = (h, xDom, opts) => {
  const W = 1000
  const padL = 48
  const padR = opts.padR != null ? opts.padR : 16
  const padT = 12
  const padB = 24
  const x0 = padL
  const x1 = W - padR
  const y0 = padT
  const y1 = h - padB
  const [xa, xb] = xDom
  const sx = v => x0 + ((v - xa) / (xb - xa)) * (x1 - x0)
  const parts = []
  const fx = n => n.toFixed(1)
  return {
    W,
    h,
    x0,
    x1,
    y0,
    y1,
    sx,
    line(a, b, c, d, stroke, w, dash, op) {
      parts.push(
        `<line x1="${fx(a)}" y1="${fx(b)}" x2="${fx(c)}" y2="${fx(d)}" stroke="${stroke}" stroke-width="${w || 1}"${dash ? ` stroke-dasharray="${dash}"` : ''}${op != null ? ` opacity="${op}"` : ''}/>`
      )
    },
    txt(xp, yp, str, anchor, size, fill) {
      parts.push(
        `<text x="${fx(xp)}" y="${fx(yp)}" text-anchor="${anchor || 'start'}" font-size="${size || 11}" fill="${fill || COLORS.muted}">${str}</text>`
      )
    },
    rect(xp, yp, wp, hp, fill, op) {
      parts.push(
        `<rect x="${fx(xp)}" y="${fx(yp)}" width="${fx(Math.max(0, wp))}" height="${fx(Math.max(0, hp))}" fill="${fill}"${op != null ? ` fill-opacity="${op}"` : ''}/>`
      )
    },
    path(pts, key, syf, color, w, dash, op) {
      let d = ''
      let pen = false
      for (const p of pts) {
        const v = p[key]
        if (v == null) {
          pen = false
          continue
        }
        d += `${pen ? 'L' : 'M'}${fx(sx(p.x))} ${fx(syf(v))} `
        pen = true
      }
      if (d)
        parts.push(
          `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w || 1.6}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"${op != null ? ` opacity="${op}"` : ''}/>`
        )
    },
    pathClip(pts, key, syf, color, w, lo, hi) {
      let d = ''
      let pen = false
      for (const p of pts) {
        const v = p[key]
        if (v == null) {
          pen = false
          continue
        }
        const y = Math.max(lo, Math.min(hi, syf(v)))
        d += `${pen ? 'L' : 'M'}${fx(sx(p.x))} ${fx(y)} `
        pen = true
      }
      if (d)
        parts.push(
          `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w || 1.6}" stroke-linejoin="round" stroke-linecap="round"/>`
        )
    },
    areaBetween(pts, k1, k2, syf, fill, op) {
      let seg = []
      const flush = () => {
        if (seg.length > 1) {
          let d = `M${seg.map(p => `${fx(sx(p.x))} ${fx(syf(p[k1]))}`).join(' L ')}`
          for (let i = seg.length - 1; i >= 0; i--)
            d += ` L ${fx(sx(seg[i].x))} ${fx(syf(seg[i][k2]))}`
          d += ' Z'
          parts.push(
            `<path d="${d}" fill="${fill}" stroke="none"${op != null ? ` fill-opacity="${op}"` : ''}/>`
          )
        }
        seg = []
      }
      for (const p of pts) {
        if (p[k1] != null && p[k2] != null) seg.push(p)
        else flush()
      }
      flush()
    },
    areaBase(pts, key, syf, basePx, fill, op, lo, hi) {
      let seg = []
      const flush = () => {
        if (seg.length > 1) {
          let d = `M${fx(sx(seg[0].x))} ${fx(basePx)}`
          for (const p of seg) {
            const y = Math.max(lo, Math.min(hi, syf(p[key])))
            d += ` L ${fx(sx(p.x))} ${fx(y)}`
          }
          d += ` L ${fx(sx(seg[seg.length - 1].x))} ${fx(basePx)} Z`
          parts.push(
            `<path d="${d}" fill="${fill}" stroke="none"${op != null ? ` fill-opacity="${op}"` : ''}/>`
          )
        }
        seg = []
      }
      for (const p of pts) {
        if (p[key] != null) seg.push(p)
        else flush()
      }
      flush()
    },
    areaZero(pts, key, syf, baselinePx, gradId) {
      let seg = []
      const flush = () => {
        if (seg.length > 1) {
          let d = `M${fx(sx(seg[0].x))} ${fx(baselinePx)}`
          for (const p of seg) d += ` L ${fx(sx(p.x))} ${fx(syf(p[key]))}`
          d += ` L ${fx(sx(seg[seg.length - 1].x))} ${fx(baselinePx)} Z`
          parts.push(`<path d="${d}" fill="url(#${gradId})" stroke="none"/>`)
        }
        seg = []
      }
      for (const p of pts) {
        if (p[key] != null) seg.push(p)
        else flush()
      }
      flush()
    },
    dot(x, v, syf, color, r) {
      parts.push(
        `<circle cx="${fx(sx(x))}" cy="${fx(syf(v))}" r="${r || 3}" fill="${color}" stroke="var(--ssp-surface)" stroke-width="1.5"/>`
      )
    },
    annot(x, baselinePx, str, color, level) {
      const X = sx(x)
      const hgt = 22 + (level || 0) * 17
      parts.push(
        `<line x1="${fx(X)}" y1="${fx(baselinePx)}" x2="${fx(X)}" y2="${fx(baselinePx - hgt)}" stroke="${color}" stroke-width="1" opacity=".7"/><text x="${fx(X)}" y="${fx(baselinePx - hgt - 4)}" text-anchor="middle" font-size="10.5" fill="${color}">${str}</text>`
      )
    },
    raw(str) {
      parts.push(str)
    },
    html() {
      return parts.join('')
    }
  }
}

const ACCEL_H = 106
const SEP_THRESHOLD = 3
const VALIDATION_H = 1000
const SEP_PX = 34
const SEP_FULL = 7

export const renderChart = (svg, { profiles, axis, labels, units = 'metric' }) => {
  const H = 518
  const fmtAltU = v => `${(convertLength(v, units) / 1000).toFixed(1)}k`
  const dom = xDomain(profiles, axis)
  let vmax = 0
  let altMax = -1e9
  let altMin = 1e9
  for (const p of profiles) {
    for (const d of p.s) vmax = Math.max(vmax, d.vz, d.vterm || 0)
    altMax = Math.max(altMax, p.altMax)
    altMin = Math.min(altMin, p.altMin)
  }
  vmax = Math.ceil(vmax / 10) * 10 + 5

  const cv = makeCanvas(H, dom, { padR: axis === 'time' ? 54 : 16 })
  const { x0, x1, y0, y1, sx } = cv
  const ySplit = y1 - ACCEL_H
  const sV = v => ySplit - (v / vmax) * (ySplit - y0)
  const sA = a => {
    const c = Math.max(-G, Math.min(G, a))
    return ySplit + (c / G) * (y1 - ySplit)
  }
  const sApos = a => sA(Math.max(0, a))
  const sAlt = a =>
    altMax === altMin
      ? (y0 + ySplit) / 2
      : ySplit - ((a - altMin) / (altMax - altMin)) * (ySplit - y0)
  const softOp = 0.16

  cv.rect(x0, ySplit, x1 - x0, y1 - ySplit, 'var(--ssp-band)')
  for (const v of niceTicks(0, vmax, 4)) {
    const y = sV(v)
    cv.line(x0, y, x1, y, COLORS.grid)
    cv.txt(x0 - 7, y + 3.5, Math.round(convertSpeed(v * 3.6, units)), 'end', 11)
  }
  const xt =
    axis === 'time'
      ? niceTicks(0, dom[1], 6)
      : niceTicks(Math.min(...dom), Math.max(...dom), 6)
  for (const v of xt) {
    const x = sx(v)
    cv.line(x, y0, x, y1, COLORS.grid)
    cv.txt(x, y1 + 15, axis === 'time' ? v : fmtAltU(v), 'middle', 11)
  }
  if (axis === 'time') {
    for (const a of niceTicks(altMin, altMax, 4))
      cv.txt(
        x1 + 7,
        sAlt(a) + 3.5,
        (convertLength(a, units) / 1000).toFixed(1),
        'start',
        10.5,
        COLORS.muted
      )
    cv.txt(x1 + 7, y0 - 2, labels.kmMsl, 'start', 9.5, COLORS.muted)
  }
  cv.line(x0, ySplit, x1, ySplit, COLORS.muted, 1.2, null, 0.85)
  cv.txt(x0 - 7, ySplit + 3.5, '0', 'end', 10.5, COLORS.muted)
  cv.txt(x0 - 7, y1 + 0.5, 'g', 'end', 10.5, COLORS.muted)

  profiles.forEach((p, i) => {
    const vzCol = i === 0 ? COLORS.a : COLORS.b
    const accelCol = i === 0 ? COLORS.aAccel : COLORS.bAccel
    const altDash = i === 0 ? null : '7 5'
    const serS = series(p, axis, ['vz', 'vterm'])
    const serA = series(p, axis, ['az'])
    const serAlt = series(p, axis, ['alt'])
    const su = p.summary
    if (axis === 'time') {
      const b0 = sx(su.tPeak - 1.5)
      const b1 = sx(su.tPeak + 1.5)
      cv.rect(Math.min(b0, b1), y0, Math.abs(b1 - b0), y1 - y0, vzCol, softOp)
    } else {
      const span = (altMax - altMin) * 0.012
      const b0 = sx(su.hPeak + span)
      const b1 = sx(su.hPeak - span)
      cv.rect(Math.min(b0, b1), y0, Math.abs(b1 - b0), y1 - y0, vzCol, softOp)
    }
    cv.areaBetween(serS, 'vterm', 'vz', sV, vzCol, softOp)
    if (axis === 'time') cv.path(serAlt, 'alt', sAlt, COLORS.alt, 2.3, altDash, 0.9)
    cv.path(serS, 'vterm', sV, vzCol, 1.3, '5 4')
    cv.areaBase(serA, 'az', sApos, ySplit, accelCol, 0.18, ySplit, y1)
    cv.pathClip(serA, 'az', sA, accelCol, 1.6, y0, y1)
    cv.path(serS, 'vz', sV, vzCol, 2.3)
    cv.dot(axis === 'time' ? su.tPeak : su.hPeak, su.scoreVz, sV, vzCol, 3.6)
  })

  profiles.forEach((p, i) => {
    if (!p.window) return
    const col = i === 0 ? COLORS.a : COLORS.b
    const xw = axis === 'time' ? p.window.t : p.window.alt
    if (xw == null) return
    const X = sx(xw)
    if (X < x0 || X > x1) return
    cv.line(X, y0, X, y1, col, 1.2, '4 3', 0.95)
    cv.txt(X - 4, y0 + 11 + i * 13, labels.windowEnd, 'end', 9.5, col)
  })

  const primary = profiles[0]
  if (primary.window) {
    const floor = primary.window.alt
    let labelled = false
    for (const d of primary.s) {
      if (d.sep == null || d.alt < floor || d.alt > floor + VALIDATION_H) continue
      const X = sx(axis === 'time' ? d.t : d.alt)
      if (X < x0 || X > x1) continue
      const h = Math.min(1, d.sep / SEP_FULL) * SEP_PX
      const color = d.sep >= SEP_THRESHOLD ? 'var(--ssp-sep-bad)' : 'var(--ssp-sep-ok)'
      cv.rect(X - 0.9, ySplit - h, 1.8, h, color)
      if (!labelled) {
        cv.txt(X, ySplit - SEP_PX - 3, labels.sep, 'start', 9.5, COLORS.muted)
        labelled = true
      }
    }
  }

  cv.txt(x0 + 7, y0 + 13, labels.speedAxis, 'start', 10, COLORS.muted)
  cv.txt(x0 + 7, ySplit + 14, labels.accelAxis, 'start', 10, COLORS.muted)

  svg.setAttribute('viewBox', `0 0 ${cv.W} ${H}`)
  svg.dataset.x0 = x0
  svg.dataset.x1 = x1
  svg.dataset.xa = dom[0]
  svg.dataset.xb = dom[1]
  svg.dataset.axis = axis

  svg.dataset.vmax = vmax
  svg.dataset.spY0 = y0
  svg.dataset.spY1 = ySplit
  svg.innerHTML = cv.html()
}

export const sampleAt = (xs, ys, x) => interp(xs, ys, x)
