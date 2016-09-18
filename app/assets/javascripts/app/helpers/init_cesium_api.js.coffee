Skyderby.helpers.init_cesium_api = ->
  if Skyderby.cesium_api_ready
    Skyderby.trigger 'cesium_api:ready'
  else
    Skyderby.helpers.load_styles 'https://cesiumjs.org/releases/1.25/Build/Cesium/Widgets/widgets.css'
    Skyderby.helpers.load_script 'https://cesiumjs.org/releases/1.25/Build/Cesium/Cesium.js', 
      on_load: on_cesium_api_ready,
      on_error: on_cesium_api_error
