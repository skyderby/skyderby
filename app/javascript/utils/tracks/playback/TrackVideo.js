import { defaultPlayerOptions } from '../../youtube'

const SEEK_INTERVAL = 150
const PRIME_TIMEOUT = 4000
const END_MARGIN = 0.5
const DRIFT_TOLERANCE = 0.4
const DRIFT_CHECK_INTERVAL = 1000

export const flTimeAt = (videoTime, { videoOffset, trackOffset }) =>
  videoTime - videoOffset + trackOffset

export const videoTimeAt = (flTime, { videoOffset, trackOffset }) =>
  flTime - trackOffset + videoOffset

export default class TrackVideo {
  constructor(
    container,
    { videoCode, videoOffset, trackOffset, muted = false, onTime, onPlayingChange }
  ) {
    this.offsets = { videoOffset, trackOffset }
    this.onTime = onTime
    this.onPlayingChange = onPlayingChange
    this.container = container
    this.playing = false
    this.ready = false
    this.priming = false
    this.ended = false
    this.pendingTime = null
    this.lastSeekAt = 0
    this.lastDriftCheckAt = 0

    this.tick = this.tick.bind(this)

    const mount = document.createElement('div')
    container.replaceChildren(mount)

    this.player = new YT.Player(mount, {
      ...defaultPlayerOptions,
      videoId: videoCode,
      playerVars: { ...defaultPlayerOptions.playerVars, playsinline: 1 },
      events: {
        onReady: () => this.handleReady(muted),
        onError: () => this.handleError(),
        onStateChange: event => this.handleStateChange(event.data)
      }
    })
  }

  get currentFlTime() {
    return flTimeAt(this.player.getCurrentTime(), this.offsets)
  }

  toggle() {
    if (this.playing) this.pause()
    else this.play()
  }

  play() {
    if (!this.ready || this.ended) return
    if (this.priming) this.finishPriming()

    this.player.playVideo()
  }

  pause() {
    if (this.ready) this.player.pauseVideo()
  }

  follow(flTime) {
    if (!this.ready || !(this.playing || this.ended)) return

    const now = performance.now()
    if (now - this.lastDriftCheckAt < DRIFT_CHECK_INTERVAL) return
    this.lastDriftCheckAt = now

    const target = videoTimeAt(flTime, this.offsets)
    if (target !== this.clampTime(target)) return

    if (this.ended || Math.abs(this.player.getCurrentTime() - target) > DRIFT_TOLERANCE) {
      this.player.seekTo(target, true)
    }
  }

  seek(flTime) {
    if (!this.ready) return

    this.ended = false
    this.pendingTime = this.clampTime(videoTimeAt(flTime, this.offsets))
    if (this.priming) return

    if (this.playing || this.isPausedOrBuffering) this.scheduleSeek()
    else this.prime()
  }

  destroy() {
    cancelAnimationFrame(this.frame)
    clearTimeout(this.seekTimer)
    clearTimeout(this.primeTimer)
    this.player.destroy?.()
    this.container.replaceChildren()
  }

  clampTime(time) {
    const duration = this.player.getDuration()
    const end = duration > 0 ? duration - END_MARGIN : Infinity
    return Math.max(Math.min(time, end), 0)
  }

  get isPausedOrBuffering() {
    const { PAUSED, BUFFERING } = YT.PlayerState
    return [PAUSED, BUFFERING].includes(this.player.getPlayerState())
  }

  prime() {
    this.priming = true
    this.wasMuted = this.player.isMuted()
    this.player.mute()
    this.player.seekTo(this.pendingTime, true)
    this.pendingTime = null
    this.primeTimer = setTimeout(() => this.abortPriming(), PRIME_TIMEOUT)
  }

  abortPriming() {
    this.player.pauseVideo()
    this.finishPriming()
  }

  finishPriming() {
    clearTimeout(this.primeTimer)
    this.priming = false
    if (!this.wasMuted) this.player.unMute()
  }

  scheduleSeek() {
    if (this.seekTimer) return

    const wait = Math.max(0, SEEK_INTERVAL - (performance.now() - this.lastSeekAt))
    this.seekTimer = setTimeout(() => {
      this.seekTimer = null
      this.flushSeek()
    }, wait)
  }

  flushSeek() {
    if (this.pendingTime === null) return
    if (!this.playing && this.player.getPlayerState() !== YT.PlayerState.PAUSED) return

    this.lastSeekAt = performance.now()
    this.player.seekTo(this.pendingTime, true)
    this.pendingTime = null
  }

  handleReady(muted) {
    this.ready = true
    if (muted) this.player.mute()
  }

  handleError() {
    this.ready = false
    this.setPlaying(false)
  }

  handleStateChange(state) {
    const { PLAYING, PAUSED, ENDED } = YT.PlayerState

    if (state === PLAYING && this.priming) {
      this.player.pauseVideo()
    } else if (state === PAUSED && this.priming) {
      this.finishPriming()
      this.flushSeek()
    } else if (state === PLAYING) {
      this.ended = false
      this.pendingTime = null
      this.setPlaying(true)
    } else if (state === PAUSED || state === ENDED) {
      this.ended = state === ENDED
      this.setPlaying(false)
      this.flushSeek()
    }
  }

  setPlaying(playing) {
    if (playing === this.playing) return

    this.playing = playing
    this.onPlayingChange?.(playing)

    if (playing) {
      this.frame = requestAnimationFrame(this.tick)
    } else {
      cancelAnimationFrame(this.frame)
      this.onTime?.(this.currentFlTime)
    }
  }

  tick() {
    this.onTime?.(this.currentFlTime)
    this.frame = requestAnimationFrame(this.tick)
  }
}
