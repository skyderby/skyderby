$(document).on('ready page:load', function() {
    var track, view;

    if ($('.track-map-data').length) {

        track = new Skyderby.models.Track();
        track.set('points', $('.track-map-data').data('points'));

        view = new Skyderby.views.TrackMapView({
            model: track,
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

    } else if ($('.tracks-index').length) {
        view = new Skyderby.views.TrackIndexView({
            el: '.tracks-index'
        });
        view.render();
    }
});
