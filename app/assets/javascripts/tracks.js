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

    } else if ($('.track-replay').length) {
        var track_video = new Skyderby.models.TrackVideo();
        var data_div = $('.track-replay');

        track_video.set('points',       data_div.data('points'));
        track_video.set('video_code',   data_div.data('video-code'));
        track_video.set('video_offset', data_div.data('video-offset'));
        track_video.set('track_offset', data_div.data('track-offset'));

        view = new Skyderby.views.TrackReplayView({
            model: track_video,
            el: '.track-replay'
        });
        view.render();

    } else if ($('.tracks-index').length) {
        view = new Skyderby.views.TrackIndexView({
            el: '.tracks-index'
        });
        view.render();
    }
});
