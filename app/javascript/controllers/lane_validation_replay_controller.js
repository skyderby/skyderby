import { Controller } from '@hotwired/stimulus'
import {
  ReplayOverlay,
  prepareJumps,
  timelineRange,
  formatElapsed
} from 'utils/laneValidation/replay'

const RANGE_STEPS = 1000

export default class extends Controller {
  static targets = ['playButton', 'range', 'time']
  static values = { unit: String, playLabel: String, pauseLabel: String }

  connect() {
    this.reset()
  }

  disconnect() {
    this.reset()
  }

  load(jumps, map) {
    const wasPlaying = this.playing
    const previousTime = this.currentTime

    this.stop()
    this.overlay?.clear()

    this.jumps = prepareJumps(jumps)
    this.timeline = timelineRange(this.jumps)

    if (!this.timeline) {
      this.reset()
      return
    }

    this.overlay = new ReplayOverlay(map, { unit: this.unitValue })
    this.currentTime = this.clampTime(previousTime ?? this.timeline.start)
    this.setEnabled(true)

    if (wasPlaying && this.currentTime < this.timeline.end) {
      this.play()
    } else {
      this.render()
    }
  }

  reset() {
    this.stop()
    this.overlay?.clear()
    this.overlay = null
    this.jumps = []
    this.timeline = null
    this.currentTime = null
    this.setEnabled(false)

    if (this.hasRangeTarget) this.rangeTarget.value = 0
    if (this.hasTimeTarget) this.timeTarget.textContent = formatElapsed(0)
  }

  toggle() {
    if (!this.timeline) return

    if (this.playing) {
      this.stop()
    } else {
      this.play()
    }
  }

  play() {
    if (this.currentTime >= this.timeline.end) this.currentTime = this.timeline.start

    this.playing = true
    this.element.classList.add('playing')
    if (this.hasPlayButtonTarget) this.playButtonTarget.title = this.pauseLabelValue
    this.anchorPlayback()
    this.animationFrame = requestAnimationFrame(timestamp => this.animate(timestamp))
  }

  stop() {
    this.playing = false
    this.element.classList.remove('playing')
    if (this.hasPlayButtonTarget) this.playButtonTarget.title = this.playLabelValue

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  anchorPlayback() {
    this.playbackAnchorTime = this.currentTime
    this.playbackAnchorTimestamp = performance.now()
  }

  animate(timestamp) {
    if (!this.playing) return

    const elapsed = timestamp - this.playbackAnchorTimestamp
    this.currentTime = this.playbackAnchorTime + elapsed

    if (this.currentTime >= this.timeline.end) {
      this.currentTime = this.timeline.end
      this.render()
      this.stop()
      return
    }

    this.render()
    this.animationFrame = requestAnimationFrame(t => this.animate(t))
  }

  seek(event) {
    if (!this.timeline) return

    const fraction = Number(event.target.value) / RANGE_STEPS
    const { start, end } = this.timeline
    this.currentTime = start + (end - start) * fraction

    if (this.playing) this.anchorPlayback()

    this.render()
  }

  clampTime(time) {
    const { start, end } = this.timeline
    return Math.min(Math.max(time, start), end)
  }

  render() {
    if (!this.timeline || !this.overlay) return

    this.overlay.render(this.jumps, this.currentTime)

    const { start, end } = this.timeline
    const fraction = end > start ? (this.currentTime - start) / (end - start) : 0

    this.rangeTarget.value = Math.round(fraction * RANGE_STEPS)
    this.timeTarget.textContent = formatElapsed(this.currentTime - start)
  }

  setEnabled(enabled) {
    if (this.hasPlayButtonTarget) this.playButtonTarget.disabled = !enabled
    if (this.hasRangeTarget) this.rangeTarget.disabled = !enabled
    this.element.classList.toggle('lane-validation-replay--ready', enabled)
  }
}
