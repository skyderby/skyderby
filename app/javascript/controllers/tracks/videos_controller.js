import { Controller } from 'stimulus'
import VideoData from 'models/tracks/video'
import { initYoutubeApi } from 'utils/youtube'

export default class extends Controller {
  static targets = [ 'altitude', 'altitude_spent', 'h_speed', 'v_speed', 'glide_ratio' ]

  connect() {
    initYoutubeApi()
    this.fetchData()
  }

  fetchData() {
    const url = this.element.getAttribute('data-url')
    fetch(url, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then(response => { return response.json() })
      .then(this.on_data_ready)
  }

  on_youtube_api_ready() {
    this.init_player()
  }

  on_data_ready = (data) => {
    this.model = new VideoData(data)
  }

  init_player() {
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
        'onStateChange': this.on_player_state_change
      }
    })
  }

  on_player_state_change = (event) => {
    if (event.data === YT.PlayerState.PLAYING && this.timer_id === undefined) {
      this.timer_id = setInterval( () => { this.update_progress(this.player.getCurrentTime()) }, 500)
    } else if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
      if (this.timer_id === undefined) return
      clearInterval(this.timer_id)
      this.timer_id = undefined
    }
  }

  update_progress(current_time) {
    let point = this.model.point_in_time(current_time)

    this.altitudeTarget.innerText = point.altitude
    this.altitude_spentTarget.innerText = point.altitude_spent
    this.h_speedTarget.innerText = point.h_speed
    this.v_speedTarget.innerText = point.v_speed
    this.glide_ratioTarget.innerText = point.glide_ratio
  }
}
