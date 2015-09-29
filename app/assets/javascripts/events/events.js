var Event = Event || {};

Event.Competition = function() {
    'use strict';

    // support data
    this.units= {};
    this.can_manage= false;
    this.templates= {};
    // interface widgets
    this.header = null;
    this.footer = null;
    // form
    this.$form_modal = $('#event-form-modal');
    this.$modal_title = $('#event-form-modal-title');
    this.$form_organizers = $('.organizers-container');
    this.$form_place = $('#event-place');
    ///////////////////////////////////////////
    // Templates
    this.organizer = _.template([
        '<div class="organizer" data-id="<%= id %>">',
            '<span class="organizer-name"><%= user_profile_name %></span>',
            '<% if (id) { %>',
                '<a href="#" class="delete-organizer">',
                    '<i class="fa fa-times-circle"></i>',
                '</a>',
            '<% } %>',
        '</div>'
    ].join('\n'));

   this.$form_new_organizer = $('.organizer-profile');
};

Event.Competition.prototype = {
    init: function(settings) {
        var data = settings.data('details');

        if (settings.data('can-manage') === true) {
            this.can_manage = true;
        }

        _.each(data.organizers, this.add_organizer.bind(this));
        
        this.units = {
            distance: I18n.t('units.m'),
            speed: I18n.t('units.kmh'),
            time: I18n.t('units.t_unit')
        };

        this.scoreboard.render();

        this.header = new Event.Header({
            name: this.name, 
            range_from: this.range_from,
            range_to: this.range_to,
            status: this.status,
            place: this.place
        });
        this.header.render();

        this.footer = new Event.Footer({
            responsible: this.responsible,
            organizers: this.organizers,
            sponsors: this.sponsors
        });
        this.footer.render();

    },

    add_sponsor: function(sponsor_data) {
        this.sponsors.add(new Skyderby.models.EventSponsor(sponsor_data));
    },

    add_round: function(round_data) {
        this.rounds.push(new Event.Round(round_data));
    },

    add_track: function(track_data) {
        this.tracks.push(new Event.EventTrack(track_data));
    },

    add_organizer: function(event_organizer) {
        this.organizers.push(new Event.Organizer(event_organizer));
    },

    bind_events: function() {
        $('#submit-event-form').on('click', Competition.on_submit_event_form);
        $('#submit-round-form').on('click', Competition.on_submit_round_form);

        $('#new-result-from-exist-track').on('click', Competition.on_link_result_exist_track_click);
        $('#new-result-from-new-track').on('click', Competition.on_link_result_new_track_click);
        $('#rm-button-delete-result').on('click', Competition.on_link_delete_result_click);

        $('#event-form-modal').on('shown.bs.modal', Competition.on_edit_event_modal_shown);
        $('#round-form-modal').on('shown.bs.modal', Competition.on_round_modal_shown);
    },

    open_form: function(e) {
        e.preventDefault();

        this.$form_organizers.find('.organizer').remove();
        this.add_organizer_to_form({
            id: '', 
            user_profile_name: this.responsible.name
        });

        _.each(this.organizers, this.add_organizer_to_form.bind(this));

        this.$form_new_organizer.select2({
            width: '100%',
            placeholder: I18n.t('events.show.organizers_placeholder'),
            dropdownParent: this.$form_modal,
            ajax: {
                url: '/user_profiles',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    term.only_registered = true;
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.name,
                                id: item.id
                            };
                        })
                    };
                },
                cache: true
            }
        });

        this.$form_modal
            .off('click', '.delete-organizer')
            .on('click', '.delete-organizer', this.on_click_delete_organizer);

        this.$form_new_organizer
            .off('change')
            .on('change', this.on_add_organizer);

        $('#submit-event-form')
            .off('click')
            .on('click', this.on_form_submit.bind(this));

        this.$form_modal.modal('show');
    },

    add_organizer_to_form: function(organizer_data) {
        this.$form_organizers.append(
            this.organizer({
                id: organizer_data.id, 
                user_profile_name: organizer_data.user_profile_name
            })
        );
    },

    on_click_delete_organizer: function(e) {
        e.preventDefault();

        var org_div = $(this).closest('div');
        var id = org_div.data('id');
        if (id) {
            window.Competition.organizer_by_id(id).destroy();
        }
    },

    on_add_organizer: function() {
        new Event.Organizer({
            event_id: window.Competition.id,
            user_profile_id: $(this).val()
        }).save();
    },

    competitor_by_id: function(competitor_id) {
        return $.grep(this.competitors, function(e) {
            return e.id == competitor_id;
        })[0];
    },

    on_competitor_create: function(competitor) {
        this.competitors.push(competitor);
        this.scoreboard.create_competitor(competitor);
    },

    on_competitor_update: function(competitor) {
        this.scoreboard.update_competitor(competitor);
    },

    on_competitor_delete: function(competitor) {
        this.scoreboard.delete_competitor(competitor);
        
        var competitor_index = $.inArray(competitor, this.competitors);
        this.competitors.splice(competitor_index, 1);
    },
    
    round_by_id: function(round_id) {
        return $.grep(this.rounds, function(e) {
            return e.id == round_id;
        })[0];
    },

    on_round_create: function(round) {
        this.rounds.push(round);
        this.scoreboard.create_round(round);
        this.scoreboard.after_rounds_changed();
    },

    on_round_delete: function(round) {
        this.scoreboard.delete_round(round);

        var round_index = $.inArray(round, this.rounds);
        this.rounds.splice(round_index, 1);
        this.scoreboard.after_rounds_changed();
    },

    result_by_id: function(result_id) {
        return $.grep(this.tracks, function(e) {
            return e.id == result_id;
        })[0];
    },

    on_result_save: function(result) {
        this.tracks.push(result);
        this.scoreboard.create_result(result);
    },

    on_result_delete: function(result) {
        this.scoreboard.delete_result(result);

        var result_index = $.inArray(result, this.tracks);
        this.tracks.splice(result_index, 1);
    },

    organizer_by_id: function(org_id) {
        return $.grep(this.organizers, function(e) {
            return e.id == org_id;
        })[0];
    },

    on_organizer_save: function(organizer) {
        this.organizers.push(organizer);
        this.add_organizer_to_form(organizer);
    },

    on_organizer_delete: function(organizer) {
        this.$form_organizers.find('div[data-id=' + organizer.id + ']').remove();

        var org_index = $.inArray(organizer, this.organizers);
        this.organizers.splice(org_index, 1);
    },
};

////////////////////////////////////////////
//

$(document).on('ready page:load', function() {
    var eventData = $('.event-data');
    if (eventData.length) {
        window.Competition = new Skyderby.models.Event(eventData.data('details'));
        window.CompetitionView = new Skyderby.views.EventView({
            model: window.Competition,
            can_manage: eventData.data('can-manage'),
            el: '#event' 
        });
        // window.Competition = new Event.Competition();
        // window.Competition.init($('.event-data'));
    }
});
