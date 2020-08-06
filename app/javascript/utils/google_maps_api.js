import { loadScript } from 'utils/load_external'

const URL = `https://maps.googleapis.com/maps/api/js?callback=onMapsApiReady&key=${window.MAPS_API_KEY}`

export default function () {
  if (window.mapsApiReady) {
    document.dispatchEvent(
      new Event('maps_api:ready', { bubbles: true, cancellable: true })
    )
  } else {
    loadScript(URL, { onError: window.onMapsApiLoadingError })
  }
}

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
