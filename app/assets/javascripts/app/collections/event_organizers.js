Skyderby.collections.EventOrganizers = Backbone.Collection.extend({

    model: Skyderby.models.EventOrganizer,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/event_organizers';
    },

    comparator: function(item) {
        return [item.allow_delete, item.get('user_profile_name')];
    }
});
