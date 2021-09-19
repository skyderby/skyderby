import { useEffect, useState } from 'react'

import { loadScript } from 'utils/loadExternal'

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

const useYoutubeApi = (): typeof window.YT | undefined => {
  const [YT, setYT] = useState<typeof window.YT>()

  useEffect(() => {
    const onApiReady = () => setYT(window.YT)

    window.addEventListener(apiReady, onApiReady, { once: true })

    initYoutubeApi()

    return () => window.removeEventListener(apiReady, onApiReady)
  }, [])

  return YT
}

export const videoCodeFromUrl = (url: string): string | undefined => {
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const regex_matches = regex.exec(url)
  if (!regex_matches) return
  return regex_matches[2]
}

export default useYoutubeApi
