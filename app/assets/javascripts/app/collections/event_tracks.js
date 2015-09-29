Skyderby.collections.EventTracks = Backbone.Collection.extend({

    model: Skyderby.models.EventTrack,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/event_tracks';
    },
});
