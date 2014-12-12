var row_length;

function on_event_document_ready() {
    render_table();

    $('#button-add-class').on('click', function() {
        $('#section-form-modal-title').text('Класс: Добавление');
        $('#section-form-modal').modal('show');
    });

    $('#submit-section-form').on('click', function(e) {

        // validate form

        // if action new

        $.ajax({
            url: '/sections/new',
            data: {name: $('#section-name').val(), event_id: event_id}
        })
            .done(function(msg) {
                $('#results-table').find('tbody:last').after($('<tbody>').attr('id', 'section_' + msg.id)
                        .append($('<td>')
                            .attr('colspan', row_length)
                            .text('Новый класс')
                            .addClass('bg-info')
                    )
                );
            });

        // if action update

        e.preventDefault();
    });

    $('#button-add-competitor').on('click', function() {
        $('#competitor-form-modal-title').text('Участник: Добавление');
        $('#competitor-form-modal').modal('show');
    });

    $('#competitor-form-modal').on('shown.bs.modal', function() {
        if (!$('#competitor-id').val()) {
            $('#competitor-last-name').focus();
        }

        var s = $('#competitor-section');
        s.find('option').remove();

        $.each(sections, function(index, value) {
            $('<option />', {value: value.id, text: value.name}).appendTo(s);
        });
    });

    $('#results-table').on('click', '.edit-competitor', function(e) {

        e.preventDefault();

        $('#competitor-form-modal-title').text('Участник: Редактирование');
        row = $(this).closest('tr');

        var competitor = $.grep(competitors, function(e){ return e.id == row.attr('id').replace('competitor_', ''); })[0];

        $('#competitor-id').val(competitor.id);

        $('#competitor-last-name').val(competitor.last_name);
        $('#competitor-first-name').val(competitor.first_name);
        $('#competitor-profile-id').val(competitor.profile_id);


        $('#competitor-wingsuit').val(competitor.wingsuit);
        $('#competitor-wingsuit-id').val(competitor.wingsuit_id);

        $('#competitor-section').val(competitor.section_id);

        $('#competitor-form-modal').modal('show');
    });

    $('#submit-competitor-form').on('click', function(e) {
        $.ajax({
            url: '/competitors/update',
            method: 'POST',
            dataType: 'json',
            data: {
                id: $('#competitor-id').val(),
                competitor: {
                    wingsuit_id: $('#competitor-wingsuit-id').val(),
                    section_id: $('#competitor-section').val()
                }
            }

        })
            .done(success_competitor_update)
            .fail(fail_competitor_update);
    });

    $('.competitor-profile-autocomplete').autocomplete({
        serviceUrl: '/users/autocomplete',
        preserveInput: true,
        onSelect: function (suggestion) {

            var id_field = $(this).data('idfield');
            var name_field = $(this).data('firstnamefield');

            $(this).val(suggestion.last_name);
            $(name_field).val(suggestion.first_name);
            $(id_field).val(suggestion.profile_id);

            $('#competitor-wingsuit').focus();
        }
    });
}

//////////////////////////////////////////////////////
// ajax: Competitors

function success_competitor_update(data, status, jqXHR) {
    var finded_competitors = $.grep(competitors, function(e){ return e.id == data.id; });

    if (finded_competitors.length > 0) {
        var competitor = finded_competitors[0];
        var competitor_row = $('#competitor_' + competitor.id);

        if (competitor.name != data.name || competitor.wingsuit != data.wingsuit) {
            competitor_row.find("[data-role='competitor_name']")
                .text(data.name + ' / ' + data.wingsuit)
                .append($('<a>').addClass('edit-competitor').attr('href', '#')
                    .append($('<i>').addClass('fa fa-pencil text-muted')))
                .append($('<a>').addClass('delete-competitor').attr('href', '#')
                    .append($('<i>').addClass('fa fa-times-circle text-muted')));
        }

        if (competitor.section_id != data.section_id) {
            ( (data.section_id) ? $('#section_' + data.section_id) : $('#without_section') ).append( competitor_row.remove().clone() );
        }

        $.extend(competitor, data);
    }
}

function fail_competitor_update(data, status, jqXHR) {
    alert('fail')
}


//////////////////////////////////////////////////////
// ajax: Sections


//////////////////////////////////////////////////////
// ajax: Rounds


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

    var discipline_row = $('#disciplines-row');
    var rounds_row = $('#rounds-row');
    var units_row = $('#units-row');

    var template_row = table.find('.template-row');
    row_length = 3;

    discipline_row.append($('<td>').text('№').attr('rowspan', 3));
    discipline_row.append($('<td>').text('Competitor').attr('rowspan', 3));

    template_row.append($('<td>').attr('data-role', 'row_number'));
    template_row.append($('<td>').attr('data-role', 'competitor_name'));

    $.each(rounds_by_discipline, function(key, value) {
        row_length += value.length * 2 + 1;

        discipline_row.append($('<td>')
            .text(capitaliseFirstLetter(key))
            .attr('colspan', value.length * 2 + 1)
        );
        $.each(value, function(index, value) {
            rounds_row.append($('<td>')
                .text(value.name)
                .attr('data-round-id', value.id)
                .attr('colspan', 2)
            );
            units_row.append($('<td>').text(units_for_discipline[key]));
            units_row.append($('<td>').text('%'));

            template_row.append($('<td>')
                .attr('data-round-id', value.id)
                .attr('data-role', 'result')
            );
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

    template_row.append($('<td>')
            .attr('data-role', 'total-points')
    );


    // Rows: sections
    $.each(sections, function(index, value) {
        table.append($('<tbody>')
            .attr('id','section_' + value.id)
            .attr('data-id', value.id)
            .append($('<tr>')
                .attr('id', 'section_' + value.id + '_head_row')
                .append($('<td>')
                    .attr('id', 'section_' + value.id + '_name_cell')
                    .attr('colspan', row_length)
                    .text(value.name)
                    .addClass('bg-info')
                    .append($('<a>').addClass('edit-section').attr('href', '#')
                        .append($('<i>').addClass('fa fa-pencil text-muted')))
                    .append($('<a>').addClass('delete-section').attr('href', '#')
                        .append($('<i>').addClass('fa fa-times-circle text-muted')))
                )
            )
        );
    });

    table.append($('<tbody>').attr('id','without_section'));

    // Rows: competitors
    $.each(competitors, function(index, value) {
        var tbody_section;
        var new_row = table.find('tr.template-row').clone();
        new_row.removeClass('template-row');
        new_row.attr('id', 'competitor_' + value.id);
        new_row.find("[data-role='row_number']").text(index + 1);
        new_row.find("[data-role='competitor_name']")
            .text(value.name + ' / ' + value.wingsuit)
            .append($('<a>').addClass('edit-competitor').attr('href', '#')
                .append($('<i>').addClass('fa fa-pencil text-muted')))
            .append($('<a>').addClass('delete-competitor').attr('href', '#')
                .append($('<i>').addClass('fa fa-times-circle text-muted')));

        if (value.section_id) {
            tbody_section = $('#section_' + value.section_id);
        } else {
            tbody_section = $('#without_section');
        }

        tbody_section.append(new_row);

    });

}