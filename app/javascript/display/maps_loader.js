import initMapsApi from 'utils/google_maps_api'

let promise = null

export default function loadMaps() {
  if (!promise) promise = initMapsApi()
  return promise
}
