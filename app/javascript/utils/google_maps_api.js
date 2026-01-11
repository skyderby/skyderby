import { loadScript } from 'utils/load_external'

const getMapsApiKey = () => {
  const meta = document.querySelector('meta[name="maps-api-key"]')
  return meta ? meta.content : null
}

const initMapsApi = () =>
  new Promise((resolve, reject) => {
    const mapsApiKey = getMapsApiKey()
    if (!mapsApiKey) {
      reject(new Error('Maps API key not found'))
      return
    }

    const URL = `https://maps.googleapis.com/maps/api/js?callback=onMapsApiReady&key=${mapsApiKey}&libraries=marker`
    const onReady = () => {
      window.removeEventListener('maps_api:ready', onReady)
      window.removeEventListener('maps_api:failed', onFailed)
      resolve()
    }
    const onFailed = () => {
      window.removeEventListener('maps_api:ready', onReady)
      window.removeEventListener('maps_api:failed', onFailed)
      reject()
    }

    window.addEventListener('maps_api:ready', resolve, { once: true })
    window.addEventListener('maps_api:failed', reject, { once: true })

    if (window.mapsApiReady) {
      resolve()
    } else {
      loadScript(URL, { onError: reject })
    }
  })

export default initMapsApi

window.onMapsApiReady = () => {
  window.mapsApiReady = true
  document.dispatchEvent(
    new Event('maps_api:ready', { bubbles: true, cancellable: true })
  )
}

window.onMapsApiLoadingError = () => {
  window.mapsApiReady = false
  document.dispatchEvent(
    new Event('maps_api:failed', { bubbles: true, cancellable: true })
  )
}
