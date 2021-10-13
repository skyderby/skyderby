import { useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

import Meta from 'utils/meta'

const loader = new Loader({
  apiKey: Meta.mapsApiKey ?? '',
  version: 'weekly',
  libraries: []
})

const useGoogleMapsApi = (): typeof google | undefined => {
  const [mapsApi, setMapsApi] = useState<typeof google>()

  useEffect(() => {
    let active = true

    loader.load().then((mapsApi: typeof google) => {
      if (active) setMapsApi(mapsApi)
    })

    return () => {
      active = false
    }
  }, [setMapsApi])

  return mapsApi
}

export default useGoogleMapsApi
