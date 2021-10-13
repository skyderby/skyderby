import { useEffect, useState } from 'react'
import Cesium from 'cesium'

import { initCesiumApi } from 'utils/cesiumApi'

const useCesiumApi = (): typeof Cesium | undefined => {
  const [cesium, setCesium] = useState<typeof Cesium>()

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
