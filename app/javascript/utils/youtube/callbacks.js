window.onYouTubeIframeAPIReady = () => {
  window.youtube_api_ready = true;
  document.dispatchEvent(new Event('youtube_api:ready', { bubbles: true, cancellable: true }));
}

window.on_youtube_api_loading_error = () => {
  window.youtube_api_ready = false
  document.dispatchEvent(new Event('youtube_api:failed', { bubbles: true, cancellable: true }));
}
