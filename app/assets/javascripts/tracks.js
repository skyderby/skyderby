$(document).on('ready turbolinks:load', function() {
    var track, view;

    if ($('.track-map-data').length) {

        var track_map = new Skyderby.models.TrackMap({
          id: $('.track-map-data').data('id')
        });

        view = new Skyderby.views.TrackMapView({
            model: track_map,
            el: '.track-map-data'
        });
        view.render();

    }
});
