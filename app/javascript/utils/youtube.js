import load_script from 'utils/load_script'
import 'utils/youtube/callbacks'

function init_youtube_api() {
  if (window.youtube_api_ready) {
    document.dispatchEvent(new Event('youtube_api:ready', { bubbles: true, cancellable: true }))
  } else {
    load_script('https://www.youtube.com/iframe_api', { on_error: on_youtube_api_loading_error })
  }
}

function video_code_from_url(url) {
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  let regex_matches = regex.exec(url)
  if (!regex_matches) return
  return regex_matches[2]
}

const default_player_options = {
  height: '390',
  width: '640',
  playerVars: {
    fs: 0,
    iv_load_policy: 3,
    rel: 0
  }
}

export { init_youtube_api, video_code_from_url, default_player_options }
