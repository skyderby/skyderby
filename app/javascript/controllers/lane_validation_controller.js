import { Controller } from '@hotwired/stimulus'
import apiClient from 'utils/apiClient'
import {
  createTrackGraphics,
  createWindowMarkers
} from 'utils/laneValidation/trackGraphics'
import { createDesignatedLane } from 'utils/laneValidation/designatedLane'
import {
  interpolatePointByAltitude,
  interpolatePointByTime,
  findDeployPoint
} from 'utils/laneValidation/utils'
import {
  calculateDesignatedLaneStart,
  fitMapBounds
} from 'utils/laneValidation/controllerUtils'
import { initAccuracyChart, findPositionForAltitude, sep50Series } from 'charts'
import cropPoints from 'utils/cropPoints'
import { checkProximityViolation } from 'utils/laneValidation/proximityCheck'

export default class extends Controller {
  static targets = [
    'referencePoints',
    'map',
    'sepChart',
    'sepCheck',
    'exitCheck',
    'laneCheck',
    'proximityCheck',
    'indicatorOk',
    'indicatorWarning'
  ]
  static values = {
    eventId: Number,
    windowStart: Number,
    windowEnd: Number,
    dlStart: String
  }

  connect() {
    this.pointsCache = new Map()
    this.trackGraphics = new Map()
    this.referencePointMarkers = new Map()
    this.displayedCompetitors = new Set()
    this.designatedLane = null
    this.proximityMarkers = []
    this.sepChart = null
    this.loadReferencePoints()
    this.initializeSepChart()
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

  initializeSepChart() {
    if (!this.hasSepChartTarget) return

    this.sepChart = initAccuracyChart(this.sepChartTarget, [], [])
  }

  disconnect() {
    this.trackGraphics.forEach(graphics => {
      graphics.polylines.forEach(polyline => polyline.setMap(null))
      graphics.windowMarkers.forEach(marker => marker.setMap(null))
    })
    this.trackGraphics.clear()
    this.pointsCache.clear()
    this.clearDesignatedLane()
  }

  handleCheckboxChange(event) {
    const checkbox = event.target
    const competitorElement = checkbox.closest('.lane-validation-competitor')
    if (!competitorElement) return

    const trackId = competitorElement.dataset.trackId
    const groupId = competitorElement.dataset.groupId

    if (checkbox.checked) {
      this.displayGroupAsync(groupId)
    } else {
      this.removeTrack(trackId)
    }
  }

  async displayGroupAsync(groupId) {
    this.clearAllTracks()

    const groupElement = this.element
      .querySelector(`[data-group-id="${groupId}"]`)
      .closest('.lane-validation-group')
    if (!groupElement) return

    const competitors = groupElement.querySelectorAll('.lane-validation-competitor')
    const displayPromises = []

    competitors.forEach(competitor => {
      const checkbox = competitor.querySelector('input[type="checkbox"]')
      const trackId = competitor.dataset.trackId
      const color = competitor.dataset.color

      checkbox.checked = true
      this.displayedCompetitors.add(trackId)
      displayPromises.push(this.displayTrack(trackId, color))
    })

    this.updateReferencePointsOnMap()

    await Promise.all(displayPromises)
  }

  clearAllTracks() {
    this.trackGraphics.forEach(graphics => {
      graphics.polylines.forEach(polyline => polyline.setMap(null))
      graphics.windowMarkers.forEach(marker => marker.setMap(null))
    })
    this.trackGraphics.clear()
    this.displayedCompetitors.clear()

    this.referencePointMarkers.forEach(marker => marker.setMap(null))
    this.referencePointMarkers.clear()

    const allCheckboxes = this.element.querySelectorAll(
      '.lane-validation-competitor input[type="checkbox"]'
    )
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = false
    })

    if (this.sepChart) {
      this.sepChart.series[0].setData([])
    }

    if (this.hasSepCheckTarget) this.sepCheckTarget.replaceChildren()
    if (this.hasExitCheckTarget) this.exitCheckTarget.replaceChildren()
    if (this.hasLaneCheckTarget) this.laneCheckTarget.replaceChildren()
    if (this.hasProximityCheckTarget) this.proximityCheckTarget.replaceChildren()

    this.clearProximityMarkers()
  }

  async displayTrack(trackId, color) {
    if (this.trackGraphics.has(trackId)) return

    const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
    if (competitorElement) {
      competitorElement.classList.add('loading')
    }

    try {
      const data = await this.fetchPoints(trackId)
      const map = this.mapTarget.mapInstance
      const exitedAt = competitorElement?.dataset.exitedAt

      const { polylines } = createTrackGraphics(trackId, data, color, map, exitedAt)
      const windowMarkers = createWindowMarkers(
        trackId,
        data.points || [],
        this.windowStartValue,
        this.windowEndValue,
        this.dlStartValue,
        map,
        exitedAt
      )

      this.trackGraphics.set(trackId, { polylines, windowMarkers })
    } catch (error) {
      console.error(`Failed to load track ${trackId}:`, error)
    } finally {
      if (competitorElement) {
        competitorElement.classList.remove('loading')
      }
    }
  }

  removeTrack(trackId) {
    const graphics = this.trackGraphics.get(trackId)
    if (graphics) {
      graphics.polylines.forEach(polyline => polyline.setMap(null))
      graphics.windowMarkers.forEach(marker => marker.setMap(null))
      this.trackGraphics.delete(trackId)
    }
    this.displayedCompetitors.delete(trackId)

    const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
    if (competitorElement) {
      const checkbox = competitorElement.querySelector('input[type="checkbox"]')
      if (checkbox) checkbox.checked = false
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

  async selectJumpForReview(event) {
    const competitorElement = event.target.closest('.lane-validation-competitor')
    if (!competitorElement) return

    const trackId = competitorElement.dataset.trackId
    const exitedAt = competitorElement.dataset.exitedAt
    const referencePointId = competitorElement.dataset.referencePointId
    const groupId = competitorElement.dataset.groupId

    this.element.querySelectorAll('.lane-validation-competitor').forEach(el => {
      el.classList.remove('active')
    })
    competitorElement.classList.add('active')

    await this.displayGroupAsync(groupId)

    try {
      const data = await this.fetchPoints(trackId)
      this.updateSepChart(trackId, data)

      const points = data.points || []
      const deployFlTime = data.deployFlTime

      if (points.length === 0) {
        console.warn('No points available for this track')
        return
      }

      const startMarker = interpolatePointByAltitude(points, this.windowStartValue)
      const windowEndMarker = interpolatePointByAltitude(points, this.windowEndValue)
      const dlStartPoint = calculateDesignatedLaneStart(
        points,
        exitedAt,
        this.dlStartValue,
        this.windowStartValue
      )

      if (!startMarker || !windowEndMarker) {
        console.warn('Could not find window markers for this track')
        return
      }

      const deployPoint = findDeployPoint(points, deployFlTime)

      this.clearDesignatedLane()

      if (!referencePointId) {
        console.warn('Reference point not assigned for this competitor')
        return
      }

      const referencePoint = this.referencePoints.find(
        point => point.id == referencePointId
      )

      if (!referencePoint) {
        console.warn('Reference point not found')
        return
      }

      const map = this.mapTarget.mapInstance
      this.designatedLane = createDesignatedLane(
        map,
        dlStartPoint,
        windowEndMarker,
        deployPoint,
        referencePoint,
        points
      )

      fitMapBounds(map, dlStartPoint, referencePoint)

      this.updateExitAltitudeCheck(competitorElement)
      this.updateLaneViolationCheck(this.designatedLane)
      await this.performProximityCheck(trackId, competitorElement)
    } catch (error) {
      console.error('Failed to select jump for review:', error)
    }
  }

  clearDesignatedLane() {
    if (this.designatedLane) {
      this.designatedLane.cleanup()
      this.designatedLane = null
    }
  }

  async handleReferencePointChange(event) {
    const select = event.target
    const competitorId = select.dataset.competitorId
    const roundId = select.dataset.roundId
    const referencePointId = select.value || null

    try {
      const response = await apiClient.post(
        `/events/performance/${this.eventIdValue}/reference_point_assignments`,
        { roundId, competitorId, referencePointId }
      )

      if (response.ok) {
        const competitorElement = select.closest('.lane-validation-competitor')
        if (competitorElement) {
          competitorElement.dataset.referencePointId = referencePointId || ''
          this.updateReferencePointsOnMap()
        }
      } else {
        console.error('Failed to update reference point assignment')
      }
    } catch (error) {
      console.error('Error updating reference point assignment:', error)
    }
  }

  updateReferencePointsOnMap() {
    this.referencePointMarkers.forEach(marker => {
      if (this.mapController && this.mapController.removeMarker) {
        this.mapController.removeMarker(marker)
      } else {
        marker.setMap(null)
      }
    })
    this.referencePointMarkers.clear()

    const uniqueReferencePointIds = new Set()
    this.displayedCompetitors.forEach(trackId => {
      const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
      if (competitorElement) {
        const referencePointId = competitorElement.dataset.referencePointId
        if (referencePointId) {
          uniqueReferencePointIds.add(referencePointId)
        }
      }
    })

    uniqueReferencePointIds.forEach(referencePointId => {
      const referencePoint = this.referencePoints.find(
        point => point.id == referencePointId
      )

      if (referencePoint && this.mapController) {
        this.mapController
          .createMarker(
            referencePoint.latitude,
            referencePoint.longitude,
            referencePoint.name,
            true
          )
          .then(marker => {
            this.referencePointMarkers.set(referencePointId, marker)
          })
      }
    })
  }

  async toggleValidation(event) {
    const button = event.currentTarget
    const url = button.dataset.validationUrl
    const competitorElement = button.closest('.lane-validation-competitor')
    if (!competitorElement) return

    const validated = button.dataset.validated === 'true'

    try {
      const response = await apiClient.put(url, { result: { validated: !validated } })

      if (!response.ok) {
        console.error('Failed to toggle validation')
      }
    } catch (error) {
      console.error('Error toggling validation:', error)
    }
  }

  get mapController() {
    return this.application.getControllerForElementAndIdentifier(this.mapTarget, 'map')
  }

  updateSepChart(trackId, data) {
    if (!this.sepChart || !data.points || data.points.length === 0) return

    const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
    const exitedAt = competitorElement?.dataset.exitedAt

    let displayPoints = data.points

    if (exitedAt) {
      const exitedAtTime = new Date(exitedAt).getTime()
      const targetTime = exitedAtTime + 9000
      const validationWindowStart = interpolatePointByTime(data.points, targetTime)

      if (validationWindowStart) {
        displayPoints = cropPoints(
          data.points,
          validationWindowStart.altitude,
          this.windowEndValue - 20
        )
      }
    }

    const windowPlotLines = this.getWindowPlotLines(displayPoints)

    this.sepChart.xAxis[0].update({
      plotLines: windowPlotLines
    })

    const seriesData = sep50Series(displayPoints)
    this.sepChart.series[0].setData([])
    this.sepChart.series[0].update(seriesData, true)

    this.updateSepCheckIndicator(displayPoints)
  }

  getWindowPlotLines(points) {
    const positions = [this.windowStartValue, this.windowEndValue].map(altitude =>
      findPositionForAltitude(points, altitude)
    )

    return positions.map(position => ({
      value: position,
      width: 1,
      color: 'red'
    }))
  }

  updateSepCheckIndicator(points) {
    if (!this.hasSepCheckTarget || !points || points.length === 0) return

    const hasHighSep = points.some(point => point.sep50 > 10)

    if (hasHighSep) {
      const warningIndicator = this.indicatorWarningTarget.content.cloneNode(true)
      this.sepCheckTarget.replaceChildren(warningIndicator)
    } else {
      const okIndicator = this.indicatorOkTarget.content.cloneNode(true)
      this.sepCheckTarget.replaceChildren(okIndicator)
    }
  }

  updateExitAltitudeCheck(competitorElement) {
    if (!this.hasExitCheckTarget || !competitorElement) return

    const exitAltitude = parseInt(competitorElement.dataset.exitAltitude)
    if (isNaN(exitAltitude)) return

    const isInvalidExitAltitude = exitAltitude > 3353 || exitAltitude < 3200

    if (isInvalidExitAltitude) {
      const warningIndicator = this.indicatorWarningTarget.content.cloneNode(true)
      this.exitCheckTarget.replaceChildren(warningIndicator)
    } else {
      const okIndicator = this.indicatorOkTarget.content.cloneNode(true)
      this.exitCheckTarget.replaceChildren(okIndicator)
    }
  }

  updateLaneViolationCheck(designatedLane) {
    if (!this.hasLaneCheckTarget || !designatedLane) return

    const hasViolation = !!designatedLane.violationMarker

    if (hasViolation) {
      const warningIndicator = this.indicatorWarningTarget.content.cloneNode(true)
      this.laneCheckTarget.replaceChildren(warningIndicator)
    } else {
      const okIndicator = this.indicatorOkTarget.content.cloneNode(true)
      this.laneCheckTarget.replaceChildren(okIndicator)
    }
  }

  clearProximityMarkers() {
    this.proximityMarkers.forEach(marker => marker?.setMap?.(null))
    this.proximityMarkers = []
  }

  async performProximityCheck(trackId, competitorElement) {
    this.clearProximityMarkers()

    try {
      const currentData = await this.fetchPoints(trackId)
      const currentJump = {
        trackId,
        points: currentData.points,
        exitedAt: competitorElement?.dataset.exitedAt,
        deployFlTime: currentData.deployFlTime
      }

      const otherJumps = []
      for (const otherTrackId of this.displayedCompetitors) {
        if (otherTrackId === trackId) continue

        const otherData = await this.fetchPoints(otherTrackId)
        const otherCompetitorElement = this.element.querySelector(
          `[data-track-id="${otherTrackId}"]`
        )

        otherJumps.push({
          trackId: otherTrackId,
          points: otherData.points,
          exitedAt: otherCompetitorElement?.dataset.exitedAt,
          deployFlTime: otherData.deployFlTime
        })
      }

      const result = checkProximityViolation(
        currentJump,
        otherJumps,
        this.dlStartValue === 'on_10_sec' ? 10 : 9,
        this.mapTarget.mapInstance
      )

      this.proximityMarkers = result.markers
      this.updateProximityCheck(result.hasViolation)
    } catch (error) {
      console.error('Error in performProximityCheck:', error)
      this.updateProximityCheck(false)
    }
  }

  updateProximityCheck(hasViolation) {
    if (!this.hasProximityCheckTarget) return

    if (hasViolation) {
      const warningIndicator = this.indicatorWarningTarget.content.cloneNode(true)
      this.proximityCheckTarget.replaceChildren(warningIndicator)
    } else {
      const okIndicator = this.indicatorOkTarget.content.cloneNode(true)
      this.proximityCheckTarget.replaceChildren(okIndicator)
    }
  }
}
