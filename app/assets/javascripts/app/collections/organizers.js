Skyderby.collections.Organizers = Backbone.Collection.extend({

    model: Skyderby.models.Organizer,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/event_organizers';
    },
});
