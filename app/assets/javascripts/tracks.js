$(document).on('ready page:load', function() {
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

    } else if ($('.track-edit-data').length) {

        var track_data = $('.track-edit-data');

        track = new Skyderby.models.Track();
        track.set(track_data.data('track'));

        view = new Skyderby.views.TrackEditView({
            model: track,
            el: '.track-edit-data',
            max_rel_time: track_data.data('max-rel-time')
        });
        view.render();
    }
});
