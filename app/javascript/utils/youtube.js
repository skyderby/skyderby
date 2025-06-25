function videoCodeFromUrl(url) {
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
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

function initYoutubeApi() {
  // Only import dependencies when actually initializing
  if (typeof window === 'undefined') return

  import('utils/load_external').then(({ loadScript }) => {
    import('./youtube/callbacks').then(() => {
      if (window.youtubeApiReady) {
        document.dispatchEvent(
          new Event('youtube_api:ready', { bubbles: true, cancellable: true })
        )
      } else {
        loadScript('https://www.youtube.com/iframe_api', {
          onError: window.onYoutubeApiLoadingError
        })
      }
    })
  })
}

export { initYoutubeApi, videoCodeFromUrl, defaultPlayerOptions }
