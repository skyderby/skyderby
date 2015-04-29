"use strict";

var Event = Event || {};

Event.Competition = function() {
    this.id = '';
    this.name = '';
    this.range_from = '';
    this.range_to = '';
    this.status = '';
    this.responsible = '';
    this.place = '';
    // Main data
    this.rounds= [];
    this.sections= [];
    this.competitors= [];
    this.tracks= [];
    this.organizers = [];
    this.max_results = {};
    // support data
    this.units= {};
    this.locale= '';
    this.can_manage= false;
    this.templates= {};
    // interface widgets
    this.scoreboard = new Event.Scoreboard;
    this.header = null;
    // form
    this.$form_modal = $('#event-form-modal');
    this.$modal_title = $('#event-form-modal-title');
    this.$form_organizers = $('.organizers-container')
    this.$form_place = $('#event-place')
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
}

Event.Competition.prototype = {
    init: function(settings) {
        var data = settings.data('details');
        this.id = data.id;
        this.name = data.name;
        this.range_from = data.range_from;
        this.range_to = data.range_to;
        this.status = data.status;
        this.responsible = {
            id: data.responsible.id,
            name: data.responsible.name
        };
        if (data.place) {
            this.place = {
                id: data.place.id,
                name: data.place.name
            }
        }

        _.each(data.sections, this.add_section.bind(this));
        _.each(data.competitors, this.add_competitor.bind(this));
        _.each(data.rounds, this.add_round.bind(this));
        _.each(data.tracks, this.add_track.bind(this));
        _.each(data.organizers, this.add_organizer.bind(this));

        // Competitor object initialization
        // $.extend(this, settings.data('details'));
        $.extend(this.units, settings.data('units'));

        this.locale = settings.data('locale');

        if (settings.data('can-manage') === true) {
            this.can_manage = true;
        }

        this.update_max_results();

        this.scoreboard.render();

        this.header = new Event.Header({
            name: this.name, 
            range_from: this.range_from,
            range_to: this.range_to
        });
    },

    add_section: function(section_data) {
        this.sections.push(new Event.Section(section_data));
    },

    add_competitor: function(competitor_data) {
        this.competitors.push(new Event.Competitor(competitor_data));
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

    update_max_results: function() {
        this.max_results = _.chain(this.tracks)
        .groupBy("round_id")
        .map(function(value, key) {
            return {
                round_id: 'round_' + key,
                result: _.max(_.pluck(value, "result"))
            };
        })
        .groupBy("round_id")
        .value();
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

        var modal_title;
        if (this.is_new) {
            modal_title = I18n.t('events.show.new');
        } else {
            modal_title = I18n.t('events.show.edit');
        }
        this.$modal_title.text(I18n.t('activerecord.models.event') + ': ' + modal_title);

        $('#event-name').val(this.name);
        $('#range-from').val(this.range_from);
        $('#range-to').val(this.range_to);

        $('input:radio[name=event-status][value=' + this.status + ']').prop('checked');
        $('#' + this.status + '-label').addClass('active');

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
                url: '/api/user_profiles',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term,
                        filter: {
                            only_registered: true
                        }
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.name,
                                id: item.id
                            }
                        })
                    };
                },
                cache: true
            }
        });

        this.$form_place.find('option').remove();

        if (this.place && this.place.id) {
            $('<option />', {value: this.place.id, text: this.place.name})
                .appendTo(this.$form_place);
        }       
 
        this.$form_place.select2({
            width: '100%',
            placeholder: I18n.t('events.show.place_placeholder'),
            dropdownParent: this.$form_modal,
            ajax: {
                url: '/api/places',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    var suits_data = _.chain(data)
                        .map(function(obj) {
                            return {
                                id: obj.id,
                                text: obj.name,
                                country: obj.country.name
                            }
                        })
                        .groupBy(function(obj) { 
                            return obj.country;
                        })
                        .map(function(obj, key) {
                            return {
                                text: key, 
                                children: obj
                            };
                        })
                        .sortBy(function(obj) {
                            return obj.text;
                        })
                        .value();
                    return {
                        results: suits_data
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

    on_form_submit: function() {
        this.update({
            name: $('#event-name').val(),
            range_from: $('#range-from').val(),
            range_to: $('#range-to').val(),
            status: $('input:radio[name="event-status"]').filter(':checked').val(),
            place_id: this.$form_place.val()
        });
    },

    update: function(params) {
        $.ajax({
            url: '/api/events/' + this.id,
            method: 'PATCH',
            dataType: 'json',
            data: {
                event: params
            }
        })
            .done(this.after_update.bind(this))
            .fail(fail_ajax_request);
    },

    after_update: function(data, status, jqXHR) {
        this.name = data.name;
        this.range_from = data.range_from;
        this.range_to = data.range_to;

        this.status = data.status;
        if (data.place) {
            this.place = {
                id: data.place.id,
                name: data.place.name
            }
        }
        
        $.extend(this.header, {
            name: this.name,
            range_from: this.range_from,
            range_to: this.range_to,
            status: this.status
        });

        this.header.render();
    },

    section_by_id: function(section_id) {
        return $.grep(this.sections, function(e) {
            return e.id == section_id;
        })[0];
    },

    on_section_create: function(section) {
        this.sections.push(section);
        this.scoreboard.create_section(section);  
    },

    on_section_update: function(section) {
        this.scoreboard.update_section(section);
    },

    on_section_delete: function(section) {
        this.scoreboard.delete_section(section);

        var section_index = $.inArray(section, this.sections);
        this.sections.splice(section_index, 1);
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
    },

    on_round_delete: function(round) {
        this.scoreboard.delete_round(round);

        var round_index = $.inArray(round, this.rounds);
        this.rounds.splice(round_index, 1);
    },

    result_by_id: function(result_id) {
        return $.grep(this.tracks, function(e) {
            return e.id == result_id;
        })[0];
    },

    on_result_save: function(result) {
        this.tracks.push(result);
        this.update_max_results();
        this.scoreboard.create_result(result);
    },

    on_result_delete: function(result) {
        this.scoreboard.delete_result(result);
        this.update_max_results();

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










    //////////////////////////////////////////
    // REQUESTS TO SERVER

    send_delete_round_request: function(id) {
        $.ajax({
            url: '/api/rounds/' + id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: id}
        })
            .done(success_round_delete)
            .fail(fail_ajax_request);
    },

    send_competitor_create_request: function(params) {
        $.ajax({
            url: '/api/competitors/',
            method: 'POST',
            dataType: 'json',
            data: {
                competitor: params
            }
        })
            .done(success_competitor_create)
            .fail(fail_ajax_request);
    },

    send_competitor_update_request: function(id, params) {
        $.ajax({
            url: '/api/competitors/' + id,
            method: 'PATCH',
            dataType: 'json',
            data: {
                competitor: params
            }
        })
            .done(success_competitor_update)
            .fail(fail_ajax_request);
    },

    send_delete_competitor_request: function(id) {
        $.ajax({
            url: '/api/competitors/' + id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: id}
        })
            .done(success_competitor_delete)
            .fail(fail_ajax_request);
    },

    

    send_event_track_create_request: function(params) {
        $.ajax({
            url: '/api/round_tracks/',
            method: 'POST',
            dataType: 'json',
            data: {
                round_track: params
            }
        })
            .done(success_event_track_create)
            .fail(fail_ajax_request);
    },

    send_event_track_update_request: function(id, params) {
        $.ajax({
            url: '/api/round_tracks/' + id,
            method: 'PATCH',
            dataType: 'json',
            data: {
                round_track: params
            }
        })
            .done(success_event_track_update)
            .fail(fail_ajax_request);
    },

    send_event_track_delete_request: function(id) {
        $.ajax({
            url: '/api/round_tracks/' + id,
            method: 'DELETE',
            dataType: 'json',
            context: {
                id: id
            }
        })
            .done(success_event_track_delete)
            .fail(fail_ajax_request);
    },

    //////////////////////////////////////////
    // EVENTS HANDLERS

    on_link_result_new_track_click: function(e) {},

    on_link_result_exist_track_click: function(e) {
        e.preventDefault();

        var result_id = $('#result-fm-id').val(),
            params = {
                competitor_id: $('#result-fm-competitor-id').val(),
                round_id: $('#result-fm-round-id').val(),
                track_id: $('#result_track_id').val()
            };

        if (result_id) {
            send_event_track_update_request(result_id, params);
        } else {
            send_event_track_create_request(params);
        }
    },

    on_link_delete_result_click: function(e) {
        e.preventDefault();

        var result_id = $('#result-fm-id').val();
        send_event_track_delete_request(result_id);
    },

    on_edit_result_click: function(e) {
        e.preventDefault();

        var row = $(this).closest('tr'),
            result_id = $(this).data('result-id'),
            track_id = $(this).data('track-id'),
            round_id = $(this).data('round-id');

        var competitor = $.grep(Competition.competitors, function(e) {
            return e.id == row.attr('id').replace('competitor_', '');
        })[0];

        var round;
        $.each(Competition.rounds, function(key, value) {
            if (value.id == round_id) {
                round = value;
            }
        });

        $('#result-fm-id').val(result_id);
        $('#result-fm-competitor-id').val(competitor.id);
        $('#result-fm-round-id').val(round_id);

        if (!track_id) {
            $('#rm-li-delete-result').addClass('disabled'); 
            $('#rm-li-delete-result').children('a').removeAttr('data-toggle');
        } else {
            $('#rm-li-delete-result').removeClass('disabled');
            $('#rm-li-delete-result').children('a').attr('data-toggle', 'tab');
        }

        $('#result-form-modal-title').text(competitor.profile.name + ' - ' + capitaliseFirstLetter(round.discipline) + ': ' + round.name);
        $('#result-form-modal').modal('show');
    },

    on_button_add_competitor_click: function() {
        $('#competitor-form-modal-title').text('Участник: Добавление');
        $('#competitor-form-modal').modal('show');
    },

    on_button_add_round_click: function() {
        $('#round-form-modal-title').text('Раунд: Добавление');
        $('#round-form-modal').modal('show');
    },

    on_round_modal_shown: function() {
        $('#round-name').focus();
    },

    on_edit_round_click: function(e) {
        e.preventDefault();
    },

    on_delete_round_click: function(e) {
        e.preventDefault();

        var round_id = $(this).closest('td').data('round-id');
        send_delete_round_request(round_id);
    },

    on_submit_competitor_form: function() {
        validate_competitor_form();

        var c_id = $('#competitor-id').val();
        var params = {
            event_id: Competition.id,
            profile_id: $('#competitor-profile-id').val(),
            profile_name: $('#competitor-profile-name').val(),
            wingsuit_id: $('#competitor-wingsuit-id').val(),
            section_id: $('#competitor-section').val()
        };

        if (c_id) {
            send_competitor_update_request(c_id, params);
        } else {
            send_competitor_create_request(params);
        }
    },

    on_link_edit_competitor_click: function(e) {

        e.preventDefault();

        $('#competitor-form-modal-title').text('Участник: Редактирование');
        var row = $(this).closest('tr');

        var competitor = $.grep(Competition.competitors, function(e) {
            return e.id == row.attr('id').replace('competitor_', '');
        })[0];

        $('#competitor-id').val(competitor.id);

        $('#competitor-name').val(competitor.profile.name);
        $('#competitor-profile-id').val(competitor.profile.id);

        $('#competitor-wingsuit').val(competitor.wingsuit.name);
        $('#competitor-wingsuit-id').val(competitor.wingsuit.id);

        $('#competitor-section').val(competitor.section.id);

        $('#competitor-form-modal').modal('show');
    },

    on_link_delete_competitor_click: function(e) {
        e.preventDefault(); 
        var competitor_id = $(this).closest('tr').attr('id').replace('competitor_', '');
        send_delete_competitor_request(competitor_id);
    },

    on_competitor_modal_shown: function(e) {
        if (!$('#competitor-id').val()) {
            $('#competitor-name').focus();
        }

        var s = $('#competitor-section');
        s.find('option').remove();

        $.each(Competition.sections, function(index, value) {
            $('<option />', {value: value.id, text: value.name}).appendTo(s);
        });
    },

    on_edit_event_modal_shown: function() {
        $('#event-name').focus();
    },

}

////////////////////////////////////////////
//

$(document).on('ready page:load', function() {
    if ($('.event-data').length) {
        window.Competition = new Event.Competition;
        window.Competition.init($('.event-data'));
    }
});
