Skyderby.views.ShowResultForm = Backbone.View.extend({

    template: JST['app/templates/show_result_form'],

    tagName: 'div',

    className: 'modal-dialog modal-lg',

    events: {
        'click #rm-delete': 'on_delete_link_click'
    },

    initialize: function(opts) {
        this.modalView = new Skyderby.views.ModalView();
        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;
    },

    render: function() {
        this.$el.html(this.template({
            url: this.trackUrl(),
            title: this.modalTitle(),
            can_manage: this.can_manage
        }));

        this.modalView.$el.html(this.$el);
        
        // Child view
        this.trackView = new Skyderby.views.TrackView({
            result: this.model,
            track_id: this.model.get('track_id'),
            el: '.container-fluid.track-view',
            parent_view: this
        });

        this.trackView.render();

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        return this;
    },

    open: function() {
        this.modalView.show();
        return this;
    },

    onModalShown: function() {
        this.trigger('modal:shown');
    },

    onModalHidden: function() {
        this.trigger('modal:hidden');
        this.remove();
    },

    trackUrl: function() {
        return this.model.get('url') + 
                '?f=' + window.Competition.get('range_from') + 
                '&t=' + window.Competition.get('range_to');
    },

    modalTitle: function() {
        var competitor = window.Competition.competitors.get(this.model.get('competitor_id'));
        var round = window.Competition.rounds.get(this.model.get('round_id'));

        return I18n.t('events.show.result') + ': ' +
            competitor.get('profile').name + ' ' + I18n.t('events.show.result_in') + ' ' +
            Skyderby.helpers.capitalize(round.get('discipline')) + ' - ' + round.get('name');
    },

    on_delete_link_click: function(e){
        e.preventDefault();
        this.model.destroy();
        this.modalView.hide();
    }
});
