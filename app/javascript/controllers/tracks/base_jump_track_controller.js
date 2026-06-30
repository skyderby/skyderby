import { Controller } from '@hotwired/stimulus'
import { initGlideChart, initSpeedsChart, initAccuracyChart } from 'charts'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'

const SYNC_VERTICAL_SPEED = 10
const FINISH_LINE_COLOR = '#8b0000'
const FINISH_LINE_STORAGE_KEY = 'baseJumpFinishLineVisible'

export default class extends Controller {
  static targets = [
    'sideProjection',
    'glideChart',
    'speedChart',
    'sepChart',
    'terrainProfileSelect',
    'map',
    'playButton',
    'playbackSlider',
    'playbackIndicators',
    'comparePlaybackIndicators',
    'compareModal',
    'expandMapToggle',
    'finishLineToggle'
  ]

  static values = {
    pointsUrl: String,
    locationArrowUrl: String,
    defaultTerrainProfileId: Number,
    trackId: Number,
    comparePointsUrl: String,
    compareTrackName: String,
    compareSamePlace: Boolean,
    finishLineStartLat: Number,
    finishLineStartLon: Number,
    finishLineEndLat: Number,
    finishLineEndLon: Number,
    raceResultTime: Number
  }

  connect() {
    this.playing = false
    this.currentIndex = 0
    this.comparePoints = null

    const fetches = [this.fetchPoints(this.pointsUrlValue), initMapsApi()]
    if (this.hasComparePointsUrlValue) {
      fetches.push(this.fetchPoints(this.comparePointsUrlValue))
    }

    Promise.all(fetches).then(([pointsData, , compareData]) => {
      this.points = pointsData.points
      this.points.forEach(point => {
        point.playerTime = point.flTime - this.points[0].flTime
      })
      this.primarySyncFlTime = this.syncFlTime(this.points)

      if (compareData && compareData.points.length > 0) {
        this.comparePoints = compareData.points
        this.prepareCompare()
      }

      this.findFinishLineCrossings()
      this.initCharts()
      this.renderMap()
      this.initPlayback()
      this.loadDefaultTerrainProfile()
      this.initFinishLineToggle()
    })
  }

  get hasFinishLine() {
    return (
      this.hasFinishLineStartLatValue &&
      this.hasFinishLineStartLonValue &&
      this.hasFinishLineEndLatValue &&
      this.hasFinishLineEndLonValue
    )
  }

  findFinishLineCrossings() {
    if (!this.hasFinishLine) return

    this.primaryCrossing = this.findCrossing(this.points)
    if (this.hasCompare) {
      this.compareCrossing = this.findCrossing(this.comparePoints)
    }
  }

  findCrossing(points) {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]

      const intersection = this.lineIntersection(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
        this.finishLineStartLatValue,
        this.finishLineStartLonValue,
        this.finishLineEndLatValue,
        this.finishLineEndLonValue
      )

      if (intersection) {
        return {
          index: i,
          fraction: this.calculateFraction(prev, curr, intersection.lat, intersection.lon)
        }
      }
    }
    return null
  }

  lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (Math.abs(denom) < 1e-10) return null

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return { lat: x1 + t * (x2 - x1), lon: y1 + t * (y2 - y1) }
    }
    return null
  }

  calculateFraction(prev, curr, lat, lon) {
    const totalDist = Math.hypot(
      curr.latitude - prev.latitude,
      curr.longitude - prev.longitude
    )
    const partDist = Math.hypot(lat - prev.latitude, lon - prev.longitude)
    return totalDist === 0 ? 0 : partDist / totalDist
  }

  initFinishLineToggle() {
    if (!this.hasFinishLine) return

    const stored = localStorage.getItem(FINISH_LINE_STORAGE_KEY)
    this.finishLineVisible = stored === null ? true : stored === '1'

    if (this.hasFinishLineToggleTarget) {
      this.finishLineToggleTarget.checked = this.finishLineVisible
    }

    this.applyFinishLineVisibility()
  }

  toggleFinishLine(event) {
    this.finishLineVisible = event.target.checked
    localStorage.setItem(FINISH_LINE_STORAGE_KEY, this.finishLineVisible ? '1' : '0')
    this.applyFinishLineVisibility()
  }

  applyFinishLineVisibility() {
    if (this.finishLinePolyline) {
      this.finishLinePolyline.setMap(this.finishLineVisible ? this.map : null)
    }

    this.sideProjectionChart?.setFinishLineVisible(this.finishLineVisible)

    const finishTime = this.primaryFinishTime()
    const charts = [this.speedChartTarget?.chart, this.glideChartTarget?.chart]
    charts.forEach(chart => {
      if (!chart) return

      chart.xAxis[0].removePlotLine('finish-line')
      if (this.finishLineVisible && finishTime != null) {
        chart.xAxis[0].addPlotLine({
          id: 'finish-line',
          value: finishTime,
          color: FINISH_LINE_COLOR,
          width: 1.5,
          dashStyle: 'Dash',
          zIndex: 5
        })
      }
    })
  }

  primaryFinishTime() {
    if (this.hasRaceResultTimeValue) return this.raceResultTimeValue
    if (!this.primaryCrossing || this.primarySyncFlTime == null) return null

    const { index, fraction } = this.primaryCrossing
    const prev = this.points[index - 1]
    const curr = this.points[index]
    const crossingFlTime = prev.flTime + (curr.flTime - prev.flTime) * fraction
    return crossingFlTime - this.primarySyncFlTime
  }

  compareFinishTime() {
    if (this.compareSyncFlTime == null || !this.compareCrossing) return null

    const { index, fraction } = this.compareCrossing
    const prev = this.comparePoints[index - 1]
    const curr = this.comparePoints[index]
    const crossingFlTime = prev.flTime + (curr.flTime - prev.flTime) * fraction
    return crossingFlTime - this.compareSyncFlTime
  }

  fetchPoints(url) {
    return fetch(url, {
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

  prepareCompare() {
    const primarySync = this.primarySyncFlTime
    const compareSync = this.syncFlTime(this.comparePoints)

    if (primarySync === null || compareSync === null) {
      this.comparePoints = null
      return
    }

    this.compareSyncFlTime = compareSync
    const primaryRel = primarySync - this.points[0].flTime
    const compareRel = compareSync - this.comparePoints[0].flTime
    this.compareTimeOffset = primaryRel - compareRel

    this.comparePoints.forEach(point => {
      point.playerTime =
        point.flTime - this.comparePoints[0].flTime + this.compareTimeOffset
    })
  }

  syncFlTime(points) {
    for (let i = 0; i < points.length; i++) {
      if (points[i].vSpeed < SYNC_VERTICAL_SPEED) continue

      if (i === 0) return points[0].flTime

      const curr = points[i - 1]
      const next = points[i]
      const fraction = (SYNC_VERTICAL_SPEED - curr.vSpeed) / (next.vSpeed - curr.vSpeed)
      return curr.flTime + (next.flTime - curr.flTime) * fraction
    }
    return null
  }

  get hasCompare() {
    return Boolean(this.comparePoints && this.comparePoints.length > 0)
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
      onPointHover: index => this.onSideProjectionHover(index),
      syncVerticalSpeed: SYNC_VERTICAL_SPEED
    })
    this.sideProjectionChart.setFlightProfile(this.points)

    if (this.hasCompare) {
      this.sideProjectionChart.setCompareProfile(this.comparePoints)
    }

    if (this.primaryCrossing) {
      this.sideProjectionChart.setFinishLineCrossing(
        this.primaryCrossing.index,
        this.primaryCrossing.fraction,
        this.primaryFinishTime()
      )
    }

    if (this.compareCrossing && this.hasCompare) {
      this.sideProjectionChart.setCompareFinishLineCrossing(
        this.compareCrossing.index,
        this.compareCrossing.fraction,
        this.compareFinishTime()
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

    this.glideChartTarget.chart = initGlideChart(this.glideChartTarget, this.points, {
      windCancellation: false,
      showTitle: false,
      showLegend: false,
      xOffset: this.chartXOffset,
      ...this.compareChartOptions
    })
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    this.speedChartTarget.chart = initSpeedsChart(this.speedChartTarget, this.points, {
      windCancellation: false,
      showTitle: false,
      xOffset: this.chartXOffset,
      ...this.compareChartOptions
    })
  }

  get chartXOffset() {
    if (this.primarySyncFlTime == null) return 0

    return this.primarySyncFlTime - this.points[0].flTime
  }

  get compareChartOptions() {
    if (!this.hasCompare) return {}

    return {
      comparePoints: this.comparePoints,
      compareTimeOffset: this.compareTimeOffset,
      compareTrackName: this.compareTrackNameValue
    }
  }

  initSepChart() {
    if (!this.hasSepChartTarget) return

    this.sepChartTarget.chart = initAccuracyChart(this.sepChartTarget, this.points, {
      xOffset: this.chartXOffset
    })
  }

  loadDefaultTerrainProfile() {
    if (!this.defaultTerrainProfileIdValue) return

    this.fetchTerrainProfile(this.defaultTerrainProfileIdValue)
  }

  handleTerrainProfileSelection(event) {
    const terrainProfileId = event.target.value
    if (!terrainProfileId) {
      this.sideProjectionChart?.setTerrainProfile(null).render()
      return
    }

    this.fetchTerrainProfile(terrainProfileId)
  }

  fetchTerrainProfile(terrainProfileId) {
    fetch(`/exit_measurements/${terrainProfileId}`, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        if (this.sideProjectionChart) {
          this.sideProjectionChart.setTerrainProfile(data.measurements).render()
        }
      })
  }

  renderMap() {
    if (!this.hasMapTarget) return

    this.initMap()
    this.drawTrajectory(this.points)
    if (this.showCompareOnMap) {
      this.drawTrajectory(this.comparePoints, { dashed: true, weight: 5 })
    }
    this.drawFinishLine()
    this.fitBounds()
  }

  drawFinishLine() {
    if (!this.hasFinishLine) return

    this.finishLinePolyline = new google.maps.Polyline({
      path: [
        { lat: this.finishLineStartLatValue, lng: this.finishLineStartLonValue },
        { lat: this.finishLineEndLatValue, lng: this.finishLineEndLonValue }
      ],
      strokeColor: FINISH_LINE_COLOR,
      strokeOpacity: 1,
      strokeWeight: 2
    })
  }

  get showCompareOnMap() {
    return this.hasCompare && this.compareSamePlaceValue
  }

  toggleExpandMap(event) {
    this.element.classList.toggle('base-jump--map-expanded', event.target.checked)

    if (this.map) {
      requestAnimationFrame(() => this.fitBounds())
    }
  }

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: 'BASE_TRACK_MAP',
      cameraControl: false,
      streetViewControl: false,
      zoomControl: true
    })
  }

  drawTrajectory(points, { dashed = false, weight = 6 } = {}) {
    const mapPoints = points.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      hSpeed: p.hSpeed
    }))

    const trajectory = new Trajectory(mapPoints)

    for (let { path, color } of trajectory.polylines) {
      const options = {
        path,
        strokeColor: color,
        strokeOpacity: dashed ? 0 : 1,
        strokeWeight: weight
      }

      if (dashed) {
        options.icons = [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeColor: color,
              strokeOpacity: 1,
              strokeWeight: weight,
              scale: 2
            },
            offset: '0',
            repeat: '12px'
          }
        ]
      }

      const polyline = new google.maps.Polyline(options)
      polyline.setMap(this.map)
    }
  }

  fitBounds() {
    const boundsPoints = this.showCompareOnMap
      ? this.points.concat(this.comparePoints)
      : this.points
    const mapPoints = boundsPoints.map(p => ({
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
    if (this.showCompareOnMap) {
      this.createCompareMapMarker()
    }
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

  createCompareMapMarker() {
    if (!this.map) return

    const arrow = document.createElement('div')
    arrow.className = 'base-jump-map-marker--compare'
    arrow.style.maskImage = `url(${this.locationArrowUrlValue})`
    arrow.style.webkitMaskImage = `url(${this.locationArrowUrlValue})`
    arrow.style.transform = 'translateY(50%) rotate(-45deg)'

    this.compareMapMarker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: {
        lat: this.comparePoints[0].latitude,
        lng: this.comparePoints[0].longitude
      },
      content: arrow
    })

    this.compareMarkerElement = arrow
  }

  updateCompareMapMarker(playerTime) {
    if (!this.compareMapMarker || !this.compareMarkerElement) return

    const position = this.interpolateCompareLatLng(playerTime)
    if (!position) return

    this.compareMapMarker.position = position

    const rotation = this.compareBearingAt(playerTime)
    this.compareMarkerElement.style.transform = `translateY(50%) rotate(${rotation - 45}deg)`
  }

  compareBearingAt(playerTime) {
    const points = this.comparePoints
    let index = points.length - 1
    for (let i = 0; i < points.length - 1; i++) {
      if (playerTime >= points[i].playerTime && playerTime < points[i + 1].playerTime) {
        index = i
        break
      }
    }

    const targetTime = points[index].playerTime + 3
    let targetIndex = points.length - 1
    for (let i = index + 1; i < points.length; i++) {
      if (points[i].playerTime >= targetTime) {
        targetIndex = i
        break
      }
    }

    return this.calculateBearing(points[index], points[targetIndex])
  }

  interpolateCompareLatLng(playerTime) {
    const points = this.comparePoints
    if (!points || points.length === 0) return null

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (playerTime >= curr.playerTime && playerTime < next.playerTime) {
        const fraction =
          (playerTime - curr.playerTime) / (next.playerTime - curr.playerTime)
        return {
          lat: curr.latitude + (next.latitude - curr.latitude) * fraction,
          lng: curr.longitude + (next.longitude - curr.longitude) * fraction
        }
      }
    }

    if (playerTime < points[0].playerTime) {
      return { lat: points[0].latitude, lng: points[0].longitude }
    }

    const last = points[points.length - 1]
    return { lat: last.latitude, lng: last.longitude }
  }

  currentPlayerTime() {
    const curr = this.points[this.currentIndex]
    const next = this.points[Math.min(this.currentIndex + 1, this.points.length - 1)]
    return (
      curr.playerTime + (next.playerTime - curr.playerTime) * (this.currentFraction || 0)
    )
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
    this.updateCompareIndicators(this.currentPlayerTime())
  }

  updateCompareIndicators(playerTime) {
    if (!this.hasCompare || !this.hasComparePlaybackIndicatorsTarget) return

    const controller = this.application.getControllerForElementAndIdentifier(
      this.comparePlaybackIndicatorsTarget,
      'playback-indicators'
    )
    if (!controller) return

    const point = this.interpolateCompareByPlayerTime(playerTime)
    if (!point) return

    controller.update({
      altitude: point.altitude,
      altitudeSpent: this.comparePoints[0].altitude - point.altitude,
      fullSpeed: point.fullSpeed,
      hSpeed: point.hSpeed,
      vSpeed: point.vSpeed,
      glideRatio: point.glideRatio ?? 0
    })

    const futurePoint = this.interpolateCompareByPlayerTime(playerTime + 1)
    if (futurePoint) {
      controller.updateAcceleration({
        fullSpeedAccel: (futurePoint.fullSpeed - point.fullSpeed) / 3.6,
        hSpeedAccel: (futurePoint.hSpeed - point.hSpeed) / 3.6,
        vSpeedAccel: (futurePoint.vSpeed - point.vSpeed) / 3.6
      })
    }
  }

  interpolateCompareByPlayerTime(playerTime) {
    const points = this.comparePoints
    if (!points || points.length === 0) return null

    const lerp = (a, b, f) => a + (b - a) * f

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]

      if (playerTime >= curr.playerTime && playerTime < next.playerTime) {
        const f = (playerTime - curr.playerTime) / (next.playerTime - curr.playerTime)
        return {
          altitude: lerp(curr.altitude, next.altitude, f),
          fullSpeed: lerp(curr.fullSpeed, next.fullSpeed, f),
          hSpeed: lerp(curr.hSpeed, next.hSpeed, f),
          vSpeed: lerp(curr.vSpeed, next.vSpeed, f),
          glideRatio: lerp(curr.glideRatio ?? 0, next.glideRatio ?? 0, f)
        }
      }
    }

    if (playerTime < points[0].playerTime) return points[0]
    return points[points.length - 1]
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
    const rotation = this.calculateBearing(point, targetPoint)

    this.markerElement.style.transform = `translateY(50%) rotate(${rotation - 45}deg)`

    this.updateCompareMapMarker(this.currentPlayerTime())
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

    this.updateCompareMapMarker(this.currentPlayerTime())
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

  compareModalTargetConnected(element) {
    this.compareModalObserver = new MutationObserver(() => {
      document.body.classList.toggle('overflow-hidden', element.open)
    })
    this.compareModalObserver.observe(element, { attributeFilter: ['open'] })
  }

  compareModalTargetDisconnected() {
    this.compareModalObserver?.disconnect()
    document.body.classList.remove('overflow-hidden')
  }

  openCompareModal() {
    if (!this.hasCompareModalTarget) return

    this.compareModalTarget.showModal()
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
