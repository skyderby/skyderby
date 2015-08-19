Skyderby.views.ModalView = Backbone.View.extend({
    el: '#modal',

    events: {
        'shown.bs.modal' : 'onModalShown',
        'hidden.bs.modal': 'onModalHidden'
    },

    show: function() {
        this.$el.modal('show');
    },

    hide: function() {
        this.$el.modal('hide');
    },

    onModalShown: function() {
        this.trigger('modal:shown');
    },

    onModalHidden: function() {
        this.trigger('modal:hidden');
    }
});
