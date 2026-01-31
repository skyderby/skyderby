import { Controller } from '@hotwired/stimulus'
import { initGlideChart, initSpeedsChart, initAccuracyChart } from 'charts'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

export default class extends Controller {
  static targets = [
    'sideProjection',
    'glideChart',
    'speedChart',
    'sepChart',
    'map',
    'playButton',
    'playbackSlider',
    'playbackIndicators',
    'resultTime',
    'maxHSpeed'
  ]

  static values = {
    pointsUrl: String,
    locationArrowUrl: String,
    finishLineStartLat: Number,
    finishLineStartLon: Number,
    finishLineEndLat: Number,
    finishLineEndLon: Number,
    resultTime: Number
  }

  connect() {
    this.playing = false
    this.currentIndex = 0

    Promise.all([this.fetchPoints(), initMapsApi()]).then(([pointsData]) => {
      this.points = pointsData.points
      this.findFinishLineCrossing()
      this.initCharts()
      this.renderMap()
      this.initPlayback()
      this.displayMaxHSpeed()
      this.displayResultTime()
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

  findFinishLineCrossing() {
    if (!this.hasFinishLine) return

    const finishLine = {
      start: { lat: this.finishLineStartLatValue, lon: this.finishLineStartLonValue },
      end: { lat: this.finishLineEndLatValue, lon: this.finishLineEndLonValue }
    }

    for (let i = 1; i < this.points.length; i++) {
      const prev = this.points[i - 1]
      const curr = this.points[i]

      const intersection = this.lineIntersection(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
        finishLine.start.lat,
        finishLine.start.lon,
        finishLine.end.lat,
        finishLine.end.lon
      )

      if (intersection) {
        this.finishCrossingIndex = i
        this.finishCrossingPoint = intersection
        this.finishCrossingFraction = this.calculateFraction(
          prev,
          curr,
          intersection.lat,
          intersection.lon
        )
        break
      }
    }
  }

  lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (Math.abs(denom) < 1e-10) return null

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        lat: x1 + t * (x2 - x1),
        lon: y1 + t * (y2 - y1)
      }
    }
    return null
  }

  calculateFraction(prev, curr, lat, lon) {
    const totalDist = Math.sqrt(
      Math.pow(curr.latitude - prev.latitude, 2) +
        Math.pow(curr.longitude - prev.longitude, 2)
    )
    const partDist = Math.sqrt(
      Math.pow(lat - prev.latitude, 2) + Math.pow(lon - prev.longitude, 2)
    )
    return partDist / totalDist
  }

  get hasFinishLine() {
    return (
      this.hasFinishLineStartLatValue &&
      this.hasFinishLineStartLonValue &&
      this.hasFinishLineEndLatValue &&
      this.hasFinishLineEndLonValue
    )
  }

  displayResultTime() {
    if (!this.hasResultTimeTarget || !this.hasResultTimeValue) return

    const seconds = this.resultTimeValue
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = (seconds % 60).toFixed(1)
    const formatted =
      minutes > 0
        ? `${minutes}:${remainingSeconds.padStart(4, '0')}`
        : `${remainingSeconds}s`

    this.resultTimeTarget.textContent = formatted
  }

  displayMaxHSpeed() {
    if (!this.hasMaxHSpeedTarget || !this.points?.length) return

    const maxHSpeed = Math.max(...this.points.map(p => p.hSpeed))
    this.maxHSpeedTarget.textContent = Math.round(maxHSpeed)
  }

  initCharts() {
    this.initSideProjection()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initSepChart()
  }

  initSideProjection() {
    if (!this.hasSideProjectionTarget) return

    this.sideProjectionChart = new SideProjectionChart(this.sideProjectionTarget, {
      onPointHover: index => this.onSideProjectionHover(index)
    })
    this.sideProjectionChart.setFlightProfile(this.points)

    if (this.finishCrossingIndex !== undefined) {
      const crossingDistance =
        this.calculateDistanceToIndex(this.finishCrossingIndex - 1) +
        this.finishCrossingFraction *
          this.calculateSegmentDistance(
            this.points[this.finishCrossingIndex - 1],
            this.points[this.finishCrossingIndex]
          )
      this.sideProjectionChart.setFinishLineCrossing(
        crossingDistance,
        this.resultTimeValue
      )
    }

    this.sideProjectionChart.render()
  }

  calculateDistanceToIndex(index) {
    let distance = 0
    for (let i = 1; i <= index; i++) {
      distance += this.calculateSegmentDistance(this.points[i - 1], this.points[i])
    }
    return distance
  }

  calculateSegmentDistance(p1, p2) {
    const pos1 = new LatLon(p1.latitude, p1.longitude)
    const pos2 = new LatLon(p2.latitude, p2.longitude)
    return pos1.distanceTo(pos2)
  }

  onSideProjectionHover(index) {
    this.currentIndex = index
    this.currentFraction = 0

    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = index
    }

    this.updateHighchartsCrosshair(index)
    this.updateIndicators(index, 0)
    this.updateMapMarkerAtIndex(index)
  }

  initGlideChart() {
    if (!this.hasGlideChartTarget) return

    const plotLines = this.finishCrossingIndex
      ? [{ value: this.finishCrossingIndex, color: '#f44336', width: 2 }]
      : []

    this.glideChartTarget.chart = initGlideChart(this.glideChartTarget, this.points, {
      windCancellation: false,
      plotLines
    })
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    const plotLines = this.finishCrossingIndex
      ? [{ value: this.finishCrossingIndex, color: '#f44336', width: 2 }]
      : []

    this.speedChartTarget.chart = initSpeedsChart(this.speedChartTarget, this.points, {
      windCancellation: false,
      plotLines
    })
  }

  initSepChart() {
    if (!this.hasSepChartTarget) return

    const plotLines = this.finishCrossingIndex
      ? [{ value: this.finishCrossingIndex, color: '#f44336', width: 2 }]
      : []

    this.sepChartTarget.chart = initAccuracyChart(this.sepChartTarget, this.points, {
      plotLines
    })
  }

  renderMap() {
    if (!this.hasMapTarget) return

    this.initMap()
    this.drawTrajectory()
    this.drawFinishLine()
    this.fitBounds()
  }

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: 'TOURNAMENT_RESULT_MAP'
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

  drawFinishLine() {
    if (!this.hasFinishLine) return

    const finishLinePath = [
      { lat: this.finishLineStartLatValue, lng: this.finishLineStartLonValue },
      { lat: this.finishLineEndLatValue, lng: this.finishLineEndLonValue }
    ]

    new google.maps.Polyline({
      path: finishLinePath,
      strokeColor: '#f44336',
      strokeOpacity: 1,
      strokeWeight: 4,
      map: this.map
    })
  }

  fitBounds() {
    const mapPoints = this.points.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude
    }))

    if (this.hasFinishLine) {
      mapPoints.push(
        {
          latitude: this.finishLineStartLatValue,
          longitude: this.finishLineStartLonValue
        },
        { latitude: this.finishLineEndLatValue, longitude: this.finishLineEndLonValue }
      )
    }

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

    const altitude = interpolate(curr.altitude, next.altitude)
    const altitudeSpent = this.startAltitude - altitude
    const fullSpeed = interpolate(curr.fullSpeed, next.fullSpeed)
    const hSpeed = interpolate(curr.hSpeed, next.hSpeed)
    const vSpeed = interpolate(curr.vSpeed, next.vSpeed)
    const glideRatio = interpolate(curr.glideRatio ?? 0, next.glideRatio ?? 0)

    const controller = this.getPlaybackIndicatorsController()
    if (controller) {
      controller.update({
        altitude,
        altitudeSpent,
        fullSpeed,
        hSpeed,
        vSpeed,
        glideRatio
      })
    }

    this.updateAccelerationIndicators(index, fraction)
  }

  updateAccelerationIndicators(index, fraction) {
    const futureIndex = this.findFutureIndexFrom(index, 1000)
    if (futureIndex === null) return

    const curr = this.points[index]
    const next = this.points[Math.min(index + 1, this.points.length - 1)]
    const future = this.points[futureIndex]

    const interpolate = (a, b) => a + (b - a) * fraction

    const currFullSpeed = interpolate(curr.fullSpeed, next.fullSpeed) / 3.6
    const currHSpeed = interpolate(curr.hSpeed, next.hSpeed) / 3.6
    const currVSpeed = interpolate(curr.vSpeed, next.vSpeed) / 3.6
    const futureFullSpeed = future.fullSpeed / 3.6
    const futureHSpeed = future.hSpeed / 3.6
    const futureVSpeed = future.vSpeed / 3.6

    const currTime =
      curr.gpsTime.getTime() +
      fraction * (next.gpsTime.getTime() - curr.gpsTime.getTime())
    const deltaTime = (future.gpsTime.getTime() - currTime) / 1000

    const fullSpeedAccel = (futureFullSpeed - currFullSpeed) / deltaTime
    const hSpeedAccel = (futureHSpeed - currHSpeed) / deltaTime
    const vSpeedAccel = (futureVSpeed - currVSpeed) / deltaTime

    const controller = this.getPlaybackIndicatorsController()
    if (controller) {
      controller.updateAcceleration({ fullSpeedAccel, hSpeedAccel, vSpeedAccel })
    }
  }

  getPlaybackIndicatorsController() {
    if (!this.hasPlaybackIndicatorsTarget) return null

    return this.application.getControllerForElementAndIdentifier(
      this.playbackIndicatorsTarget,
      'playback-indicators'
    )
  }

  findFutureIndexFrom(fromIndex, milliseconds) {
    const currentTime = this.points[fromIndex].gpsTime.getTime()
    const targetTime = currentTime + milliseconds

    for (let i = fromIndex + 1; i < this.points.length; i++) {
      if (this.points[i].gpsTime.getTime() >= targetTime) {
        return i
      }
    }

    return null
  }

  updateHighchartsCrosshair(index) {
    const charts = [
      this.glideChartTarget?.chart,
      this.speedChartTarget?.chart,
      this.sepChartTarget?.chart
    ].filter(Boolean)

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
    if (this.sepChartTarget?.chart) {
      this.sepChartTarget.chart.destroy()
    }
  }
}
