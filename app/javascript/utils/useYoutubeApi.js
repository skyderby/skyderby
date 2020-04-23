import { useEffect, useState } from 'react'

import { loadScript } from 'utils/load_external'

const apiReady = 'youtube_api:ready'
const apiError = 'youtube_api:failed'

const eventDetails = { bubbles: true, cancellable: true }

window.onYouTubeIframeAPIReady = () => {
  window.youtubeApiReady = true

  document.dispatchEvent(new Event(apiReady, eventDetails))
}

window.onYoutubeApiLoadingError = () => {
  window.youtubeApiReady = false

  document.dispatchEvent(new Event(apiError, eventDetails))
}

const initYoutubeApi = () => {
  if (window.youtubeApiReady) {
    document.dispatchEvent(new Event(apiReady, eventDetails))
  } else {
    loadScript('https://www.youtube.com/iframe_api', {
      onError: window.onYoutubeApiLoadingError
    })
  }
}

const useYoutubeApi = () => {
  const [YT, setYT] = useState()

  useEffect(() => {
    const onApiReady = () => setYT(window.YT)

    window.addEventListener(apiReady, onApiReady, { once: true })

    initYoutubeApi()

    return () => window.removeEventListener(apiReady, onApiReady)
  }, [])

  return YT
}

export default useYoutubeApi
