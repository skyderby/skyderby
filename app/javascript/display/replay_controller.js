import { Controller } from '@hotwired/stimulus'
import loadMaps from './maps_loader'

const SYNC_VSPEED = 10 // km/h — race start, same point BASE Pro View zeroes time at
const FINISH_COLOR = '#e84855'
const RACE_WINDOW = 26 // seconds of wall-clock the race is compressed into
const COUNTDOWN = 3 // seconds
const HOLD = 3 // seconds to hold the result before the slide advances
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
    this.sides = this.payload.sides.map(side => {
      const points = side.path
      const sync = this.syncTime(points)
      points.forEach(p => {
        p.t = p.flTime - sync
      })
      return { ...side, points }
    })

    this.startT = Math.min(...this.sides.map(s => s.points[0].t))
    this.endT = Math.max(...this.sides.map(s => s.points[s.points.length - 1].t))
    this.span = this.endT - this.startT
    this.rate = Math.max(1, this.span / RACE_WINDOW)
    this.finishCenter = this.lineCenter(this.payload.finishLine)
    this.ready = true
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
      side.polyline = new google.maps.Polyline({
        path: [],
        strokeColor: side.color,
        strokeOpacity: 1,
        strokeWeight: 5,
        map: this.map
      })
      side.marker = this.createMarker(side)
    })

    this.fitBounds()
  }

  createMarker(side) {
    const arrow = document.createElement('div')
    arrow.className = 'display-replay-pilot'
    arrow.style.maskImage = `url(${this.locationArrowUrlValue})`
    arrow.style.webkitMaskImage = `url(${this.locationArrowUrlValue})`
    arrow.style.backgroundColor = side.color

    return new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: { lat: side.points[0].lat, lng: side.points[0].lng },
      content: arrow
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
    this.t0 = performance.now()
    this.raf = requestAnimationFrame(t => this.frame(t))
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  reset() {
    this.sides.forEach(side => {
      try {
        if (side.polyline) side.polyline.setPath([])
        if (side.marker)
          side.marker.position = { lat: side.points[0].lat, lng: side.points[0].lng }
      } catch {
        // ignore map errors
      }
    })
    this.renderStats(this.startT)
    this.clockTarget.textContent = '0.00'
  }

  frame(now) {
    this.raf = requestAnimationFrame(t => this.frame(t))
    const elapsed = (now - this.t0) / 1000

    if (this.phase === 'countdown') {
      const remaining = COUNTDOWN - elapsed
      this.showCountdown(remaining)
      if (remaining <= 0) {
        this.hideCountdown()
        this.phase = 'running'
        this.t0 = now
      }
      return
    }

    const playerT = this.startT + elapsed * this.rate
    this.renderStats(playerT)

    if (playerT >= this.endT + HOLD * this.rate) {
      this.stop()
    }
  }

  renderStats(playerT) {
    const shown = Math.min(playerT, this.endT)
    let maxTime = 0

    this.sides.forEach((side, index) => {
      const at = this.interpolate(side.points, shown)

      try {
        if (side.polyline) side.polyline.setPath(this.visiblePath(side.points, shown, at))
        if (side.marker) {
          side.marker.position = { lat: at.lat, lng: at.lng }
          side.marker.content.style.transform = `rotate(${this.bearing(side.points, shown) - 45}deg)`
        }
      } catch {
        // map may be unavailable (e.g. quota) — keep updating the stat cards
      }

      const speed = Math.round(Math.sqrt(at.hSpeed ** 2 + at.vSpeed ** 2))
      const meters = Math.max(0, Math.round(this.distanceToFinish(at)))
      const raceTime = Math.max(
        0,
        Math.min(shown, side.result != null ? side.result : shown)
      )

      this.speedTargets[index].textContent = String(speed)
      this.metersTargets[index].textContent = String(meters)
      this.timeTargets[index].textContent = raceTime.toFixed(2)
      maxTime = Math.max(maxTime, raceTime)
    })

    this.clockTarget.textContent = Math.max(0, maxTime).toFixed(2)
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
    let index = 0
    for (let i = 0; i < points.length - 1; i++) {
      if (t >= points[i].t && t < points[i + 1].t) {
        index = i
        break
      }
    }
    const from = points[index]
    const to = points[Math.min(index + 4, points.length - 1)]
    const y =
      Math.sin(((to.lng - from.lng) * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180)
    const x =
      Math.cos((from.lat * Math.PI) / 180) * Math.sin((to.lat * Math.PI) / 180) -
      Math.sin((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.cos(((to.lng - from.lng) * Math.PI) / 180)
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
