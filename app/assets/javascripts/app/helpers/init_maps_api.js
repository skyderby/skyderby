Skyderby.helpers.init_maps_api = function() {
    if (window.maps_api_ready) {
      document.dispatchEvent(new Event('maps_api:ready'))
    } else {
        Skyderby.helpers.load_script(
            'https://maps.googleapis.com/maps/api/js?callback=on_maps_api_ready&key=' + MAPS_API_KEY,
            { on_error: on_maps_api_loading_error }
        );
    }
};
