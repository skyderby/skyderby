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
    'fullSpeedAccel',
    'hSpeed',
    'hSpeedAccel',
    'vSpeed',
    'vSpeedAccel',
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
    const { data: currentData, trackTime } = currentTime
      ? this.getDataForTime(currentTime)
      : { data: null, trackTime: null }
    this.updateProgress(currentData, trackTime)

    this.timerId = requestAnimationFrame(this.drawFrame)
  }

  updateProgress(currentData, trackTime) {
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

      this.updateAccelerationIndicators(currentData, trackTime)
    } else {
      this.altitudeTarget.innerText = '---'
      this.altitudeSpentTarget.innerText = '---'
      this.fullSpeedTarget.innerText = '---'
      this.hSpeedTarget.innerText = '---'
      this.vSpeedTarget.innerText = '---'
      this.glideRatioTarget.innerText = '--.-'
      this.angleTarget.setAttribute('d', 'M 15 117 65 117')
      this.resetAccelerationIndicators()
    }
  }

  updateAccelerationIndicators(currentData, trackTime) {
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

    if (this.hasFullSpeedAccelTarget) {
      this.updateAccelIcons(this.fullSpeedAccelTarget, fullSpeedAccel)
    }
    if (this.hasHSpeedAccelTarget) {
      this.updateAccelIcons(this.hSpeedAccelTarget, hSpeedAccel)
    }
    if (this.hasVSpeedAccelTarget) {
      this.updateAccelIcons(this.vSpeedAccelTarget, vSpeedAccel)
    }
  }

  resetAccelerationIndicators() {
    const targets = [
      this.hasFullSpeedAccelTarget && this.fullSpeedAccelTarget,
      this.hasHSpeedAccelTarget && this.hSpeedAccelTarget,
      this.hasVSpeedAccelTarget && this.vSpeedAccelTarget
    ].filter(Boolean)

    targets.forEach(target => {
      target.querySelectorAll('.icon').forEach(icon => icon.classList.remove('active'))
    })
  }

  updateAccelIcons(container, acceleration) {
    const icons = container.querySelectorAll('.icon')
    icons.forEach(icon => icon.classList.remove('active'))

    const threshold = 4
    const smallThreshold = 0.5

    if (Math.abs(acceleration) < smallThreshold) {
      icons[2].classList.add('active')
    } else if (acceleration > 0) {
      icons[2].classList.add('active')
      icons[1].classList.add('active')
      if (acceleration >= threshold) {
        icons[0].classList.add('active')
      }
    } else {
      icons[2].classList.add('active')
      icons[3].classList.add('active')
      if (acceleration <= -threshold) {
        icons[4].classList.add('active')
      }
    }
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
