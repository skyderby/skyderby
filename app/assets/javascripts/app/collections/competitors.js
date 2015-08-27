Skyderby.collections.Competitors = Backbone.Collection.extend({

    model: Skyderby.models.Competitor,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/competitors';
    },
});
