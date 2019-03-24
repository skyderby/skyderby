window.onYouTubeIframeAPIReady = () => {
  window.youtubeApiReady = true
  document.dispatchEvent(
    new Event('youtube_api:ready', { bubbles: true, cancellable: true })
  )
}

window.onYoutubeApiLoadingError = () => {
  window.youtubeApiReady = false
  document.dispatchEvent(
    new Event('youtube_api:failed', { bubbles: true, cancellable: true })
  )
}
