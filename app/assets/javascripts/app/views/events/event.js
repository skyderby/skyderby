Skyderby.views.EventView = Backbone.View.extend({

    fa_fw_template: JST['app/templates/fa_fw'],
    edit_commands: JST['app/templates/edit_commands'],
    edit_event: JST['app/templates/edit_event'],

    events: {
        'click .button-add-class'     : 'add_class_click',
        'click .button-add-competitor': 'add_competitor_click',
        'click .add-distance-round'   : 'add_distance_round_click',
        'click .add-speed-round'      : 'add_speed_round_click',
        'click .add-time-round'       : 'add_time_round_click',
        'click .edit-event'           : 'edit_event_click',
        'click .add-sponsor'          : 'add_sponsor_click',
        'click .add-organizer'        : 'add_organizer_click'
    },

    initialize: function(opts) {
        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;

        this.scoreboard = new Skyderby.views.Scoreboard({
            model: this.model,
            can_manage: this.can_manage
        });

        this.listenTo(this.model.sponsors, 'add', this.add_sponsor);
        this.listenTo(this.model.organizers, 'add', this.add_organizer);

        this.listenTo(this.model, 'change', this.update_fields);

        this.render();
    },


    render: function() {
        this.update_fields();

        if (this.can_manage) {
            this.render_edit_controls();
        }

        this.scoreboard.render();

        this.organizers = $('#judges-list');
        this.sponsors = $('#sponsors');

        this.add_all_organizers();
        this.add_all_sponsors();
    },

    render_edit_controls: function () {
        $('#edit-event-commands').append(this.edit_event());

        $('#edit-table-commands')
            .append(this.edit_commands({rules: window.Competition.rules}))
            .addClass('top-buffer');
    },

    update_fields: function() {
        $('#title-competition-name').text(this.model.get('name'));
        $('#title-competition-range').text(
            I18n.t('events.show.comp_window') +
            ': ' + this.model.get('range_from') +
            ' - ' + this.model.get('range_to') +
            ' ' + I18n.t('units.m')
        );

        if (this.model.has('place')) {
            var place = this.model.get('place');
            var place_text = 
                I18n.t('activerecord.attributes.event.place') + ': ' + place.name;

            if (place.msl) {
                place_text += ' (MSL: ' + place.msl + ' ' + I18n.t('units.m') + ')';
            }

            $('#title-competition-place').show().text(place_text);
        } else {
            $('#title-competition-place').hide();
        }
    },

    add_organizer: function(organizer) {
        var view = new Skyderby.views.EventOrganizer({
            model: organizer,
            can_manage: this.can_manage
        });
        this.organizers.append(view.render().el);   
    },

    add_all_organizers: function() {
        this.model.organizers.each(this.add_organizer, this); 
    },

    add_sponsor: function(sponsor) {
        var view = new Skyderby.views.EventSponsor({
            model: sponsor,
            can_manage: this.can_manage
        });
        this.sponsors.append(view.render().el);   
    },

    add_all_sponsors: function() {
        this.model.sponsors.each(this.add_sponsor, this); 
    },

    add_class_click: function(e) {
        e.preventDefault();
        var new_section = new Skyderby.models.Section();
        var section_form = new Skyderby.views.SectionForm({model: new_section});
        section_form.render().open();
    },

    add_competitor_click: function(e) {
        e.preventDefault();
        var new_competitor = new Skyderby.models.Competitor();
        var competitor_form = new Skyderby.views.CompetitorForm({model: new_competitor});
        competitor_form.render().open();
    },

    add_distance_round_click: function(e) {
        e.preventDefault();
        window.Competition.rounds.create({discipline: 'distance'}, {wait: true});
    },
    
    add_speed_round_click: function(e) {
        e.preventDefault();
        window.Competition.rounds.create({discipline: 'speed'}, {wait: true});
    },

    add_time_round_click: function(e) {
        e.preventDefault();
        window.Competition.rounds.create({discipline: 'time'}, {wait: true});
    },

    edit_event_click: function(e) {
        e.preventDefault();
        var eventForm = new Skyderby.views.EventForm({model: this.model});
        eventForm.render().open();
    },

    add_sponsor_click: function(e) {
        e.preventDefault();
        var new_sponsor = new Skyderby.models.EventSponsor();
        var sponsor_form = new Skyderby.views.SponsorForm({model: new_sponsor});
        sponsor_form.render().open();
    },

    add_organizer_click: function(e) {
        e.preventDefault();
        var new_organizer = new Skyderby.models.EventOrganizer();
        var organizer_form = new Skyderby.views.EventOrganizerForm({model: new_organizer});
        organizer_form.render().open();
    }
});
