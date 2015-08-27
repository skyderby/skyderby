Skyderby.collections.EventSponsors = Backbone.Collection.extend({

    model: Skyderby.models.EventSponsor,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/event_sponsors';
    },
});
