var row_length;

function on_event_document_ready() {
    render_table();

    $('#button-add-class').on('click', function() {
        $('#results-table').find('tr:last').after($('<tr>')
                .append($('<td>')
                    .attr('colspan', row_length)
                    .text('Новый класс')
                    .addClass('bg-info')
            )
        );
    });

    $('#button-add-competitor').on('click', function() {
        $('#competitor-form-modal-title').text('Участник: Добавление');
        $('#competitor-form-modal').modal('show');
    });

    $('#competitor-form-modal').on('shown.bs.modal', function() {
        $('#competitor-last-name').focus();
    });

    $('.edit-competitor').on('click'), function() {
        $('#competitor-form-modal-title').text('Участник: Редактирование');
        row = $(this).closest('tr');

        $('#competitor-form-modal').modal('show');
    };

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


    // Rows
    $.each(competitors_by_section, function(key, value) {
        table.append($('<tbody>'));
        table.find('tbody:last').append($('<tr>')
            .append($('<td>')
                .attr('colspan', row_length)
                .text(key)
                .addClass('bg-info')
            )
        );
        $.each(value, function(index, value) {
            var new_row = table.find('tr.template-row').clone();
            new_row.removeClass('template-row');
            new_row.find("[data-role='row_number']").text(index + 1);
            new_row.find("[data-role='competitor_name']")
                .text(value.name + ' / ' + value.wingsuit)
                .append($('<a>').addClass('edit-competitor').attr('href', '#')
                    .append($('<i>').addClass('fa fa-pencil text-muted')))
                .append($('<a>').addClass('delete-competitor').attr('href', '#')
                    .append($('<i>').addClass('fa fa-times-circle text-muted')));
            new_row.attr('id', 'competitor_' + value.id);
            new_row.attr('data-comp-id', value.name);
            new_row.attr('data-comp-user', value.name);
            new_row.attr('data-comp-userid', value.id);
            new_row.attr('data-comp-suit', value.wingsuit);
            new_row.attr('data-comp-suitid', value.wingsuit_id);
            table.find('tbody:last').append(new_row);
        });
    });

}