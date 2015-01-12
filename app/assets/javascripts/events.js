"use strict";

var Competition = {},
    Units = {},
    Locale = '',
    Can_manage = false,
    Templates = {};

//////////////////////////////////////////
// COMMON FUNCTIONS

function init(){

    // Competitor object initialization

    var event_data = $('.event-data');
    
    $.extend(Competition, event_data.data('details'));
    $.extend(Units, event_data.data('units'));

    Locale = event_data.data('locale');

    if (event_data.data('can-manage') === true) {
        Can_manage = true;
    }

    init_templates();

    if (Can_manage) {
        render_edit_commands();
    }

    // Binding events

    $('#button-add-class').on('click', on_button_add_class_click);

    $('#submit-section-form').on('click', on_submit_section_form);

    $('#submit-event-form').on('click', on_submit_event_form);

    $('#button-add-competitor').on('click', on_button_add_competitor_click);

    $('#new-result-from-exist-track').on('click', on_link_result_exist_track_click);

    $('#new-result-from-new-track').on('click', on_link_result_new_track_click);

    $('#rm-button-delete-result').on('click', on_link_delete_result_click);

    $('#competitor-form-modal').on('shown.bs.modal', on_competitor_modal_shown);

    $('#section-form-modal').on('shown.bs.modal', on_section_modal_shown);

    $('#event-form-modal').on('shown.bs.modal', on_edit_event_modal_shown);

    $('#results-table')
        .on('click', '.edit-competitor', on_link_edit_competitor_click)
        .on('click', '.edit-section', on_link_edit_section_click)
        .on('click', '.delete-section', on_link_delete_section_click)
        .on('click', '.section-up', on_section_move)
        .on('click', '.section-down', on_section_move)
        .on('click', '.edit-result', on_edit_result_click);

    $('#submit-competitor-form').on('click', on_submit_competitor_form);

    $(document)
        .on('change', 'input:radio[name="event-status"]', on_change_event_status)
        .on('click', '.edit-event', on_link_edit_event_click);

    $('.competitor-profile-autocomplete').autocomplete({
        serviceUrl: '/api/users/autocomplete',
        preserveInput: true,
        onSelect: on_select_profile_autocomplete
    });

}

function init_templates() {

    Templates.section = _.template([
            '<tbody id="section_<%= id %>" data-id="<%= id %>" data-order="<%= order %>">',
                '<tr id="section_<%= id %>_head_row" class="head-row">',
                    '<td id="section_<%= id %>_name_cell" class="bg-info" colspan="<%= row_length %>">',
                        '<%= name %>',
                        '<% if (Can_manage) { %>',
                        '<a href="#" class="edit-section">',
                            '<i class="fa fa-pencil text-muted"></i>',
                        '</a>',
                        '<span class="pipe-edit-section text-muted">|</span>',
                        '<a href="#" class="section-up">',
                            '<i class="fa fa-chevron-up text-muted"></i>',
                        '</a>',
                        '<a href="#" class="section-down">',
                            '<i class="fa fa-chevron-down text-muted"></i>',
                        '</a>',
                        '<span class="pipe-edit-section text-muted">|</span>',
                        '<a href="#" class="delete-section">',
                            '<i class="fa fa-times-circle text-muted"></i>',
                        '</a>',
                        '<% } %>',
                    '</td>',
            '</tbody>'].join('\n'));

    Templates.event_edit_commands = _.template([
            '<div class="col-md-7">',
                '<button id="button-add-class" class="btn btn-default">',
                    '<i class="fa fa-plus"></i>',
                    'Класс',
                '</button>',
                '<button id="button-add-competitor" class="btn btn-default">',
                    '<i class="fa fa-plus"></i>',
                    'Участник',
                '</button>',
                '<button id="button-add-round" class="btn btn-default">',
                    '<i class="fa fa-plus"></i>',
                    'Раунд',
                '</button>',
            '</div>',
            '<div class="col-md-5">',
                '<div class="pull-right">',
                    '<div class="btn-group" data-toggle="buttons">',
                        '<label id="draft-label" class="btn btn-default">',
                            '<input id="draft" type="radio" name="event-status" value="draft" autocomplete="off">',
                            'Черновик',
                        '</label>',
                        '<label id="published-label" class="btn btn-default">',
                            '<input id="published" type="radio" name="event-status" value="published" autocomplete="off">',
                            'Опубликовано',
                        '</label>',
                        '<label id="finished-label" class="btn btn-default">',
                            '<input id="finished" type="radio" name="event-status" value="finished" autocomplete="off">',
                            'Завершено',
                        '</label>',
                    '</div>',
                '</div>',
            '</div>'].join('\n'));
    
    Templates.fa_fw = _.template([
            '<small>',
                '<i class="fa fa-fw"></i>',
            '</small>'].join('\n'));

    Templates.edit_event_name_and_range = _.template([
            '<small>',
                '<a href="#" class="edit-event">',
                    '<i class="fa fa-fw fa-pencil text-muted"></i>',
                '</a>',
            '</small>'].join('\n'));

}

function new_section(params) {
    return Templates.section(params);
}

function set_row_numbers() {
    $('#results-table').find('tbody').each(function() {
        var row_ind = 1;
        $(this).find("[data-role='row_number']").each(function () {
            $(this).text(row_ind);
            row_ind += 1;
        });
    });
}

function calc_totals() {

    $.each(Competition.competitors, function(index, competitor) {

        var competitor_row = $('#competitor_' + competitor.id);
        var total_points = 0;

        $.each(Competition.rounds, function(discipline, rounds) {
            var discipline_points = 0;
            $.each(rounds, function(index, value) {
                discipline_points += +competitor_row.find('td[data-round-id="' + value.id + '"][data-role="points"]').text();
            });
            if (discipline_points) {
                competitor_row.find('td[data-discipline="' + discipline + '"]').text(discipline_points / rounds.length); 
                total_points += discipline_points / rounds.length;
            }
        });

        if (total_points) {
            competitor_row.find('td[data-role="total-points"]').text(total_points);
        }
    });

}

function sort_table_by_points() {

    $('#results-table').find('tbody').each(function(index, value) {
        var rows = $(value).find('tr:not(.head-row)').get();
        
        rows.sort(function(a, b) {

            var A = +$(a).children('td[data-role="total-points"]').text();
            var B = +$(b).children('td[data-role="total-points"]').text();

            if(A > B) {
                return -1;
            }

            if(A < B) {
                return 1;
            }

            return 0;

        });
        
        $.each(rows, function(index, row) {
            $(value).append(row);
        });
    });
}

function after_results_changes() {
    calc_totals();
    sort_table_by_points();
}

function fail_ajax_request(data, status, jqXHR) {
    alert(data.responseText.substring(0, 500));
}

//////////////////////////////////////////
//

function validate_section_form() {
}

function validate_competitor_form(){
}

//////////////////////////////////////////
// REQUESTS TO SERVER

function send_create_section_request(name, event_id) {
    $.ajax({
        url: '/api/sections/',
        method: 'POST',
        dataType: 'json',
        data: {
            section: {
                name: name,
                event_id: event_id
            }
        }
    })
        .done(success_section_create)
        .fail(fail_ajax_request);
}

function send_update_section_request(id, name, event_id) {
    $.ajax({
        url: '/api/sections/' + id,
        method: 'PATCH',
        dataType: 'json',
        data: {
            section: {
                name: name,
                event_id: event_id
            }
        }
    })
        .done(success_section_update)
        .fail(fail_ajax_request);
}

function send_delete_section_request(id) {
    $.ajax({
        url: '/api/sections/' + id,
        method: 'DELETE',
        dataType: 'json',
        context: {id: id}
    })
        .done(success_section_delete)
        .fail(fail_ajax_request);
}

function send_section_move_up_request(prev_id, prev_order, cur_id, cur_order) {

    $.ajax({
        url: '/api/sections/reorder',
        method: 'POST',
        dataType: 'json',
        context: {prev_section_id: prev_id, cur_section_id: cur_id},
        data: {
            sections: [{
                section_id: prev_id,
                order: cur_order
            },
            {
                section_id: cur_id,
                order: prev_order
            }]
        }
    })
        .done(success_section_move_up)
        .fail(fail_ajax_request);
 
}

function send_section_move_down_request(next_id, next_order, cur_id, cur_order) {

    $.ajax({
        url: '/api/sections/reorder',
        method: 'POST',
        dataType: 'json',
        context: {next_section_id: next_id, cur_section_id: cur_id},
        data: {
            sections: [{
                section_id: next_id,
                order: cur_order
            },
            {
                section_id: cur_id,
                order: next_order
            }]
        }
    })
        .done(success_section_move_down)
        .fail(fail_ajax_request);


}

function send_competitor_update_request(id, wingsuit_id, section_id) {

    $.ajax({
        url: '/api/competitors/' + id,
        method: 'PATCH',
        dataType: 'json',
        data: {
            competitor: {
                wingsuit_id: wingsuit_id,
                section_id: section_id
            }
        }
    })
        .done(success_competitor_update)
        .fail(fail_ajax_request);
}

function send_event_update_request(id, params) {
    $.ajax({
        url: '/api/events/' + id,
        method: 'PATCH',
        dataType: 'json',
        data: {
            event: params
        }
    })
        .done(success_event_update)
        .fail(fail_ajax_request);
}

function send_event_track_create_request(params) {

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

}

function send_event_track_update_request(id, params) {

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

}

function send_event_track_delete_request(id) {

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

}

//////////////////////////////////////////
// EVENTS HANDLERS

function on_link_result_new_track_click() {

}

function on_link_result_exist_track_click(e) {
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

}

function on_link_delete_result_click(e) {
    e.preventDefault();

    var result_id = $('#result-fm-id').val();
    send_event_track_delete_request(result_id);
}

function on_edit_result_click(e) {

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
        $.each(value, function(index, value) {
            if (value.id == round_id) {
                round = value;
            }
        });
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

    $('#result-form-modal-title').text(competitor.name + ' - ' + capitaliseFirstLetter(round.discipline) + ': ' + round.name);
    $('#result-form-modal').modal('show');
}

function on_section_move(e) {

    e.preventDefault();

    var section = $(this).parents('tbody:first');

    if ($(this).is('.section-up')) {

        var prev_element = section.prev();

        if (!prev_element.is('thead')) {

            send_section_move_up_request(prev_element.data('id'), 
                    prev_element.data('order'), 
                    section.data('id'), 
                    section.data('order'));      

        }

    } else {

        var next_element = section.next();

        if (!next_element.is('#without_section')) {

            send_section_move_down_request(
                    next_element.data('id'),
                    next_element.data('order'),
                    section.data('id'),
                    section.data('order'));
            
        }
    }
}

function on_button_add_class_click() {
    $('#section-form-modal-title').text('Класс: Добавление');
    $('#section-form-modal').modal('show');
}

function on_submit_section_form(e) {

    var section_id = $('#section-id').val();
    var section_name = $('#section-name').val();

    validate_section_form();

    if (section_id) {
        send_update_section_request(section_id, section_name, Competition.id);
    } else {
       send_create_section_request(section_name, Competition.id);
    }

    e.preventDefault();
}

function on_submit_competitor_form() {

    validate_competitor_form();

    send_competitor_update_request(
        $('#competitor-id').val(),
        $('#competitor-wingsuit-id').val(),
        $('#competitor-section').val()
    );
}

function on_button_add_competitor_click() {
    $('#competitor-form-modal-title').text('Участник: Добавление');
    $('#competitor-form-modal').modal('show');
}

function on_link_edit_competitor_click(e) {

    e.preventDefault();

    $('#competitor-form-modal-title').text('Участник: Редактирование');
    var row = $(this).closest('tr');

    var competitor = $.grep(Competition.competitors, function(e) {
        return e.id == row.attr('id').replace('competitor_', '');
    })[0];

    $('#competitor-id').val(competitor.id);

    $('#competitor-last-name').val(competitor.last_name);
    $('#competitor-first-name').val(competitor.first_name);
    $('#competitor-profile-id').val(competitor.profile_id);

    $('#competitor-wingsuit').val(competitor.wingsuit);
    $('#competitor-wingsuit-id').val(competitor.wingsuit_id);

    $('#competitor-section').val(competitor.section_id);

    $('#competitor-form-modal').modal('show');
}

function on_link_edit_section_click(e) {

    e.preventDefault();

    section_tbody = $(this).closest('tbody');
    section = $.grep(Competition.sections, function(e) {
        return e.id == section_tbody.attr('id').replace('section_', "");
    })[0];

    $('#section-form-modal-title').text('Класс: Редактирование');
    $('#section-id').val(section.id);
    $('#section-name').val(section.name);

    $('#section-form-modal').modal('show');
}

function on_link_delete_section_click(e) {

    e.preventDefault();

    var section_tbody = $(this).closest('tbody');
    var rows_count = section_tbody.children().length;

    if (rows_count > 1) {
        alert('Перед удалением класса необходимо переместить всех участников из него в другие классы');
    } else {
        var section_id = section_tbody.attr('id').replace('section_', "");
        send_delete_section_request(section_id);
    }
}

function on_competitor_modal_shown() {

    if (!$('#competitor-id').val()) {
        $('#competitor-last-name').focus();
    }

    var s = $('#competitor-section');
    s.find('option').remove();

    $.each(Competition.sections, function(index, value) {
        $('<option />', {value: value.id, text: value.name}).appendTo(s);
    });

}

function on_section_modal_shown() {
    $('#section-name').focus();
}

function on_select_profile_autocomplete(suggestion, elem) {

    id_field = $(elem).data('idfield');
    name_field = $(elem).data('firstnamefield');

    $(elem).val(suggestion.last_name);
    $(name_field).val(suggestion.first_name);
    $(id_field).val(suggestion.profile_id);

    $('#competitor-wingsuit').focus();
}

function on_change_event_status() {
    send_event_update_request(Competition.id, {status: $(this).val()});
}

function on_link_edit_event_click(e) {

    e.preventDefault();

    $('#event-form-modal-title').text('Событие: редактирование');
    $('#event-name').val(Competition.name);
    $('#range-from').val(Competition.range_from);
    $('#range-to').val(Competition.range_to);

    $('#event-form-modal').modal('show');

}

function on_edit_event_modal_shown() {
    $('#event-name').focus();
}

function on_submit_event_form() {
    send_event_update_request(Competition.id, {
        name: $('#event-name').val(),
        range_from: $('#range-from').val(),
        range_to: $('#range-to').val()
    });
}
//////////////////////////////////////////////////////
// AJAX CALLBACKS: Event

function success_event_update(data, status, jqXHR) {
    
    Competition.name = data.name;
    Competition.range_from = data.range_from;
    Competition.range_to = data.range_to;

    Competition.status = data.status;
    
    $('#title-competition-name').text(Competition.name);
    $('#title-competition-range').text('Соревновательный диапазон: ' + Competition.range_from + ' - ' + Competition.range_to + ' м');

}

//////////////////////////////////////////////////////
// AJAX CALLBACKS: Competitors

function success_competitor_create(data, status, jqXHR) {
    alert('fail');
}

function success_competitor_update(data, status, jqXHR) {

    finded_competitors = $.grep(Competition.competitors, function (e) {
        return e.id == data.id;
    });

    if (finded_competitors.length)
        competitor = finded_competitors[0];
    competitor_row = $('#competitor_' + competitor.id);

    if (competitor.name != data.name || competitor.wingsuit != data.wingsuit) {
        competitor_row.find("[data-role='competitor_name']")
            .text(data.name + ' / ' + data.wingsuit)
            .append($('<a>').addClass('edit-competitor').attr('href', '#')
                .append($('<i>').addClass('fa fa-pencil text-muted')))
            .append($('<a>').addClass('delete-competitor').attr('href', '#')
                .append($('<i>').addClass('fa fa-times-circle text-muted')));
    }

    if (competitor.section_id != data.section_id) {
        (data.section_id ? $('#section_' + data.section_id) : $('#without_section'))
            .append(competitor_row
                .remove()
                .clone());
    }

    $.extend(competitor, data);

    set_row_numbers();
}

//////////////////////////////////////////////////////
// AJAX CALLBACKS: Sections

function success_section_create(data, status, jqXHR) {
    section = {
        id: '',
        name: '',
        order: ''
    };

    $.extend(section, data);

    $('#results-table').append(new_section(section.id, section.name, section.order));
}

function success_section_update(data, status, jqXHR) {

    var finded_sections = $.grep(Competition.sections, function (e) {
        return e.id == data.id;
    });

    if (finded_sections.length) {
        var section = finded_sections[0];
        var section_row = $('#section_' + section.id + '_head_row');

        if (section.name != data.name) {
            section_row.find('td').eq(0)
                .text(data.name)
                .append($('<a>').addClass('edit-section').attr('href', '#')
                    .append($('<i>').addClass('fa fa-pencil text-muted')))
                .append($('<a>').addClass('delete-section').attr('href', '#')
                    .append($('<i>').addClass('fa fa-times-circle text-muted')));
        }

        $.extend(section, data);
    }
}

function success_section_delete(data, status, jqXHR) {

    var section = $.grep(Competition.sections, function (e) {
        return e.id == this.id;
    })[0];
    var section_index = $.inArray(section, Competition.sections);

    $('#section_' + this.id).remove();
    Competition.sections.splice(section_index, 1);

}

function success_section_move_up(data, status, jqXHR) {

    var section = $('#section_' + this.cur_section_id);
    var prev_element = $('#section_' + this.prev_section_id);
    var tmp = section.data('order');

    section.insertBefore(prev_element);

    section.attr('data-order', prev_element.attr('data-order'));
    prev_element.attr('data-order', tmp);
}

function success_section_move_down(data, status, jqXHR) {

    var section = $('#section_' + this.cur_section_id);
    var next_element = $('#section_' + this.next_section_id);
    var tmp = section.data('order');

    section.insertAfter(next_element);

    section.attr('data-order', next_element.attr('data-order'));
    next_element.attr('data-order', tmp);
}

//////////////////////////////////////////////////////
// AJAX CALLBACKS: Results

function success_event_track_update() {
    
}

function success_event_track_create() {

}

function success_event_track_delete() {

    var result = $.grep(Competition.tracks, function (e) {
        return e.id == this.id;
    })[0];
    var result_index = $.inArray(result, Competition.tracks);
    
    Competition.tracks.splice(result_index, 1);

    $('td[data-result-id="' + this.id + '"]').text('');

    after_results_changes();
}

//////////////////////////////////////////////////////
// results table

function render_table() {

    // Header
    var table = $('#results-table');

    table.append($('<thead>')
            .append($('<tr>').attr('id', 'disciplines-row'))
            .append($('<tr>').attr('id', 'rounds-row'))
            .append($('<tr>').attr('id', 'units-row'))
            .append($('<tr>').addClass('template-row'))
    );

    var discipline_row = $('#disciplines-row'),
        rounds_row = $('#rounds-row'),
        units_row = $('#units-row'),
        template_row = table.find('.template-row');

    window.row_length = 3;

    discipline_row.append($('<td>').text('№').attr('rowspan', 3));
    discipline_row.append($('<td>').text('Competitor').attr('rowspan', 3));

    template_row.append($('<td>').attr('data-role', 'row_number'));
    template_row.append($('<td>').attr('data-role', 'competitor_name'));

    $.each(Competition.rounds, function (key, value) {
        window.row_length += value.length * 2 + 1;

        discipline_row.append($('<td>')
                .text(capitaliseFirstLetter(key))
                .attr('colspan', value.length * 2 + 1)
        );

        $.each(value, function (index, value) {
            rounds_row.append($('<td>')
                    .text(value.name)
                    .attr('data-round-id', value.id)
                    .attr('colspan', 2)
            );

            units_row.append($('<td>').text(Units[key]));
            units_row.append($('<td>').text('%'));

            var result_cell = $('<td>')
                    .attr('data-round-id', value.id)
                    .attr('data-role', 'result');

            if (Can_manage) {
                result_cell.addClass('edit-result');
            }

            template_row.append(result_cell);
            template_row.append($('<td>')
                    .attr('data-round-id', value.id)
                    .attr('data-role', 'points')
            );

        });

        rounds_row.append($('<td>').text('%').attr('rowspan', 2));

        template_row.append($('<td>')
                .attr('data-discipline', key)
                .attr('data-role', 'points')
        );
    });

    discipline_row.append($('<td>').text('Итого').attr('rowspan', 3));

    template_row.append($('<td>').attr('data-role', 'total-points'));

    //Rows: sections
    $.each(Competition.sections, function (index, value) {
        table.append(new_section({id: value.id, name: value.name, order: value.order}));
    });

    table.append($('<tbody>').attr('id', 'without_section'));

    // Rows: competitors
    $.each(Competition.competitors, function(index, value) {
        new_row = table.find('tr.template-row').clone();
        new_row.removeClass('template-row');
        new_row.attr('id', 'competitor_' + value.id);
        
        competitor_name_cell = new_row.find("[data-role='competitor_name']");
        competitor_name_cell.text(value.name + ' / ' + value.wingsuit);
        if (Can_manage) {
            competitor_name_cell.append($('<a>').addClass('edit-competitor').attr('href', '#')
                .append($('<i>').addClass('fa fa-pencil text-muted')))
            .append($('<a>').addClass('delete-competitor').attr('href', '#')
                .append($('<i>').addClass('fa fa-times-circle text-muted')));
        }

        var el_id = value.section_id ? ('#section_' + value.section_id) : ('#without_section');
        $(el_id).append(new_row);
    });

    // Results
    var max_results = _.chain(Competition.tracks)
        .groupBy("round_id")
        .map(function(value, key) {
            return {
                round_id: 'round_' + key,
                result: _.max(_.pluck(value, "result"))
            };
        })
        .groupBy("round_id")
        .value();

    $.each(Competition.tracks, function(index, value) {
        var result_cell = $('#competitor_' + value.competitor_id + ' td[data-round-id="' + value.round_id + '"][data-role="result"]'),
            points_cell = $('#competitor_' + value.competitor_id + ' td[data-round-id="' + value.round_id + '"][data-role="points"]'),
            max_val = max_results['round_' + value.round_id][0].result,
            points = Math.round(value.result / max_val * 1000) / 10;

        result_cell.attr('data-url', '/' + Locale + '/tracks/' + value.track_id + '?f=' + Competition.range_from + '&t=' + Competition.range_to);
        result_cell.attr('data-track-id', value.track_id);
        result_cell.attr('data-result-id', value.id);

        if (!Can_manage) {
            result_cell.addClass('clickableRow');
        }
        result_cell.text(value.result);
        points_cell.text(points);
    });

    calc_totals();

    sort_table_by_points();

    set_row_numbers();
}

function render_edit_commands() {

    var element = $('#event-edit-commands');
    element.append(Templates.event_edit_commands());
    element.addClass('top-buffer');

    $('#' + Competition.status + '-label').addClass('active');

    $('#title-competition-name')
        .before(Templates.fa_fw())
        .after(Templates.edit_event_name_and_range());
}

////////////////////////////////////////////
//

$(document).on('ready page:load', function() {

    if ($('.event-data').length) {
        
        init();
        render_table();
    }

});
