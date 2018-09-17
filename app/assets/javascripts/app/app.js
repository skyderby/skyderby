//= require_self
//= require_tree ./models
//= require_tree ./helpers
//= require_tree ./views

window.Skyderby = {
  collections: {},
  models: {},
  helpers: {},
  views: {},

  cesium_api_ready: false,
};

_.extend(Skyderby, Backbone.Events);

function on_cesium_api_ready() {
  Skyderby.cesium_api_ready = true;
  Cesium.BingMapsApi.defaultKey = 'AiG804EvOUQOmDJV0kiOY8SSD0U1HirOAKucXLbAKTRy1XAVTaBDnO7FCty3X-n6';
  Skyderby.trigger('cesium_api:ready');
}

function on_cesium_api_error() {
  Skyderby.cesium_api_ready = false;
  Skyderby.trigger('cesium_api:failed');
}
