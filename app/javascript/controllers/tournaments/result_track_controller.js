import PlaybackController from '../playback_controller'
import { findLineCrossing, headingAtIndex } from 'utils/tracks/pointHelpers'
import ArrowMarker from 'utils/tracks/playback/ArrowMarker'
import { buildGlideChart, buildSpeedChart, buildSepChart } from 'charts/timeSeriesCharts'
import ChartGroup from 'charts/ChartGroup'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import initMapsApi from 'utils/google_maps_api'
import { isTurboPreview } from 'utils/turbo_preview'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import { fetchTrackPoints } from 'utils/tracks/trackData'

const FINISH_LINE_COLOR = '#f44336'

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
      onPointHover: index => this.onSideProjectionHover(index),
      labels: this.labels
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

  get chartGroup() {
    this._chartGroup ||= new ChartGroup(() => this.playbackCharts)
    return this._chartGroup
  }

  get chartOptions() {
    return {
      labels: this.labels,
      plotLines: this.finishPlotLines,
      onHover: index => this.seekTo(index),
      onLeave: () => this.chartGroup.scheduleHide()
    }
  }

  get finishPlotLines() {
    if (this.finishCrossingIndex === undefined) return []

    const prev = this.points[this.finishCrossingIndex - 1] || this.points[0]
    const curr = this.points[this.finishCrossingIndex]
    const crossingFlTime =
      prev.flTime + (curr.flTime - prev.flTime) * (this.finishCrossingFraction || 0)

    return [{ value: crossingFlTime - this.points[0].flTime, color: FINISH_LINE_COLOR }]
  }

  initGlideChart() {
    if (!this.hasGlideChartTarget) return

    this.glideChartTarget.chart = buildGlideChart(this.glideChartTarget, this.points, {
      ...this.chartOptions,
      legend: true
    })
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    this.speedChartTarget.chart = buildSpeedChart(
      this.speedChartTarget,
      this.points,
      this.chartOptions
    )
  }

  initSepChart() {
    if (!this.hasSepChartTarget) return

    this.sepChartTarget.chart = buildSepChart(
      this.sepChartTarget,
      this.points,
      this.chartOptions
    )
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

    this.chartGroup.showIndex(index)
    this.updatePlaybackIndicators(index, fraction)

    if (this.mapMarker) {
      const { point, heading } = headingAtIndex(this.points, index, fraction)
      this.mapMarker.setPosition(point, heading)
    }
  }

  disconnect() {
    this.stopPlaybackLoop()
    this._chartGroup?.cancelHide()
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
