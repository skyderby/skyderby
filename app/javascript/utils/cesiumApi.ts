import { loadScript, loadStyles } from 'utils/loadExternal'

import Meta from 'utils/meta'

const BingMapsApi = 'AiG804EvOUQOmDJV0kiOY8SSD0U1HirOAKucXLbAKTRy1XAVTaBDnO7FCty3X-n6'

const StylesURL =
  'https://cesium.com/downloads/cesiumjs/releases/1.67/Build/Cesium/Widgets/widgets.css'
const ScriptURL =
  'https://cesium.com/downloads/cesiumjs/releases/1.67/Build/Cesium/Cesium.js'

export function initCesiumApi(): void {
  if (window.cesiumApiReady) {
    dispatchReady()
    return
  }

  loadStyles(StylesURL)
  loadScript(ScriptURL, { onLoad, onError })
}

function onLoad() {
  window.cesiumApiReady = true

  if (Meta.cesiumApiKey) window.Cesium.Ion.defaultAccessToken = Meta.cesiumApiKey
  window.Cesium.BingMapsApi.defaultKey = BingMapsApi

  dispatchReady()
}

function onError() {
  window.cesiumApiReady = false

  document.dispatchEvent(
    new Event('cesium_api:failed', { bubbles: true, cancelable: true })
  )
}

function dispatchReady() {
  document.dispatchEvent(
    new Event('cesium_api:ready', { bubbles: true, cancelable: true })
  )
}
