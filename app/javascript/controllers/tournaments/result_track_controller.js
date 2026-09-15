import PlaybackController from '../playback_controller'
import { findLineCrossing, headingAtIndex } from 'utils/tracks/pointHelpers'
import { syncCrosshairByIndex } from 'utils/tracks/playback/highchartsCrosshair'
import ArrowMarker from 'utils/tracks/playback/ArrowMarker'
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

    Promise.all([
      fetchTrackPoints(this.pointsUrlValue, { convertSpeeds: true }),
      initMapsApi().then(
        () => true,
        () => false
      )
    ])
      .then(([pointsData, mapsReady]) => {
        if (!pointsData.points || pointsData.points.length === 0) return

        this.mapsReady = mapsReady

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
    this.seekTo(index)
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

    this.seekTo(point.index)
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
    if (!this.hasMapTarget || !this.mapsReady) return

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

    this.resetPlayback()
    this.createMapMarker()
  }

  createMapMarker() {
    if (!this.map) return

    this.mapMarker = new ArrowMarker({
      map: this.map,
      position: this.points[0],
      imageUrl: this.locationArrowUrlValue
    })
  }

  syncPosition(index, fraction, interpolated) {
    if (interpolated) {
      this.sideProjectionChart?.showCrosshairInterpolated(index, fraction)
    } else {
      this.sideProjectionChart?.showCrosshair(index)
    }

    syncCrosshairByIndex(this.playbackCharts, index)
    this.updatePlaybackIndicators(index, fraction)

    if (this.mapMarker) {
      const { point, heading } = headingAtIndex(this.points, index, fraction)
      this.mapMarker.setPosition(point, heading)
    }
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
