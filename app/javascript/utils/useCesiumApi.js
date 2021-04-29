import { useEffect, useState } from 'react'

import { initCesiumApi } from 'utils/cesium_api'

const useCesiumApi = () => {
  const [cesium, setCesium] = useState()

  useEffect(() => {
    let cancelled = false
    const onApiReady = () => !cancelled && setCesium(window.Cesium)

    window.addEventListener('cesium_api:ready', onApiReady, { once: true })

    initCesiumApi()

    return () => {
      cancelled = true
      window.removeEventListener('maps_api:ready', onApiReady)
    }
  }, [])

  return cesium
}

export default useCesiumApi
