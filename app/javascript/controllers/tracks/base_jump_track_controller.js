import PlaybackController from '../playback_controller'
import { initGlideChart, initSpeedsChart, initAccuracyChart } from 'charts'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import { acquireMap } from 'utils/maps/shared_map'
import { isTurboPreview } from 'utils/turbo_preview'
import { fetchTrackPoints } from 'utils/tracks/trackData'
import {
  findLineCrossing,
  nearestIndexByTime,
  headingAtIndex,
  indexAtPlayerTime
} from 'utils/tracks/pointHelpers'
import { syncCrosshairByIndex } from 'utils/tracks/playback/highchartsCrosshair'
import ArrowMarker from 'utils/tracks/playback/ArrowMarker'
import { computeBaseJumpSummary } from 'utils/tracks/baseJumpSummary'
import BaseJumpSummaryPanel from 'utils/tracks/BaseJumpSummaryPanel'
import { get } from '@rails/request.js'
import I18n from 'i18n'

const SYNC_VERTICAL_SPEED = 10
const FINISH_LINE_COLOR = '#8b0000'
const COMPARE_LINE_COLOR = '#9c27b0'
const FINISH_LINE_STORAGE_KEY = 'baseJumpFinishLineVisible'
const RESULT_PREFERENCE_KEY = 'baseJumpResultPreference'
const RESULT_NONE = 'none'

export default class extends PlaybackController {
  static targets = [
    'sideProjection',
    'summary',
    'histogramRowTemplate',
    'glideChart',
    'speedChart',
    'sepChart',
    'terrainProfileSelect',
    'map',
    'playButton',
    'playbackSlider',
    'playbackIndicators',
    'comparePlaybackIndicators',
    'expandMapToggle',
    'finishLineToggle',
    'resultOption',
    'emptyState'
  ]

  static values = {
    pointsUrl: String,
    locationArrowUrl: String,
    defaultTerrainProfileId: Number,
    comparePointsUrl: String,
    compareTrackName: String,
    compareSamePlace: Boolean,
    exitFlTime: Number,
    compareExitFlTime: Number,
    wingsuit: Boolean,
    finishLineStartLat: Number,
    finishLineStartLon: Number,
    finishLineEndLat: Number,
    finishLineEndLon: Number,
    raceResultTime: Number,
    resultPointLat: Number,
    resultPointLon: Number,
    resultPointGpsTime: Number,
    resultLabel: String,
    resultComparePointLat: Number,
    resultComparePointLon: Number,
    resultComparePointGpsTime: Number,
    resultCompareLabel: String,
    chartsUnits: { type: String, default: 'metric' },
    terrainProfileMeasurementsUrlTemplate: String
  }

  get units() {
    return this.chartsUnitsValue
  }

  setUnits(event) {
    this.chartsUnitsValue = event.detail.units
  }

  chartsUnitsValueChanged(value, previousValue) {
    if (previousValue === undefined || value === previousValue || !this.points) return
    ;[
      this.hasGlideChartTarget && this.glideChartTarget,
      this.hasSpeedChartTarget && this.speedChartTarget,
      this.hasSepChartTarget && this.sepChartTarget
    ].forEach(target => {
      if (target && target.chart) {
        target.chart.destroy()
        target.chart = null
      }
    })
    this.initGlideChart()
    this.initSpeedsChart()
    this.initSepChart()
    this.initSideProjection()
    this.renderSummary()
    this.updatePlaybackPosition()
  }

  connect() {
    if (isTurboPreview()) return
    if (this.applyResultPreference()) return

    this.comparePoints = null

    const fetches = [
      fetchTrackPoints(this.pointsUrlValue, { convertSpeeds: true }),
      initMapsApi().then(
        () => true,
        () => false
      )
    ]
    if (this.hasComparePointsUrlValue) {
      fetches.push(
        fetchTrackPoints(this.comparePointsUrlValue, { convertSpeeds: true }).catch(
          () => null
        )
      )
    }

    Promise.all(fetches)
      .then(([pointsData, mapsReady, compareData]) => {
        if (!this.element.isConnected) return

        this.mapsReady = mapsReady

        if (!pointsData.points || pointsData.points.length === 0) {
          this.showEmptyState('no_data')
          return
        }

        this.points = pointsData.points
        this.deployFlTime = pointsData.deployFlTime
        this.points.forEach(point => {
          point.playerTime = point.flTime - this.points[0].flTime
        })
        this.primarySyncFlTime = this.syncFlTime(this.points)

        if (compareData && compareData.points.length > 0) {
          this.comparePoints = compareData.points
          this.compareDeployFlTime = compareData.deployFlTime
          this.prepareCompare()
        }

        if (this.hasResultPoint) {
          this.findResultCrossings()
        } else {
          this.findFinishLineCrossings()
        }
        this.initCharts()
        this.renderSummary()
        this.renderMap()
        this.initPlayback()
        this.loadDefaultTerrainProfile()
        this.initFinishLineToggle()
        this.initResultMarker()
      })
      .catch(() => this.showEmptyState('load_error'))
  }

  get hasResultPoint() {
    return (
      this.hasResultPointLatValue &&
      this.hasResultPointLonValue &&
      this.hasResultPointGpsTimeValue
    )
  }

  findResultCrossings() {
    if (!this.points) return

    const index = nearestIndexByTime(this.points, this.resultPointGpsTimeValue * 1000)
    this.primaryCrossing = {
      index: Math.max(index, 1),
      fraction: 0,
      label: this.resultLabelValue
    }
    this.primaryResultTime = this.points[index].flTime - this.primarySyncFlTime

    if (this.hasCompare && this.hasResultComparePointGpsTimeValue) {
      const compareIndex = nearestIndexByTime(
        this.comparePoints,
        this.resultComparePointGpsTimeValue * 1000
      )
      this.compareCrossing = {
        index: Math.max(compareIndex, 1),
        fraction: 0,
        label: this.resultCompareLabelValue
      }
      this.compareResultTime =
        this.comparePoints[compareIndex].flTime - this.compareSyncFlTime
    }
  }

  initResultMarker() {
    if (!this.hasResultPoint) return

    this.finishLineVisible = true
    this.sideProjectionChart?.setFinishLineVisible(true)
    this.drawResultMapMarker(this.resultPointLatValue, this.resultPointLonValue, false)

    if (
      this.hasCompare &&
      this.showCompareOnMap &&
      this.hasResultComparePointLatValue &&
      this.hasResultComparePointLonValue
    ) {
      this.drawResultMapMarker(
        this.resultComparePointLatValue,
        this.resultComparePointLonValue,
        true
      )
    }

    this.applyFinishLineVisibility()
  }

  drawResultMapMarker(lat, lon, isCompare) {
    if (!this.map) return

    const dot = document.createElement('div')
    dot.className = isCompare
      ? 'base-jump-result-marker base-jump-result-marker--compare'
      : 'base-jump-result-marker'

    this.sharedMap.add(
      new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: { lat, lng: lon },
        content: dot
      })
    )
  }

  showEmptyState(messageKey) {
    if (!this.hasEmptyStateTarget) return

    this.emptyStateTarget.textContent = I18n.t(`tracks.show.${messageKey}`)
    this.emptyStateTarget.classList.remove('hidden')
  }

  get hasFinishLine() {
    return (
      this.hasFinishLineStartLatValue &&
      this.hasFinishLineStartLonValue &&
      this.hasFinishLineEndLatValue &&
      this.hasFinishLineEndLonValue
    )
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

  findFinishLineCrossings() {
    if (!this.hasFinishLine) return

    this.primaryCrossing = findLineCrossing(this.points, this.finishLine)
    if (this.hasCompare) {
      this.compareCrossing = findLineCrossing(this.comparePoints, this.finishLine)
    }
  }

  initFinishLineToggle() {
    if (!this.hasFinishLine) return

    if (this.hasFinishLineToggleTarget) {
      const stored = localStorage.getItem(FINISH_LINE_STORAGE_KEY)
      this.finishLineVisible = stored === null ? true : stored === '1'
      this.finishLineToggleTarget.checked = this.finishLineVisible
    } else {
      this.finishLineVisible = true
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

    const finishTime = this.hasResultPoint
      ? this.primaryResultTime
      : this.primaryFinishTime()
    const compareTime = this.hasCompare
      ? this.hasResultPoint
        ? this.compareResultTime
        : this.compareFinishTime()
      : null
    const primaryLabel = this.plotLineLabel(finishTime, this.resultLabelValue)
    const compareLabel = this.plotLineLabel(compareTime, this.resultCompareLabelValue)
    const charts = [this.speedChartTarget?.chart, this.glideChartTarget?.chart]
    charts.forEach(chart => {
      if (!chart) return

      chart.xAxis[0].removePlotLine('finish-line')
      chart.xAxis[0].removePlotLine('finish-line-compare')

      if (this.finishLineVisible && finishTime != null) {
        chart.xAxis[0].addPlotLine({
          id: 'finish-line',
          value: finishTime,
          color: FINISH_LINE_COLOR,
          width: 1,
          dashStyle: 'Dash',
          zIndex: 5,
          label: this.plotLineLabelConfig(primaryLabel, FINISH_LINE_COLOR, 'top', 12)
        })
      }

      if (this.finishLineVisible && compareTime != null) {
        chart.xAxis[0].addPlotLine({
          id: 'finish-line-compare',
          value: compareTime,
          color: COMPARE_LINE_COLOR,
          width: 1,
          dashStyle: 'Dot',
          zIndex: 6,
          label: this.plotLineLabelConfig(compareLabel, COMPARE_LINE_COLOR, 'bottom', -6)
        })
      }
    })
  }

  plotLineLabel(time, resultLabel) {
    if (this.hasResultPoint) return resultLabel
    return time != null ? `${time.toFixed(1)}s` : null
  }

  plotLineLabelConfig(text, color, verticalAlign, y) {
    if (!text) return undefined

    return {
      text,
      verticalAlign,
      y,
      align: 'center',
      rotation: 0,
      style: { color, fontSize: '10px', fontWeight: 'bold' }
    }
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
      syncVerticalSpeed: SYNC_VERTICAL_SPEED,
      units: this.units
    })
    this.sideProjectionChart.setFlightProfile(this.points)

    if (this.hasCompare) {
      this.sideProjectionChart.setCompareProfile(this.comparePoints)
    }

    if (this.primaryCrossing) {
      this.sideProjectionChart.setFinishLineCrossing(
        this.primaryCrossing.index,
        this.primaryCrossing.fraction,
        this.primaryCrossing.label != null ? null : this.primaryFinishTime(),
        this.primaryCrossing.label
      )
    }

    if (this.compareCrossing && this.hasCompare) {
      this.sideProjectionChart.setCompareFinishLineCrossing(
        this.compareCrossing.index,
        this.compareCrossing.fraction,
        this.compareCrossing.label != null ? null : this.compareFinishTime(),
        this.compareCrossing.label
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

    this.glideChartTarget.chart = initGlideChart(this.glideChartTarget, this.points, {
      windCancellation: false,
      showTitle: false,
      showLegend: false,
      xOffset: this.chartXOffset,
      units: this.units,
      ...this.compareChartOptions
    })
  }

  initSpeedsChart() {
    if (!this.hasSpeedChartTarget) return

    this.speedChartTarget.chart = initSpeedsChart(this.speedChartTarget, this.points, {
      windCancellation: false,
      showTitle: false,
      xOffset: this.chartXOffset,
      units: this.units,
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
      xOffset: this.chartXOffset,
      units: this.units
    })
  }

  renderSummary() {
    if (!this.hasSummaryTarget || !this.points) return

    const summary = this.summaryFor(
      this.points,
      this.hasExitFlTimeValue ? this.exitFlTimeValue : null,
      this.deployFlTime
    )
    if (!summary) return

    const compare = this.hasCompare
      ? this.summaryFor(
          this.comparePoints,
          this.hasCompareExitFlTimeValue ? this.compareExitFlTimeValue : null,
          this.compareDeployFlTime
        )
      : null

    this.summaryPanel.render({ summary, compare, units: this.units })
  }

  get summaryPanel() {
    this._summaryPanel ??= new BaseJumpSummaryPanel({
      container: this.summaryTarget,
      rowTemplate: this.histogramRowTemplateTarget
    })
    return this._summaryPanel
  }

  summaryFor(points, exitFlTime, deployFlTime) {
    return computeBaseJumpSummary(points, {
      exitFlTime,
      deployFlTime,
      wingsuit: this.wingsuitValue
    })
  }

  loadDefaultTerrainProfile() {
    if (!this.defaultTerrainProfileIdValue) return

    this.fetchTerrainProfile(this.defaultTerrainProfileIdValue)
  }

  selectResult(event) {
    const option = event.currentTarget
    this.rememberResultOption(option)
    this.visitResultOption(option)
  }

  // Base race options are identified by their finish line; everything else by
  // competition id.
  visitResultOption(option) {
    const url = new URL(window.location)
    url.searchParams.delete('result_competition_id')
    url.searchParams.delete('result_finish_line_id')
    if (option.dataset.discipline === 'base_race' && option.dataset.finishLineId) {
      url.searchParams.set('result_finish_line_id', option.dataset.finishLineId)
    } else {
      url.searchParams.set('result_competition_id', option.dataset.competitionId)
    }
    Turbo.visit(url.toString())
  }

  applyResultPreference() {
    if (!this.hasResultOptionTarget) return false

    const params = new URLSearchParams(window.location.search)
    if (params.has('result_competition_id') || params.has('result_finish_line_id')) {
      const active = this.resultOptionTargets.find(option =>
        option.classList.contains('active')
      )
      if (active) this.rememberResultOption(active)
      return false
    }

    const preference = this.readResultPreference()
    if (!preference || preference.discipline === RESULT_NONE) return false

    const match = this.resultOptionTargets.find(
      option =>
        option.dataset.discipline === preference.discipline &&
        String(option.dataset.parameter) === String(preference.parameter)
    )
    if (!match || match.classList.contains('active')) return false

    this.visitResultOption(match)
    return true
  }

  rememberResultOption(option) {
    if (option.dataset.discipline === RESULT_NONE) {
      this.clearResultPreference()
    } else {
      this.storeResultPreference(option.dataset.discipline, option.dataset.parameter)
    }
  }

  storeResultPreference(discipline, parameter) {
    try {
      localStorage.setItem(
        RESULT_PREFERENCE_KEY,
        JSON.stringify({ discipline, parameter })
      )
    } catch {
      // localStorage may be unavailable (private mode); preference is optional
    }
  }

  clearResultPreference() {
    try {
      localStorage.removeItem(RESULT_PREFERENCE_KEY)
    } catch {
      // localStorage may be unavailable (private mode); preference is optional
    }
  }

  readResultPreference() {
    try {
      const raw = localStorage.getItem(RESULT_PREFERENCE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
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
    get(
      this.terrainProfileMeasurementsUrlTemplateValue.replace('__ID__', terrainProfileId),
      { responseKind: 'json' }
    )
      .then(response => response.json)
      .then(data => {
        if (this.sideProjectionChart) {
          this.sideProjectionChart.setTerrainProfile(data.measurements).render()
        }
      })
  }

  renderMap() {
    if (!this.hasMapTarget || !this.mapsReady) return

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

    this.finishLinePolyline = this.sharedMap.add(
      new google.maps.Polyline({
        path: [
          { lat: this.finishLineStartLatValue, lng: this.finishLineStartLonValue },
          { lat: this.finishLineEndLatValue, lng: this.finishLineEndLonValue }
        ],
        strokeColor: FINISH_LINE_COLOR,
        strokeOpacity: 1,
        strokeWeight: 2
      })
    )
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
    this.sharedMap = acquireMap(this.mapTarget, 'base-jump-track', {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: 'BASE_TRACK_MAP',
      cameraControl: false,
      streetViewControl: false,
      zoomControl: true
    })
    this.map = this.sharedMap.map
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
      this.sharedMap.add(polyline)
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

    this.resetPlayback()
    this.createMapMarkers()
  }

  createMapMarkers() {
    if (!this.map) return

    this.mapMarker = new ArrowMarker({
      map: this.map,
      position: this.points[0],
      imageUrl: this.locationArrowUrlValue
    })
    this.sharedMap.add(this.mapMarker.marker)

    if (!this.showCompareOnMap) return

    this.compareMapMarker = new ArrowMarker({
      map: this.map,
      position: this.comparePoints[0],
      imageUrl: this.locationArrowUrlValue,
      className: 'base-jump-map-marker--compare'
    })
    this.sharedMap.add(this.compareMapMarker.marker)
  }

  syncPosition(index, fraction, interpolated) {
    if (interpolated) {
      this.sideProjectionChart?.showCrosshairInterpolated(index, fraction)
    } else {
      this.sideProjectionChart?.showCrosshair(index)
    }

    syncCrosshairByIndex(this.playbackCharts, index)
    this.updatePlaybackIndicators(index, fraction)

    const playerTime = this.currentPlayerTime
    if (this.hasCompare) {
      this.updateComparePlaybackIndicators(this.comparePoints, playerTime)
    }

    this.updateMapMarkers(index, fraction, playerTime)
  }

  updateMapMarkers(index, fraction, playerTime) {
    if (this.mapMarker) {
      const { point, heading } = headingAtIndex(this.points, index, fraction)
      this.mapMarker.setPosition(point, heading)
    }

    if (this.compareMapMarker) {
      const compare = indexAtPlayerTime(this.comparePoints, playerTime)
      const { point, heading } = headingAtIndex(
        this.comparePoints,
        compare.index,
        compare.fraction
      )
      this.compareMapMarker.setPosition(point, heading)
    }
  }

  disconnect() {
    this.stopPlaybackLoop()

    this.sharedMap?.release()
    this.sharedMap = null
    this.map = null
    this.mapMarker = null
    this.compareMapMarker = null
    this.finishLinePolyline = null

    this.destroyChart(this.sideProjectionChart)
    this.destroyChart(this.glideChartTarget?.chart)
    this.destroyChart(this.speedChartTarget?.chart)
    this.destroyChart(this.sepChartTarget?.chart)
  }

  destroyChart(chart) {
    if (!chart) return

    try {
      chart.destroy()
    } catch {
      // chart may already be torn down during fast navigation
    }
  }
}
