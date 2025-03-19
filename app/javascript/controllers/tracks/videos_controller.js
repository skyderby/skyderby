import { Controller } from '@hotwired/stimulus'
import { initYoutubeApi } from 'utils/youtube'
import getPointsAroundTime from 'utils/getPointsAroundTime'

const valueWithStep = (value, step) => Math.round(value / step) * step
const interpolateValue = (first, second, factor) => first + (second - first) * factor

export default class extends Controller {
  static targets = [
    'data',
    'altitude',
    'altitudeSpent',
    'fullSpeed',
    'hSpeed',
    'vSpeed',
    'glideRatio',
    'angle'
  ]

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
    const currentData = currentTime ? this.getDataForTime(currentTime) : null
    this.updateProgress(currentData)

    this.timerId = requestAnimationFrame(this.drawFrame)
  }

  updateProgress(currentData) {
    if (currentData) {
      this.altitudeTarget.innerText = valueWithStep(currentData.altitude, 10).toFixed()
      this.altitudeSpentTarget.innerText = valueWithStep(
        currentData.altitudeSpent,
        10
      ).toFixed()
      this.fullSpeedTarget.innerText = valueWithStep(currentData.fullSpeed, 5).toFixed()
      this.hSpeedTarget.innerText = valueWithStep(currentData.hSpeed, 5).toFixed()
      this.vSpeedTarget.innerText = valueWithStep(currentData.vSpeed, 5).toFixed()
      this.glideRatioTarget.innerText = currentData.glideRatio.toFixed(1)

      const angle =
        (90 * Math.PI) / 180 - Math.atan2(currentData.vSpeed, currentData.hSpeed)
      const startX = 15 * Math.sin(angle)
      const startY = 115 + 15 * Math.cos(angle)
      const endX = 65 * Math.sin(angle)
      const endY = 115 + 65 * Math.cos(angle)
      this.angleTarget.setAttribute('d', `M ${startX} ${startY} ${endX} ${endY}`)
    } else {
      this.altitudeTarget.innerText = '---'
      this.altitudeSpentTarget.innerText = '---'
      this.fullSpeedTarget.innerText = '---'
      this.hSpeedTarget.innerText = '---'
      this.vSpeedTarget.innerText = '---'
      this.glideRatioTarget.innerText = '--.-'
      this.angleTarget.setAttribute('d', 'M 15 117 65 117')
    }
  }

  getDataForTime(time) {
    const { trackOffset, videoOffset } = this.videoSettings
    const relativeTime = time - videoOffset

    if (relativeTime < 0) return null

    const trackTime = relativeTime + trackOffset

    return this.getInterpolatedPoint(trackTime)
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
