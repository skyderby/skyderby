import { Controller } from '@hotwired/stimulus'
import apiClient from 'utils/apiClient'
import {
  createTrackGraphics,
  createWindowMarkers
} from 'utils/laneValidation/trackGraphics'
import { createDesignatedLane } from 'utils/laneValidation/designatedLane'
import { findDeployPoint, interpolatePointByAltitude } from 'utils/laneValidation/utils'
import {
  calculateDesignatedLaneStart,
  displayReferencePointMarker,
  fitMapBounds
} from 'utils/laneValidation/controllerUtils'

export default class extends Controller {
  static targets = ['referencePoints', 'map']
  static values = {
    trackId: Number,
    eventId: Number,
    windowStart: Number,
    windowEnd: Number,
    dlStart: String,
    exitedAt: String,
    referencePointId: Number
  }

  connect() {
    this.pointsCache = new Map()
    this.trackGraphics = null
    this.referencePointMarker = null
    this.designatedLane = null
    this.loadReferencePoints()
    this.waitForMapAndLoadData()
  }

  async waitForMapAndLoadData() {
    if (this.mapController && this.mapController.initMap) {
      await this.mapController.initMap
    }
    this.loadTrackData()
  }

  disconnect() {
    this.clearTrackGraphics()
    this.clearDesignatedLane()
    this.clearReferencePointMarker()
  }

  loadReferencePoints() {
    try {
      const referencePointsData = this.referencePointsTarget.textContent
      this.referencePoints = JSON.parse(referencePointsData)
    } catch (error) {
      console.error('Failed to load reference points:', error)
      this.referencePoints = []
    }
  }

  async loadTrackData() {
    if (!this.trackIdValue) return

    try {
      const data = await this.fetchPoints(this.trackIdValue)
      const map = this.mapTarget.mapInstance

      if (!map) {
        console.error('Map instance not available yet')
        return
      }

      const { polylines } = createTrackGraphics(
        this.trackIdValue,
        data,
        '#470FF4',
        map,
        this.exitedAtValue
      )

      const windowMarkers = createWindowMarkers(
        this.trackIdValue,
        data.points || [],
        this.windowStartValue,
        this.windowEndValue,
        this.dlStartValue,
        map,
        this.exitedAtValue
      )

      this.trackGraphics = { polylines, windowMarkers }

      this.displayReferencePoint()
      this.displayDesignatedLane(data)
      this.fitMapBounds(data)
    } catch (error) {
      console.error('Failed to load track data:', error)
    }
  }

  async fetchPoints(trackId) {
    if (this.pointsCache.has(trackId)) {
      return this.pointsCache.get(trackId)
    }

    const data = await apiClient.fetchTrackPoints(trackId, {
      original_frequency: true,
      'trimmed[seconds_before_start]': 15,
      'trimmed[seconds_after_end]': 120
    })
    this.pointsCache.set(trackId, data)
    return data
  }

  async displayReferencePoint() {
    if (!this.referencePointIdValue) return

    const referencePoint = this.referencePoints.find(
      point => point.id == this.referencePointIdValue
    )

    if (!referencePoint) return

    this.referencePointMarker = await displayReferencePointMarker(
      this.mapTarget.mapInstance,
      referencePoint,
      this.mapController
    )
  }

  displayDesignatedLane(data) {
    if (!this.referencePointIdValue || !data.points || data.points.length === 0) return

    const referencePoint = this.referencePoints.find(
      point => point.id == this.referencePointIdValue
    )

    if (!referencePoint) return

    const points = data.points
    const deployFlTime = data.deployFlTime

    const windowEndMarker = interpolatePointByAltitude(points, this.windowEndValue)
    const dlStartPoint = calculateDesignatedLaneStart(
      points,
      this.exitedAtValue,
      this.dlStartValue,
      this.windowStartValue
    )

    if (!windowEndMarker) return

    const deployPoint = findDeployPoint(points, deployFlTime)

    this.clearDesignatedLane()

    const map = this.mapTarget.mapInstance
    this.designatedLane = createDesignatedLane(
      map,
      dlStartPoint,
      windowEndMarker,
      deployPoint,
      referencePoint,
      points
    )
  }

  fitMapBounds(data) {
    if (!this.referencePointIdValue || !data.points || data.points.length === 0) return

    const referencePoint = this.referencePoints.find(
      point => point.id == this.referencePointIdValue
    )
    if (!referencePoint) return

    const dlStartPoint = calculateDesignatedLaneStart(
      data.points,
      this.exitedAtValue,
      this.dlStartValue,
      this.windowStartValue
    )

    fitMapBounds(this.mapTarget.mapInstance, dlStartPoint, referencePoint)
  }

  clearTrackGraphics() {
    if (this.trackGraphics) {
      this.trackGraphics.polylines.forEach(polyline => polyline.setMap(null))
      this.trackGraphics.windowMarkers.forEach(marker => marker.setMap(null))
      this.trackGraphics = null
    }
  }

  clearDesignatedLane() {
    if (this.designatedLane) {
      this.designatedLane.cleanup()
      this.designatedLane = null
    }
  }

  clearReferencePointMarker() {
    if (this.referencePointMarker) {
      if (this.mapController && this.mapController.removeMarker) {
        this.mapController.removeMarker(this.referencePointMarker)
      } else {
        this.referencePointMarker.setMap(null)
      }
      this.referencePointMarker = null
    }
  }

  get mapController() {
    return this.application.getControllerForElementAndIdentifier(this.mapTarget, 'map')
  }
}
