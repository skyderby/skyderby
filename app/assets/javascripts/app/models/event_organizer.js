Skyderby.models.EventOrganizer = Backbone.Model.extend({

    allow_delete: true,

    initialize: function(opts) {
        if (_.has(opts, 'allow_delete')) this.allow_delete = opts.allow_delete;
    }

});
