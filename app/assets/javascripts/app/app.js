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
  earth_api_ready: false,
  youtuby_api_ready: false
};

_.extend(window.Skyderby, Backbone.Events);

function on_maps_api_ready() {
  window.Skyderby.maps_api_ready = true;
  window.Skyderby.trigger('maps_api_ready');
}

function on_earth_api_ready() {
  window.Skyderby.earth_api_ready = true;
  window.Skyderby.trigger('earth_api_ready');
}

function onYouTubeIframeAPIReady() {
  window.Skyderby.youtube_api_ready = true;
  window.Skyderby.trigger('youtube_api_ready');
}
