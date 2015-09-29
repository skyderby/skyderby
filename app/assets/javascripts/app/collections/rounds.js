Skyderby.collections.Rounds = Backbone.Collection.extend({

    model: Skyderby.models.Round,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/rounds';
    },
});
