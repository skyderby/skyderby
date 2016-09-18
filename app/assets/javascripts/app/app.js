//= require_self
//= require_tree ./templates
//= require_tree ./models
//= require_tree ./collections
//= require_tree ./helpers
//= require_tree ./views

window.Skyderby = {
  collections: {},
  models: {},
  helpers: {},
  views: {},

  maps_api_ready: false,
  cesium_api_ready: false,
  youtuby_api_ready: false
};

_.extend(Skyderby, Backbone.Events);

function on_maps_api_ready() {
  Skyderby.maps_api_ready = true;
  Skyderby.trigger('maps_api:ready');
}

function on_maps_api_loading_error() {
  Skyderby.maps_api_ready = false;
  Skyderby.trigger('maps_api:failed');
}

function on_cesium_api_ready() {
  Skyderby.cesium_api_ready = true;
  Cesium.BingMapsApi.defaultKey = 'AiG804EvOUQOmDJV0kiOY8SSD0U1HirOAKucXLbAKTRy1XAVTaBDnO7FCty3X-n6';
  Skyderby.trigger('cesium_api:ready');
}

function on_cesium_api_error() {
  Skyderby.cesium_api_ready = false;
  Skyderby.trigger('cesium_api:failed');
}

function onYouTubeIframeAPIReady() {
  Skyderby.youtube_api_ready = true;
  Skyderby.trigger('youtube_api_ready');
}
