Skyderby.models.Track = Backbone.Model.extend({
    urlRoot: '/tracks',

    defaults: {
        id: null,
        points: []
    }
});
