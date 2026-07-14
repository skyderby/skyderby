import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
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
    const points = this.playbackPoints

    for (let i = 0; i < points.length - 1; i++) {
      const currTime = this.pointTime(points[i])
      const nextTime = this.pointTime(points[i + 1])

      if (targetTime >= currTime && targetTime < nextTime) {
        const fraction = (targetTime - currTime) / (nextTime - currTime)
        return { index: i, fraction }
      }
    }

    return { index: points.length - 1, fraction: 0 }
  }

  stopPlaybackLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}
