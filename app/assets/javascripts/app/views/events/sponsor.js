Skyderby.views.EventSponsor = Backbone.View.extend({

    template: JST['app/templates/sponsor'],

    tagName: 'div',

    render: function() {
        this.$el.append(this.template({sponsor: this.model}));
        return this;
    }

});
