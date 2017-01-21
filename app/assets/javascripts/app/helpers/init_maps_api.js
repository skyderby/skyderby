Skyderby.helpers.init_maps_api = function() {
    if (window.Skyderby.maps_api_ready) {
        window.Skyderby.trigger('maps_api:ready');
    } else {
        Skyderby.helpers.load_script(
            'https://maps.googleapis.com/maps/api/js?callback=on_maps_api_ready&key=' + MAPS_API_KEY,
            { on_error: on_maps_api_loading_error }
        );
    }
};
