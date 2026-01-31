import { Controller } from '@hotwired/stimulus'
import { initYoutubeApi } from 'utils/youtube'
import getPointsAroundTime from 'utils/getPointsAroundTime'

const interpolateValue = (first, second, factor) => first + (second - first) * factor

export default class extends Controller {
  static targets = ['data', 'playbackIndicators']

  connect() {
    initYoutubeApi()
    const data = JSON.parse(this.dataTarget.textContent)
    this.points = data.points
    this.videoSettings = data.videoSettings
    this.startAltitude =
      this.points.find(p => p.flTime >= this.videoSettings.trackOffset)?.altitude ??
      this.points[0].altitude

    this.drawFrame = this.drawFrame.bind(this)
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this)
  }

  onYoutubeApiReady() {
    this.initPlayer()
  }

  initPlayer() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: this.element.getAttribute('data-video-id'),
      playerVars: {
        fs: 0,
        iv_load_policy: 3,
        rel: 0
      },
      events: {
        onStateChange: this.onPlayerStateChange
      }
    })
  }

  onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && this.timerId === undefined) {
      this.timerId = requestAnimationFrame(this.drawFrame)
    } else if (
      [YT.PlayerState.ENDED, YT.PlayerState.PAUSED].includes(event.data) &&
      this.timerId !== undefined
    ) {
      cancelAnimationFrame(this.timerId)
      this.timerId = undefined
    }
  }

  drawFrame() {
    const currentTime = this.player.getCurrentTime()
    const { data: currentData, trackTime } = currentTime
      ? this.getDataForTime(currentTime)
      : { data: null, trackTime: null }
    this.updateProgress(currentData, trackTime)

    this.timerId = requestAnimationFrame(this.drawFrame)
  }

  updateProgress(currentData, trackTime) {
    const controller = this.getPlaybackIndicatorsController()
    if (!controller) return

    if (currentData) {
      controller.update(currentData)
      this.updateAccelerationIndicators(currentData, trackTime, controller)
    }
  }

  updateAccelerationIndicators(currentData, trackTime, controller) {
    const futureTime = trackTime + 1
    const futureData = this.getInterpolatedPoint(futureTime)
    if (!futureData) return

    const currFullSpeed = currentData.fullSpeed / 3.6
    const currHSpeed = currentData.hSpeed / 3.6
    const currVSpeed = currentData.vSpeed / 3.6
    const futureFullSpeed = futureData.fullSpeed / 3.6
    const futureHSpeed = futureData.hSpeed / 3.6
    const futureVSpeed = futureData.vSpeed / 3.6

    const fullSpeedAccel = futureFullSpeed - currFullSpeed
    const hSpeedAccel = futureHSpeed - currHSpeed
    const vSpeedAccel = futureVSpeed - currVSpeed

    controller.updateAcceleration({ fullSpeedAccel, hSpeedAccel, vSpeedAccel })
  }

  getPlaybackIndicatorsController() {
    if (!this.hasPlaybackIndicatorsTarget) return null

    return this.application.getControllerForElementAndIdentifier(
      this.playbackIndicatorsTarget,
      'playback-indicators'
    )
  }

  getDataForTime(time) {
    const { trackOffset, videoOffset } = this.videoSettings
    const relativeTime = time - videoOffset

    if (relativeTime < 0) return { data: null, trackTime: null }

    const trackTime = relativeTime + trackOffset

    return { data: this.getInterpolatedPoint(trackTime), trackTime }
  }

  getInterpolatedPoint(flTime) {
    const [first, second] = getPointsAroundTime(this.points, flTime) ?? []

    if (!first || !second) return null

    const interpolationFactor = (flTime - first.flTime) / (second.flTime - first.flTime)
    const altitude = interpolateValue(
      first.altitude,
      second.altitude,
      interpolationFactor
    )

    return {
      altitude,
      altitudeSpent: this.startAltitude - altitude,
      fullSpeed: interpolateValue(first.fullSpeed, second.fullSpeed, interpolationFactor),
      hSpeed: interpolateValue(first.hSpeed, second.hSpeed, interpolationFactor),
      vSpeed: interpolateValue(first.vSpeed, second.vSpeed, interpolationFactor),
      glideRatio: interpolateValue(
        first.glideRatio,
        second.glideRatio,
        interpolationFactor
      )
    }
  }
}
