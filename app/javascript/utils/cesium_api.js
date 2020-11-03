import { loadScript, loadStyles } from 'utils/load_external'

import Meta from 'utils/meta'

const BingMapsApi = 'AiG804EvOUQOmDJV0kiOY8SSD0U1HirOAKucXLbAKTRy1XAVTaBDnO7FCty3X-n6'

const StylesURL =
  'https://cesiumjs.org/releases/1.63/Build/Cesium/Widgets/widgets.css'
const ScriptURL =
  'https://cesiumjs.org/releases/1.63/Build/Cesium/Cesium.js'

export function initCesiumApi() {
  if (window.cesiumApiReady) {
    dispatchReady()
    return
  }

  loadStyles(StylesURL)
  loadScript(ScriptURL, { onLoad, onError })
}

function onLoad() {
  window.cesiumApiReady = true

  Cesium.Ion.defaultAccessToken = Meta.cesiumApiKey
  Cesium.BingMapsApi.defaultKey = BingMapsApi

  dispatchReady()
}

function onError() {
  window.cesiumApiReady = false

  document.dispatchEvent(
    new Event('cesium_api:failed', { bubbles: true, cancellable: true })
  )
}

function dispatchReady() {
  document.dispatchEvent(
    new Event('cesium_api:ready', { bubbles: true, cancellable: true })
  )
}
