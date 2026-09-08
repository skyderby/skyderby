import { Controller } from '@hotwired/stimulus'
import {
  timeOf,
  lerp,
  indexAtTime,
  interpolateAtIndex,
  interpolateByPlayerTime
} from 'utils/tracks/pointHelpers'
import {
  accelerationAt,
  accelerationAtPlayerTime
} from 'utils/tracks/playback/indicators'

export default class extends Controller {
  get playbackPoints() {
    return this.points
  }

  pointTime(point) {
    return timeOf(point)
  }

  get currentPlayerTime() {
    const points = this.playbackPoints
    const curr = points[this.currentIndex]
    const next = points[Math.min(this.currentIndex + 1, points.length - 1)]
    return lerp(curr.playerTime, next.playerTime, this.currentFraction || 0)
  }

  get playbackCharts() {
    return [
      this.glideChartTarget?.chart,
      this.speedChartTarget?.chart,
      this.sepChartTarget?.chart
    ]
  }

  get startAltitude() {
    return this.playbackPoints[0]?.altitude
  }

  resetPlayback() {
    this.currentIndex = 0
    this.currentFraction = 0

    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.max = this.playbackPoints.length - 1
      this.playbackSliderTarget.value = 0
    }
  }

  togglePlay() {
    this.playing = !this.playing

    if (this.hasPlayButtonTarget) {
      this.playButtonTarget.classList.toggle('playing', this.playing)
    }

    if (this.playing) {
      const points = this.playbackPoints
      const firstPointTime = this.pointTime(points[0])
      const currentPointTime = this.pointTime(points[this.currentIndex])
      this.playbackOffset = currentPointTime - firstPointTime
      this.playbackStartTime = performance.now()
      this.animationFrame = requestAnimationFrame(t => this.animate(t))
    } else {
      this.stopPlaybackLoop()
    }
  }

  animate(timestamp) {
    if (!this.playing) return

    const points = this.playbackPoints
    const elapsed = timestamp - this.playbackStartTime
    const firstPointTime = this.pointTime(points[0])
    const targetTime = firstPointTime + this.playbackOffset + elapsed
    const lastPointTime = this.pointTime(points[points.length - 1])

    if (targetTime >= lastPointTime) {
      this.playing = false
      this.currentIndex = points.length - 1
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
    return indexAtTime(this.playbackPoints, targetTime)
  }

  stopPlaybackLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  onSliderInput() {
    this.seekTo(parseInt(this.playbackSliderTarget.value, 10))
  }

  seekTo(index) {
    this.currentIndex = index
    this.currentFraction = 0
    this.updatePlaybackPosition()
  }

  updatePlaybackPosition() {
    this.currentFraction = 0
    this.syncSlider()
    this.syncPosition(this.currentIndex, 0, false)
  }

  updatePlaybackPositionInterpolated() {
    this.syncSlider()
    this.syncPosition(this.currentIndex, this.currentFraction, true)
  }

  syncSlider() {
    if (this.hasPlaybackSliderTarget) {
      this.playbackSliderTarget.value = this.currentIndex
    }
  }

  syncPosition() {}

  indicatorsController(element) {
    if (!element) return null

    return this.application.getControllerForElementAndIdentifier(
      element,
      'playback-indicators'
    )
  }

  updatePlaybackIndicators(index, fraction) {
    if (!this.hasPlaybackIndicatorsTarget) return

    const controller = this.indicatorsController(this.playbackIndicatorsTarget)
    if (!controller) return

    const points = this.playbackPoints
    const data = interpolateAtIndex(points, index, fraction)
    if (!data) return

    data.altitudeSpent = this.startAltitude - data.altitude
    controller.update(data, this.units)

    const acceleration = accelerationAt(points, index, fraction)
    if (acceleration) controller.updateAcceleration(acceleration)
  }

  updateComparePlaybackIndicators(points, playerTime) {
    if (!this.hasComparePlaybackIndicatorsTarget || !points?.length) return

    const controller = this.indicatorsController(this.comparePlaybackIndicatorsTarget)
    if (!controller) return

    const point = interpolateByPlayerTime(points, playerTime)
    if (!point) return

    controller.update(
      {
        altitude: point.altitude,
        altitudeSpent: points[0].altitude - point.altitude,
        fullSpeed: point.fullSpeed,
        hSpeed: point.hSpeed,
        vSpeed: point.vSpeed,
        glideRatio: point.glideRatio ?? 0
      },
      this.units
    )

    const acceleration = accelerationAtPlayerTime(points, playerTime, point)
    if (acceleration) controller.updateAcceleration(acceleration)
  }
}
