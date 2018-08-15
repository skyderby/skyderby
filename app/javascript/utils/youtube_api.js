import load_script from 'utils/load_script'

export default function() {
  if (window.youtube_api_ready) {
    document.dispatchEvent(new Event('youtube_api:ready', { bubbles: true, cancellable: true }))
  } else {
    load_script('https://www.youtube.com/iframe_api', { on_error: on_youtube_api_loading_error })
  }
}

window.onYouTubeIframeAPIReady = () => {
  window.youtube_api_ready = true;
  document.dispatchEvent(new Event('youtube_api:ready', { bubbles: true, cancellable: true }));
}

window.on_youtube_api_loading_error = () => {
  window.youtube_api_ready = false
  document.dispatchEvent(new Event('youtube_api:failed', { bubbles: true, cancellable: true }));
}
