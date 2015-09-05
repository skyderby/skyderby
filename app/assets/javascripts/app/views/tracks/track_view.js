Skyderby.views.TrackView = Backbone.View.extend({

    template: JST['app/templates/track_show'],

    view_type: 'separate_charts',
    units: 'metric',

    events: {
        'click #toggle_single'  : 'on_toggle_single',
        'click #toggle_multi'   : 'on_toggle_multi',
        'click #toggle_metric'  : 'on_toggle_metric',
        'click #toggle_imperial': 'on_toggle_imperial',
        'click #rm-delete'      : 'on_click_delete_track'
    },

    initialize: function(opts) {
        if (_.has(opts, 'track_id')) this.track_id = opts.track_id;

        if (_.has(opts, 'parent_view')) {
            this.listenTo(opts.parent_view, 'modal:shown', this.on_modal_shown);
            this.listenTo(opts.parent_view, 'modal:hidden', this.on_modal_hidden);
        }

        if ($.cookie('view_type') === 'single') this.view_type = 'single_chart';
        if ($.cookie('units') === 'imperial') this.view_type = 'imperial';
    },

    render: function() {
        this.$el.html(this.template());

        if (_.has(this, 'model')) {
            this.hide_spinner();
        } else {
            this.model = new Skyderby.models.Track({id: this.track_id});
            this.listenToOnce(this.model, 'sync', this.hide_spinner);

            this.model.fetch();
        }

        this.on_change_units();
        this.on_change_view_type();

        this.charts_view = new Skyderby.views.TrackCharts({
            el: '#track_charts',
            display_in_imperial_units: this.units === 'imperial',
            display_single_chart: this.view_type === 'single_chart'
        });

        return this;
    },

    hide_spinner: function() {
        this.$('.result-loading-spinner').hide();
    },

    on_modal_shown: function() {
        this.charts_view.render();
    },

    on_modal_hidden: function() {
        this.remove();
    },

    on_toggle_single: function(e) {
        e.preventDefault();

        if (this.view_type === 'single_chart') return;

        this.view_type = 'single_chart';
        this.trigger('change:view_type');
    },

    on_toggle_multi: function(e) {
        e.preventDefault();
        
        if (this.view_type === 'separate_charts') return;

        this.view_type = 'separate_charts';
        this.trigger('change:view_type');
    },

    on_toggle_metric: function(e) {
        e.preventDefault();

        if (this.units === 'metric') return;

        this.units = 'metric';
        this.trigger('change:units');
    },

    on_toggle_imperial: function(e) {
        e.preventDefault();
        
        if (this.units === 'imperial') return;

        this.units = 'imperial';
        this.trigger('change:units');
    },

    on_change_units: function() {
        if (this.units === 'imperial') {
            this.$('#li_toggle_metric').remove('active');
            this.$('#li_toggle_imperial').addClass('active');
        } else {
            this.$('#li_toggle_metric').addClass('active');
            this.$('#li_toggle_imperial').removeClass('active');
        }
    },

    on_change_view_type: function() {
        if (this.view_type === 'separate_charts') {
            this.$('#li_toggle_single').remove('active');
            this.$('#li_toggle_multi').addClass('active');
        } else {
            this.$('#li_toggle_single').addClass('active');
            this.$('#li_toggle_multi').removeClass('active');
        }
    },
});
