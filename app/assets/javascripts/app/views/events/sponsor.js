Skyderby.views.EventSponsor = Backbone.View.extend({

    template: JST['app/templates/sponsor'],

    tagName: 'div',
    className: 'col-md-3 col-sm-3 text-center',

    render: function() {
        this.$el.append(this.template({sponsor: this.model}));
        this.$('img').tooltip();
        return this;
    }

});
