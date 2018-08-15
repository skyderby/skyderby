import { Controller } from 'stimulus'
import init_youtube_api from 'utils/youtube_api'

export default class extends Controller {
  connect() {
    init_youtube_api()
    this.fetch_data()
  }

  fetch_data() {
    const url = this.element.getAttribute('data-url')
    fetch(url, { credentials: 'same-origin',
                 headers: { 'Accept': 'application/json' } })
      .then( response => { return response.json() })
      .then(this.on_data_ready)
  }

  on_youtube_api_ready() {
    this.init_player()
  }

  on_data_ready(data) {
    this.video_data = data
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
    console.log(current_time)
  }
}
