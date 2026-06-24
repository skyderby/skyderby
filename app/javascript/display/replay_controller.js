import { Controller } from '@hotwired/stimulus'
import loadMaps from './maps_loader'

const SYNC_VSPEED = 10 // km/h — race start, same point BASE Pro View zeroes time at
const FINISH_COLOR = '#e84855'
const RACE_WINDOW = 26 // seconds of wall-clock the race is compressed into
const COUNTDOWN = 3 // seconds
const HOLD = 3.5 // seconds to hold the result before the slide advances
const SLOWMO = 4 // playback divisor near the finish line
const SLOWMO_DISTANCE = 160 // metres before the finish to start slow motion
const LINE_WEIGHT = 3
const MAP_ID = 'BASE_TRACK_MAP'

export default class extends Controller {
  static targets = [
    'map',
    'data',
    'clock',
    'speed',
    'meters',
    'time',
    'countdown',
    'countText'
  ]
  static values = { locationArrowUrl: String }

  connect() {
    this.payload = JSON.parse(this.dataTarget.textContent)
    this.prepare()
    this.observeActive()

    loadMaps()
      .then(() => this.initMap())
      .catch(() => {})
  }

  disconnect() {
    this.stop()
    if (this.observer) this.observer.disconnect()
  }

  prepare() {
    // Sync by recorded race start time when both tracks have it, otherwise
    // fall back to the 10 km/h point (same point BASE Pro View zeroes time at).
    const useStartTime = this.payload.sides.every(s => s.syncFlTime != null)

    this.sides = this.payload.sides.map(side => {
      const points = side.path
      const sync = useStartTime ? side.syncFlTime : this.syncTime(points)
      points.forEach(p => {
        p.t = p.flTime - sync
      })
      return { ...side, points }
    })

    // A track with no usable points would crash the timeline math below; bail
    // out gracefully (the slide then shows the cards without a live replay).
    if (this.sides.some(s => s.points.length === 0)) return

    this.sides.forEach(side => {
      side.crossT = this.crossingTime(side.points)
    })
    this.startT = Math.min(...this.sides.map(s => s.points[0].t))
    this.endT = Math.max(...this.sides.map(s => s.points[s.points.length - 1].t))
    this.rate = Math.max(1, (this.endT - this.startT) / RACE_WINDOW)
    this.finishCenter = this.lineCenter(this.payload.finishLine)
    this.minRemaining = Infinity
    this.ready = true
  }

  // Player time at which the trajectory crosses the finish line, used to
  // trigger the finish exactly when the pilot reaches the line regardless of
  // which sync reference (start time vs 10 km/h) was used.
  crossingTime(points) {
    const line = this.payload.finishLine
    if (!line || line.length < 2) return null

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      if (a.t < 0) continue

      const frac = this.segmentIntersection(a, b, line[0], line[1])
      if (frac != null) return a.t + (b.t - a.t) * frac
    }
    return null
  }

  segmentIntersection(p1, p2, p3, p4) {
    const denom =
      (p2.lng - p1.lng) * (p4.lat - p3.lat) - (p2.lat - p1.lat) * (p4.lng - p3.lng)
    if (Math.abs(denom) < 1e-12) return null

    const t =
      ((p3.lng - p1.lng) * (p4.lat - p3.lat) - (p3.lat - p1.lat) * (p4.lng - p3.lng)) /
      denom
    const u =
      ((p3.lng - p1.lng) * (p2.lat - p1.lat) - (p3.lat - p1.lat) * (p2.lng - p1.lng)) /
      denom
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null
  }

  syncTime(points) {
    for (let i = 0; i < points.length; i++) {
      if (points[i].vSpeed < SYNC_VSPEED) continue
      if (i === 0) return points[0].flTime
      const prev = points[i - 1]
      const curr = points[i]
      const f = (SYNC_VSPEED - prev.vSpeed) / (curr.vSpeed - prev.vSpeed)
      return prev.flTime + (curr.flTime - prev.flTime) * f
    }
    return points[0].flTime
  }

  initMap() {
    try {
      this.buildMap()
    } catch {
      // map unavailable (e.g. quota) — the replay still runs without it
    }
  }

  buildMap() {
    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 15,
      center: { lat: this.sides[0].points[0].lat, lng: this.sides[0].points[0].lng },
      mapTypeId: 'terrain',
      mapId: MAP_ID,
      disableDefaultUI: true,
      gestureHandling: 'none',
      keyboardShortcuts: false
    })

    this.drawFinishLine()

    this.sides.forEach(side => {
      side.shadow = new google.maps.Polyline({
        path: [],
        strokeColor: '#000000',
        strokeOpacity: 0.35,
        strokeWeight: LINE_WEIGHT + 5,
        zIndex: 1,
        map: this.map
      })
      side.polyline = new google.maps.Polyline({
        path: [],
        strokeColor: side.color,
        strokeOpacity: 1,
        strokeWeight: LINE_WEIGHT,
        zIndex: 2,
        map: this.map
      })
      side.marker = this.createMarker(side)
    })

    this.fitBounds()
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.followZoom = Math.min(18, (this.map.getZoom() || 15) + 1)
    })
  }

  createMarker(side) {
    const wrap = document.createElement('div')
    wrap.className = 'display-replay-pilot'
    wrap.style.setProperty('--pilot-color', side.color)

    const pulse = document.createElement('div')
    pulse.className = 'display-replay-pilot-pulse'

    const arrow = document.createElement('div')
    arrow.className = 'display-replay-pilot-arrow'
    arrow.style.maskImage = `url(${this.locationArrowUrlValue})`
    arrow.style.webkitMaskImage = `url(${this.locationArrowUrlValue})`

    wrap.append(pulse, arrow)
    side.arrow = arrow

    return new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: { lat: side.points[0].lat, lng: side.points[0].lng },
      content: wrap
    })
  }

  drawFinishLine() {
    if (!this.payload.finishLine) return

    new google.maps.Polyline({
      path: this.payload.finishLine,
      geodesic: true,
      strokeColor: FINISH_COLOR,
      strokeOpacity: 1,
      strokeWeight: 3,
      icons: [
        {
          icon: { path: 'M 0,-1 0,1', strokeColor: '#ffffff', strokeWeight: 3, scale: 3 },
          offset: '0',
          repeat: '14px'
        }
      ],
      map: this.map
    })
  }

  fitBounds() {
    const bounds = new google.maps.LatLngBounds()
    this.sides.forEach(side =>
      side.points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
    )
    if (this.payload.finishLine) this.payload.finishLine.forEach(p => bounds.extend(p))
    this.map.fitBounds(bounds, 64)
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
    this.playerT = this.startT
    this.minRemaining = Infinity
    this.doneAt = null
    this.lastFrame = performance.now()
    this.raf = requestAnimationFrame(t => this.frame(t))
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  reset() {
    this.sides.forEach(side => {
      side.flashed = false
      try {
        if (side.polyline) side.polyline.setPath([])
        if (side.shadow) side.shadow.setPath([])
        if (side.marker)
          side.marker.position = { lat: side.points[0].lat, lng: side.points[0].lng }
      } catch {
        // ignore map errors
      }
    })
    this.timeTargets.forEach(el => el.classList.remove('is-flash'))
    this.clockTarget.classList.remove('is-flash')
    this.renderStats(this.startT)
    this.clockTarget.textContent = '0.00'
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

    const slow = this.minRemaining < SLOWMO_DISTANCE
    this.playerT += dt * (slow ? this.rate / SLOWMO : this.rate)
    this.renderStats(this.playerT)
    this.followCamera()

    if (this.playerT >= this.endT) {
      if (this.doneAt == null) this.doneAt = now
      else if (now - this.doneAt > HOLD * 1000) this.stop()
    }
  }

  renderStats(playerT) {
    const shown = Math.min(playerT, this.endT)
    let maxTime = 0
    let minRemaining = Infinity
    this.positions = []

    this.sides.forEach((side, index) => {
      const at = this.interpolate(side.points, shown)
      this.positions.push(at)

      try {
        if (side.polyline) {
          const path = this.visiblePath(side.points, shown, at)
          side.polyline.setPath(path)
          if (side.shadow) side.shadow.setPath(path)
        }
        if (side.marker) {
          side.marker.position = { lat: at.lat, lng: at.lng }
          side.arrow.style.transform = `rotate(${this.bearing(side.points, shown) - 45}deg)`
        }
      } catch {
        // map may be unavailable (e.g. quota) — keep updating the stat cards
      }

      const speed = Math.round(Math.sqrt(at.hSpeed ** 2 + at.vSpeed ** 2))
      const finished =
        side.crossT != null
          ? shown >= side.crossT
          : side.result != null && shown >= side.result
      const meters = finished ? 0 : Math.max(0, Math.round(this.distanceToFinish(at)))
      const raceTime = this.raceTimeFor(side, shown, finished)

      if (!finished) minRemaining = Math.min(minRemaining, meters)
      if (finished && !side.flashed) {
        side.flashed = true
        this.flash(this.timeTargets[index])
        this.flash(this.clockTarget)
      }

      this.speedTargets[index].textContent = String(speed)
      this.metersTargets[index].textContent = String(meters)
      this.timeTargets[index].textContent = Math.max(0, raceTime).toFixed(2)
      maxTime = Math.max(maxTime, raceTime)
    })

    this.minRemaining = minRemaining
    this.clockTarget.textContent = Math.max(0, maxTime).toFixed(2)
  }

  // Displayed race time: counts up to the official result and reaches it
  // exactly when the pilot crosses the finish line, then holds.
  raceTimeFor(side, shown, finished) {
    if (side.result == null) return Math.max(0, shown)
    if (finished) return side.result
    if (side.crossT != null && side.crossT > 0) {
      return Math.min(side.result, (Math.max(0, shown) / side.crossT) * side.result)
    }
    return Math.max(0, Math.min(shown, side.result))
  }

  followCamera() {
    if (!this.map || !this.positions || this.positions.length === 0) return

    const lat = this.positions.reduce((s, p) => s + p.lat, 0) / this.positions.length
    const lng = this.positions.reduce((s, p) => s + p.lng, 0) / this.positions.length

    try {
      this.map.moveCamera({
        center: { lat, lng },
        zoom: this.followZoom || this.map.getZoom()
      })
    } catch {
      // ignore map errors
    }
  }

  flash(el) {
    el.classList.remove('is-flash')
    void el.offsetWidth
    el.classList.add('is-flash')
  }

  visiblePath(points, t, head) {
    const path = []
    for (const p of points) {
      if (p.t <= t) path.push({ lat: p.lat, lng: p.lng })
      else break
    }
    if (head) path.push({ lat: head.lat, lng: head.lng })
    return path
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
          lat: curr.lat + (next.lat - curr.lat) * f,
          lng: curr.lng + (next.lng - curr.lng) * f,
          hSpeed: curr.hSpeed + (next.hSpeed - curr.hSpeed) * f,
          vSpeed: curr.vSpeed + (next.vSpeed - curr.vSpeed) * f
        }
      }
    }
    return last
  }

  bearing(points, t) {
    if (points.length < 2) return 0

    let index = 0
    for (let i = 0; i < points.length - 1; i++) {
      if (t >= points[i].t && t < points[i + 1].t) {
        index = i
        break
      }
    }
    // Past the last segment the loop never matches; keep the final heading
    // instead of snapping back to the exit heading (index 0).
    if (t >= points[points.length - 1].t) index = points.length - 2

    const from = points[index]
    const to = points[Math.min(index + 4, points.length - 1)]
    const lat1 = (from.lat * Math.PI) / 180
    const lat2 = (to.lat * Math.PI) / 180
    const dLng = ((to.lng - from.lng) * Math.PI) / 180
    const y = Math.sin(dLng) * Math.cos(lat2)
    const x =
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
    return (Math.atan2(y, x) * 180) / Math.PI
  }

  distanceToFinish(point) {
    if (!this.finishCenter) return 0
    return this.haversine(point, this.finishCenter)
  }

  lineCenter(line) {
    if (!line || line.length < 2) return null
    return { lat: (line[0].lat + line[1].lat) / 2, lng: (line[0].lng + line[1].lng) / 2 }
  }

  haversine(a, b) {
    const R = 6371000
    const toRad = d => (d * Math.PI) / 180
    const dLat = toRad(b.lat - a.lat)
    const dLng = toRad(b.lng - a.lng)
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
  }

  showCountdown(remaining) {
    if (this.countdownTarget.hidden) this.countdownTarget.hidden = false
    const n = Math.ceil(remaining)
    this.countTextTarget.textContent = n > 0 ? String(n) : 'GO'
  }

  hideCountdown() {
    this.countdownTarget.hidden = true
  }
}
