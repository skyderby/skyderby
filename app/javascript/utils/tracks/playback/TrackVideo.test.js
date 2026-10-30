import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TrackVideo, { flTimeAt, videoTimeAt } from './TrackVideo'

const STATES = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 }
const offsets = { videoOffset: 12, trackOffset: 30 }

class FakePlayer {
  constructor(mount, options) {
    FakePlayer.instance = this
    this.options = options
    this.state = STATES.CUED
    this.time = 0
    this.seekTo = vi.fn(time => (this.time = time))
    this.mute = vi.fn()
    this.unMute = vi.fn()
    this.pauseVideo = vi.fn()
    this.playVideo = vi.fn()
  }

  getPlayerState = () => this.state
  getCurrentTime = () => this.time
  getDuration = () => 100
  isMuted = () => false

  emit(state) {
    this.state = state
    this.options.events.onStateChange({ data: state })
  }
}

describe('TrackVideo', () => {
  let video
  let onTime
  let onPlayingChange
  let player

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('YT', { Player: FakePlayer, PlayerState: STATES })
    vi.stubGlobal('document', { createElement: () => ({}) })
    vi.stubGlobal('requestAnimationFrame', callback => setTimeout(callback, 16))
    vi.stubGlobal('cancelAnimationFrame', clearTimeout)
    onTime = vi.fn()
    onPlayingChange = vi.fn()
    video = new TrackVideo(
      { replaceChildren: vi.fn() },
      {
        videoCode: 'abc',
        ...offsets,
        onTime,
        onPlayingChange
      }
    )
    player = FakePlayer.instance
    player.options.events.onReady()
  })

  afterEach(() => {
    video.destroy()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('maps video time to track time and back', () => {
    expect(flTimeAt(14, offsets)).toBe(32)
    expect(videoTimeAt(32, offsets)).toBe(14)
  })

  it('seeks a paused video to the hovered moment, throttling the calls', () => {
    player.state = STATES.PAUSED

    video.seek(32)
    video.seek(33)
    vi.runOnlyPendingTimers()

    expect(player.seekTo).toHaveBeenCalledTimes(1)
    expect(player.seekTo).toHaveBeenCalledWith(15, true)
  })

  it('never seeks past the end of the video', () => {
    player.state = STATES.PAUSED

    video.seek(500)
    vi.runOnlyPendingTimers()

    expect(player.seekTo).toHaveBeenCalledWith(99.5, true)
  })

  it('shows a frame of an unstarted video without leaving it playing', () => {
    video.seek(32)
    expect(player.mute).toHaveBeenCalled()
    expect(player.seekTo).toHaveBeenCalledWith(14, true)

    video.seek(33)
    player.emit(STATES.PLAYING)
    expect(player.pauseVideo).toHaveBeenCalled()
    expect(video.playing).toBe(false)

    player.emit(STATES.PAUSED)
    expect(player.unMute).toHaveBeenCalled()
    expect(player.seekTo).toHaveBeenLastCalledWith(15, true)
    expect(onPlayingChange).not.toHaveBeenCalled()
  })

  it('stays paused when the muted seek outlasts the priming timeout', () => {
    video.seek(32)
    vi.advanceTimersByTime(4000)

    expect(player.pauseVideo).toHaveBeenCalled()
    expect(player.unMute).toHaveBeenCalled()
    expect(video.priming).toBe(false)
  })

  it('keeps the play pressed while a frame is being primed', () => {
    video.seek(32)
    video.toggle()
    player.emit(STATES.PLAYING)

    expect(player.pauseVideo).not.toHaveBeenCalled()
    expect(player.unMute).toHaveBeenCalled()
    expect(video.playing).toBe(true)
  })

  it('stops following a video that fails while playing', () => {
    player.emit(STATES.PLAYING)
    player.options.events.onError()

    expect(video.playing).toBe(false)
    expect(video.ready).toBe(false)
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
  })

  it('reports track time while playing and once more on pause', () => {
    player.time = 14
    player.emit(STATES.PLAYING)
    expect(video.playing).toBe(true)
    expect(onPlayingChange).toHaveBeenCalledWith(true)

    vi.advanceTimersByTime(16)
    expect(onTime).toHaveBeenLastCalledWith(32)

    onTime.mockClear()
    player.emit(STATES.PAUSED)
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
    expect(onTime).toHaveBeenCalledTimes(1)
  })

  it('corrects drift while following another video', () => {
    player.emit(STATES.PLAYING)
    player.time = 14

    vi.advanceTimersByTime(1000)
    video.follow(32.2)
    expect(player.seekTo).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    video.follow(40)
    expect(player.seekTo).toHaveBeenCalledWith(22, true)
  })

  it('leaves a follower alone outside of its video', () => {
    player.emit(STATES.PLAYING)

    vi.advanceTimersByTime(1000)
    video.follow(10)

    expect(player.seekTo).not.toHaveBeenCalled()
  })

  it('stays ended instead of restarting with the other video', () => {
    player.emit(STATES.PLAYING)
    player.emit(STATES.ENDED)

    video.play()

    expect(video.ended).toBe(true)
    expect(player.playVideo).not.toHaveBeenCalled()
  })

  it('returns to the moment the other video reaches again after ending', () => {
    player.emit(STATES.ENDED)

    vi.advanceTimersByTime(1000)
    video.follow(40)

    expect(player.seekTo).toHaveBeenCalledWith(22, true)
  })

  it('toggles playback', () => {
    video.toggle()
    expect(player.playVideo).toHaveBeenCalled()

    player.emit(STATES.PLAYING)
    video.toggle()
    expect(player.pauseVideo).toHaveBeenCalled()
  })
})
