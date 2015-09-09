$(document).on('ready page:load', function() {
    if ($('.track-map-data').length) {
        var track = new Skyderby.models.Track();
        track.set('points', $('.track-map-data').data('points'));

        var view = new Skyderby.views.TrackMapView({
            model: track,
            el: '.track-map-data'
        });
        view.render();
    }
});
