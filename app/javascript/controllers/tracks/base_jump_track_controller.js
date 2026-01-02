import { Controller } from '@hotwired/stimulus'
import { initGlideChart, initSpeedsChart } from 'charts'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'

export default class extends Controller {
  static targets = [
    'sideProjection',
    'glideChart',
    'speedChart',
    'map',
    'playButton',
    'playbackSlider',
    'altitude',
    'altitudeSpent',
    'fullSpeed',
    'hSpeed',
    'vSpeed',
    'glideRatio',
    'angle'
  ]

  static values = {
    pointsUrl: String,
    locationArrowUrl: String
  }

  connect() {
    this.playing = false
    this.currentIndex = 0

    Promise.all([this.fetchPoints(), initMapsApi()]).then(([pointsData]) => {
      this.points = pointsData.points
      this.initCharts()
      this.renderMap()
      this.initPlayback()
    })
  }

  fetchPoints() {
    return fetch(this.pointsUrlValue, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        data.points.forEach(point => {
          point.gpsTime = new Date(point.gpsTime)
          point.hSpeed = point.hSpeed * 3.6
          point.vSpeed = point.vSpeed * 3.6
          point.fullSpeed = point.fullSpeed * 3.6
        })
        return data
      })
  }

  initCharts() {
    this.initSideProjection()
    this.initGlideChart()
    this.initSpeedsChart()
  }

  initSideProjection() {
    if (!this.hasSideProjectionTarget) return

    this.sideProjectionChart = new SideProjectionChart(this.sideProjectionTarget)
    this.sideProjectionChart.setFlightProfile(this.points).render()
  }

  initGlideChart() {
    if (!this.hasGlideChartTarget) return

    this.glideChartTarget.chart = initGlideChart(this.glideChartTarget, this.points, {
      windCancellation: false
    })
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    this.speedChartTarget.chart = initSpeedsChart(this.speedChartTarget, this.points, {
      windCancellation: false
    })
  }

  renderMap() {
    if (!this.hasMapTarget) return

    this.initMap()
    this.drawTrajectory()
    this.fitBounds()
  }

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: 'BASE_TRACK_MAP'
    })
  }

  drawTrajectory() {
    const mapPoints = this.points.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      hSpeed: p.hSpeed
    }))

    const trajectory = new Trajectory(mapPoints)

    for (let { path, color } of trajectory.polylines) {
      const polyline = new google.maps.Polyline({
        path,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 6
      })
      polyline.setMap(this.map)
    }
  }

  fitBounds() {
    const mapPoints = this.points.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude
    }))

    const bounds = new Bounds(mapPoints)
    const mapBounds = new google.maps.LatLngBounds()

    mapBounds.extend(new google.maps.LatLng(bounds.minLatitude, bounds.minLongitude))
    mapBounds.extend(new google.maps.LatLng(bounds.maxLatitude, bounds.maxLongitude))

    this.map.fitBounds(mapBounds)
    this.map.setCenter(mapBounds.getCenter())
  }

  initPlayback() {
    if (!this.hasPlaybackSliderTarget) return

    this.startAltitude = this.points[0].altitude
    this.playbackSliderTarget.max = this.points.length - 1
    this.createMapMarker()
  }

  createMapMarker() {
    if (!this.map) return

    const img = document.createElement('img')
    img.src = this.locationArrowUrlValue
    img.style.width = '24px'
    img.style.height = '24px'
    img.style.transform = 'translateY(50%) rotate(-45deg)'

    this.mapMarker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: { lat: this.points[0].latitude, lng: this.points[0].longitude },
      content: img
    })

    this.markerElement = img
  }

  togglePlay() {
    this.playing = !this.playing

    if (this.hasPlayButtonTarget) {
      this.playButtonTarget.classList.toggle('playing', this.playing)
    }

    if (this.playing) {
      const firstPointTime = this.points[0].gpsTime.getTime()
      const currentPointTime = this.points[this.currentIndex].gpsTime.getTime()
      this.playbackOffset = currentPointTime - firstPointTime
      this.playbackStartTime = performance.now()
      this.animationFrame = requestAnimationFrame(t => this.animate(t))
    } else {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
    }
  }

  animate(timestamp) {
    if (!this.playing) return

    const elapsed = timestamp - this.playbackStartTime
    const firstPointTime = this.points[0].gpsTime.getTime()
    const targetTime = firstPointTime + this.playbackOffset + elapsed
    const lastPointTime = this.points[this.points.length - 1].gpsTime.getTime()

    if (targetTime >= lastPointTime) {
      this.playing = false
      this.currentIndex = this.points.length - 1
      if (this.hasPlayButtonTarget) {
        this.playButtonTarget.classList.remove('playing')
      }
      this.updatePlaybackPosition()
      return
    }

    const { index, fraction } = this.findPointAtTime(targetTime)
    this.currentIndex = index
    this.currentFraction = fraction
    this.updatePlaybackPositionInterpolated()

    this.animationFrame = requestAnimationFrame(t => this.animate(t))
  }

  findPointAtTime(targetTime) {
    for (let i = 0; i < this.points.length - 1; i++) {
      const currTime = this.points[i].gpsTime.getTime()
      const nextTime = this.points[i + 1].gpsTime.getTime()

      if (targetTime >= currTime && targetTime < nextTime) {
        const fraction = (targetTime - currTime) / (nextTime - currTime)
        return { index: i, fraction }
      }
    }

    return { index: this.points.length - 1, fraction: 0 }
  }

  onSliderInput() {
    this.currentIndex = parseInt(this.playbackSliderTarget.value, 10)
    this.currentFraction = 0
    this.updatePlaybackPosition()
  }

  updatePlaybackPosition() {
    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = this.currentIndex
    }

    if (this.sideProjectionChart) {
      this.sideProjectionChart.showCrosshair(this.currentIndex)
    }

    this.updateHighchartsCrosshair(this.currentIndex)
    this.updateIndicators(this.currentIndex, 0)
    this.updateMapMarkerAtIndex(this.currentIndex)
  }

  updatePlaybackPositionInterpolated() {
    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = this.currentIndex
    }

    if (this.sideProjectionChart) {
      this.sideProjectionChart.showCrosshairInterpolated(
        this.currentIndex,
        this.currentFraction
      )
    }

    this.updateHighchartsCrosshair(this.currentIndex)
    this.updateIndicators(this.currentIndex, this.currentFraction)
    this.updateMapMarkerInterpolated()
  }

  updateIndicators(index, fraction) {
    const curr = this.points[index]
    const next = this.points[Math.min(index + 1, this.points.length - 1)]

    const interpolate = (a, b) => a + (b - a) * fraction
    const roundToStep = (value, step) => Math.round(value / step) * step

    const altitude = interpolate(curr.altitude, next.altitude)
    const altitudeSpent = this.startAltitude - altitude
    const fullSpeed = interpolate(curr.fullSpeed, next.fullSpeed)
    const hSpeed = interpolate(curr.hSpeed, next.hSpeed)
    const vSpeed = interpolate(curr.vSpeed, next.vSpeed)
    const glideRatio = interpolate(curr.glideRatio ?? 0, next.glideRatio ?? 0)

    if (this.hasAltitudeTarget) {
      this.altitudeTarget.textContent = roundToStep(altitude, 10).toFixed()
    }
    if (this.hasAltitudeSpentTarget) {
      this.altitudeSpentTarget.textContent = roundToStep(altitudeSpent, 10).toFixed()
    }
    if (this.hasFullSpeedTarget) {
      this.fullSpeedTarget.textContent = roundToStep(fullSpeed, 5).toFixed()
    }
    if (this.hasHSpeedTarget) {
      this.hSpeedTarget.textContent = roundToStep(hSpeed, 5).toFixed()
    }
    if (this.hasVSpeedTarget) {
      this.vSpeedTarget.textContent = roundToStep(vSpeed, 5).toFixed()
    }
    if (this.hasGlideRatioTarget) {
      this.glideRatioTarget.textContent = glideRatio.toFixed(1)
    }
    if (this.hasAngleTarget) {
      const angle = (90 * Math.PI) / 180 - Math.atan2(vSpeed, hSpeed)
      const startX = 15 * Math.sin(angle)
      const startY = 115 + 15 * Math.cos(angle)
      const endX = 65 * Math.sin(angle)
      const endY = 115 + 65 * Math.cos(angle)
      this.angleTarget.setAttribute('d', `M ${startX} ${startY} ${endX} ${endY}`)
    }
  }

  updateHighchartsCrosshair(index) {
    const charts = [this.glideChartTarget?.chart, this.speedChartTarget?.chart].filter(
      Boolean
    )

    charts.forEach(chart => {
      if (!chart.series?.[0]?.points?.[index]) return

      const point = chart.series[0].points[index]
      chart.xAxis[0].drawCrosshair(null, point)
    })
  }

  updateMapMarkerAtIndex(index) {
    if (!this.mapMarker || !this.markerElement) return

    const point = this.points[index]
    this.mapMarker.position = { lat: point.latitude, lng: point.longitude }

    const targetIndex = this.findTargetIndexFrom(index)
    const targetPoint = this.points[targetIndex]
    const rotation = this.calculateBearing(point, targetPoint)

    this.markerElement.style.transform = `translateY(50%) rotate(${rotation - 45}deg)`
  }

  updateMapMarkerInterpolated() {
    if (!this.mapMarker || !this.markerElement) return

    const curr = this.points[this.currentIndex]
    const next = this.points[Math.min(this.currentIndex + 1, this.points.length - 1)]
    const fraction = this.currentFraction

    const lat = curr.latitude + (next.latitude - curr.latitude) * fraction
    const lng = curr.longitude + (next.longitude - curr.longitude) * fraction

    this.mapMarker.position = { lat, lng }

    const targetIndex = this.findTargetIndexFrom(this.currentIndex)
    const targetPoint = this.points[targetIndex]
    const rotation = this.calculateBearing({ latitude: lat, longitude: lng }, targetPoint)

    this.markerElement.style.transform = `translateY(50%) rotate(${rotation - 45}deg)`
  }

  findTargetIndexFrom(fromIndex) {
    const currentTime = this.points[fromIndex].gpsTime.getTime()
    const targetTime = currentTime + 3000

    for (let i = fromIndex + 1; i < this.points.length; i++) {
      if (this.points[i].gpsTime.getTime() >= targetTime) {
        return i
      }
    }

    return this.points.length - 1
  }

  calculateBearing(from, to) {
    const lat1 = (from.latitude * Math.PI) / 180
    const lat2 = (to.latitude * Math.PI) / 180
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180

    const y = Math.sin(dLon) * Math.cos(lat2)
    const x =
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

    const bearing = (Math.atan2(y, x) * 180) / Math.PI
    return (bearing + 360) % 360
  }

  disconnect() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    if (this.sideProjectionChart) {
      this.sideProjectionChart.destroy()
    }
    if (this.glideChartTarget?.chart) {
      this.glideChartTarget.chart.destroy()
    }
    if (this.speedChartTarget?.chart) {
      this.speedChartTarget.chart.destroy()
    }
  }
}
