import { loadScript } from 'utils/load_external'
import './youtube/callbacks'

function initYoutubeApi() {
  if (window.youtubeApiReady) {
    document.dispatchEvent(
      new Event('youtube_api:ready', { bubbles: true, cancellable: true })
    )
  } else {
    loadScript('https://www.youtube.com/iframe_api', {
      onError: window.onYoutubeApiLoadingError
    })
  }
}

function videoCodeFromUrl(url) {
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const regex_matches = regex.exec(url)
  if (!regex_matches) return
  return regex_matches[2]
}

const defaultPlayerOptions = {
  height: '390',
  width: '640',
  playerVars: {
    fs: 0,
    iv_load_policy: 3,
    rel: 0
  }
}

export { initYoutubeApi, videoCodeFromUrl, defaultPlayerOptions }
