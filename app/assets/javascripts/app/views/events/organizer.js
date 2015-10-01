Skyderby.views.EventOrganizer = Backbone.View.extend({
    
    template: JST['app/templates/organizer'],

    tagName: 'li',

    events: {
        'click .delete-organizer' : 'delete_organizer_click'
    },

    initialize: function(opts) {
        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;

        this.listenTo(this.model, 'destroy', this.destroy_organizer);
    },

    render: function() {
        var template_attrs = $.extend(this.model.toJSON(), {
            can_manage: this.can_manage,
            allow_delete: this.model.allow_delete
        });

        this.$el.html(this.template(template_attrs));
        return this;
    },

    delete_organizer_click: function(e) {
        e.preventDefault();
        this.model.destroy({wait: true});
    },

    destroy_organizer: function() {
        this.remove();
    }
});
