Skyderby.views.Competitor = Backbone.View.extend({
    
    template:    JST['app/templates/competitor'],
    result_cell: JST['app/templates/result_cell'],

    tagName: 'tr',

    id: function() {
        return 'competitor_' + this.model.get('id');
    },

    className: 'competitor-row',

    events: {
       'click .edit-competitor'  : 'edit_competitor_click',
       'click .delete-competitor': 'delete_competitor_click',
    },

    initialize: function(opts) {
        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;

        this.listenTo(this.model, 'change', this.update_competitor);
        this.listenTo(this.model, 'destroy', this.destroy_competitor);
    },

    render: function() {
        this.$el.html(this.template(
            $.extend(this.model.toJSON(), {can_manage: this.can_manage})
        ));

        var rounds_by_discipline = window.Competition.rounds.groupBy('discipline');

        _.each(rounds_by_discipline, this.render_discipline.bind(this));

        if (window.Competition.rounds.length > 0) {
            this.render_total_points();
        }

        this.$('span[data-role="competitor-country"]').tooltip();
        return this;
    },

    render_discipline: function(rounds, discipline) {
        for (var round in rounds) {
            this.render_round(round);
        }       

        this.$el.append(
            $('<td>')
                .addClass('text-right')
                .attr('data-discipline', discipline)
                .attr('data-role', 'points')
        );
    },

    render_round: function(round) {
        this.$el.append(this.result_cell({
            id: round.id,
            role: 'result',
            can_manage: this.can_manage
        }));
        this.$el.append(this.result_cell({
            id: round.id,
            role: 'points',
            can_manage: this.can_manage
        }));
    },

    render_total_points: function() {
        this.$el.append(
            $('<td>').addClass('text-right').attr('data-role', 'total-points')
        );
    },

    edit_competitor_click: function(e) {
        e.preventDefault();
        
        var competitor_form = new Skyderby.views.CompetitorForm({model: this.model});
        competitor_form.render().open();
    },

    delete_competitor_click: function(e) {
        e.preventDefault();
        this.model.destroy();
    },

    update_competitor: function() {
        var profile = this.model.get('profile'),
            country = this.model.get('country');

        this.$('.competitor-profile-link')
            .text(profile.name)
            .attr('href', profile.url);

        this.$('span[data-role="competitor-suit"]').text(this.model.get('wingsuit').name);

        this.$('span[data-role="competitor-country"]')
            .text(country.code.toUpperCase())
            .attr('title', country.name);
    },

    destroy_competitor: function() {
        this.remove();
    }
});
