import { useEffect, useState } from 'react'

import initMapsApi from 'utils/google_maps_api'

const useGoogleMapsApi = () => {
  const [google, setGoogle] = useState()

  useEffect(() => {
    const onApiReady = () => setGoogle(window.google)

    window.addEventListener('maps_api:ready', onApiReady, { once: true })

    initMapsApi()

    return () => window.removeEventListener('maps_api:ready', onApiReady)
  }, [])

  return google
}

export default useGoogleMapsApi
