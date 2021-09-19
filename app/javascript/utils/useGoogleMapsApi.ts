import { useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

const loader = new Loader({
  apiKey: window.MAPS_API_KEY ?? '',
  version: 'weekly',
  libraries: []
})

const useGoogleMapsApi = () => {
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
