import PlaybackController from '../playback_controller'
import { calculateBearing, findLineCrossing } from 'utils/tracks/pointHelpers'
import { initGlideChart, initSpeedsChart, initAccuracyChart } from 'charts'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import initMapsApi from 'utils/google_maps_api'
import { isTurboPreview } from 'utils/turbo_preview'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import { fetchTrackPoints } from 'utils/tracks/trackData'

export default class extends PlaybackController {
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
    if (isTurboPreview()) return

    this.playing = false
    this.currentIndex = 0

    Promise.all([
      fetchTrackPoints(this.pointsUrlValue, { convertSpeeds: true }),
      initMapsApi()
    ])
      .then(([pointsData]) => {
        if (!pointsData.points || pointsData.points.length === 0) return

        this.points = pointsData.points
        this.findFinishLineCrossing()
        this.initCharts()
        this.renderMap()
        this.initPlayback()
        this.displayMaxHSpeed()
        this.displayResultTime()
      })
      .catch(error => console.error('Failed to load result track', error))
  }

  findFinishLineCrossing() {
    const crossing = findLineCrossing(this.points, this.finishLine)
    if (!crossing) return

    this.finishCrossingIndex = crossing.index
    this.finishCrossingFraction = crossing.fraction
  }

  get finishLine() {
    if (!this.hasFinishLine) return null

    return {
      start: {
        latitude: this.finishLineStartLatValue,
        longitude: this.finishLineStartLonValue
      },
      end: { latitude: this.finishLineEndLatValue, longitude: this.finishLineEndLonValue }
    }
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
      this.sideProjectionChart.setFinishLineCrossing(
        this.finishCrossingIndex,
        this.finishCrossingFraction,
        this.resultTimeValue
      )
    }

    this.sideProjectionChart.render()
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

  onChartHover(event) {
    if (!this.points || this.points.length === 0) return

    const chart = this.chartForHover()
    if (!chart?.pointer) return

    const normalized = chart.pointer.normalize(event)
    const series = chart.series.find(item => item.visible && item.points?.length)
    if (!series) return

    const point = series.searchPoint(normalized, true)
    if (point == null || point.index == null) return

    this.currentIndex = point.index
    this.currentFraction = 0
    this.updatePlaybackPosition()
  }

  chartForHover() {
    return (
      (this.hasGlideChartTarget && this.glideChartTarget.chart) ||
      (this.hasSpeedChartTarget && this.speedChartTarget.chart) ||
      (this.hasSepChartTarget && this.sepChartTarget.chart)
    )
  }

  initGlideChart() {
    if (!this.hasGlideChartTarget) return

    const plotLines = this.finishCrossingIndex
      ? [{ value: this.finishCrossingIndex, color: '#f44336', width: 2 }]
      : []

    this.glideChartTarget.chart = initGlideChart(this.glideChartTarget, this.points, {
      windCancellation: false,
      showTitle: false,
      legend: this.floatingLegend,
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
      showTitle: false,
      legend: this.floatingLegend,
      plotLines
    })
  }

  get floatingLegend() {
    return {
      enabled: true,
      floating: true,
      align: 'right',
      verticalAlign: 'top',
      layout: 'horizontal',
      x: -10,
      y: -6,
      padding: 4
    }
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

  get playbackPoints() {
    return this.points
  }

  pointTime(point) {
    return point.gpsTime.getTime()
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
      const points = chart.series
        .filter(series => series.visible && series.enableMouseTracking !== false)
        .map(series => series.points?.[index])
        .filter(Boolean)

      if (points.length === 0) return

      points[0].onMouseOver()
      chart.tooltip.refresh(points)
      chart.xAxis[0].drawCrosshair(null, points[0])
    })
  }

  updateMapMarkerAtIndex(index) {
    if (!this.mapMarker || !this.markerElement) return

    const point = this.points[index]
    this.mapMarker.position = { lat: point.latitude, lng: point.longitude }

    const targetIndex = this.findTargetIndexFrom(index)
    const targetPoint = this.points[targetIndex]
    const rotation = calculateBearing(point, targetPoint)

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
    const rotation = calculateBearing({ latitude: lat, longitude: lng }, targetPoint)

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

  disconnect() {
    this.stopPlaybackLoop()
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
