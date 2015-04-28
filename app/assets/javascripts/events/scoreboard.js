var Event = Event || {};

Event.Scoreboard = function(params) {
    this.$table = $('#results-table');
    this.$discipline_row = null;
    this.$rounds_row = null;
    this.$units_row = null;
    this.$template_row = null;
    this.row_length = 2;

    this.header = _.template([
        '<thead>',
            '<tr id="disciplines-row">',
                '<td class="rt-ln" rowspan=3>#</td>',
                '<td rowspan=3><%= I18n.t("events.show.competitor") %></td>',
            '</tr>',
            '<tr id="rounds-row"></tr>',
            '<tr id="units-row"></tr>',
            '<tr class="template-row">',
                '<td class="rt-ln" data-role="row_number"></td>',
                '<td data-role="competitor">',
                    '<span data-role="competitor-name"></span>',
                    '<span data-role="competitor-suit"></span>',
                    '<span data-role="competitor-edit-ctrls"></span>',
                '</td>',
            '</tr>',
        '</thead>'
    ].join('\n'));

    this.round_cell = _.template([
        '<td class="text-center" data-round-id="<%=id%>" colspan=2>',
            '<% if (can_manage) { %>',
                '<i class="fa fa-fw"></i>',
            '<% } %>',
            '<%=name%>',
            '<% if (can_manage) { %>',
                '<a href="#" class="delete-round">',
                    '<i class="fa fa-fw fa-times-circle text-muted"></i>',
                '</a>', 
            '<% } %>',
        '</td>'
    ].join('\n'));

    this.result_cell = _.template([
        '<td data-round-id="<%=id%>" data-role="<%=role%>" class="text-right ',
            '<% if (can_manage) { %>',
                'edit-result',
            '<% } %>',
            '">',
        '</td>'
    ].join('\n'));

    this.section = _.template([
        '<tbody id="section_<%= id %>" data-id="<%= id %>" data-order="<%= order %>">',
            '<tr id="section_<%= id %>_head_row" class="head-row">',
                '<td id="section_<%= id %>_name_cell" class="-bg-info" colspan="<%= row_length %>">',
                    '<span data-role="name"><%= name %>:</span>',
                    '<% if (can_manage) { %>',
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

    this.init();
}

Event.Scoreboard.prototype = {

    init: function() {
        this.$table.append(this.header());

        this.$discipline_row = $('#disciplines-row');
        this.$rounds_row = $('#rounds-row');
        this.$units_row = $('#units-row');
        this.$template_row = this.$table.find('.template-row');

        this.bind_events();
    },


    ////////////////////////////////////////////////////////////
    // Event handlers
    //
    bind_events: function() {
       this.$table 
           .on('click', '.edit-competitor',   this.edit_competitor_click)
           .on('click', '.delete-competitor', this.delete_competitor_click)
           .on('click', '.edit-section',      this.edit_section_click)
           .on('click', '.delete-section',    this.delete_section_click)
           .on('click', '.section-up',        this.move_section_click)
           .on('click', '.section-down',      this.move_section_click)
           .on('click', '.edit-result',       this.on_edit_result_click)
           .on('click', '.delete-round',      this.on_delete_round_click);
    },

    // Sections 

    edit_section_click: function(e) {
        e.preventDefault();
        
        var section_tbody = $(this).closest('tbody');
        var section_id = section_tbody.attr('id').replace('section_', "");
    
        window.Competition.section_by_id(section_id).open_form();       
    },

    delete_section_click: function(e) {
        e.preventDefault();

        var section_tbody = $(this).closest('tbody');
        var rows_count = section_tbody.children().length;

        if (rows_count > 1) {
            alert('Перед удалением класса необходимо переместить всех участников из него в другие классы');
        } else {
            var section_id = section_tbody.attr('id').replace('section_', "");
            window.Competition.section_by_id(section_id).destroy();
        }
    },

    move_section_click: function(e) {
        e.preventDefault();

        var $section = $(this).parents('tbody:first');
        section = window.Competition.section_by_id($section.data('id'));

        if ($(this).is('.section-up')) {
            var $prev_element = $section.prev();

            if (!$prev_element.is('thead')) {
                prev_section = window.Competition.section_by_id($prev_element.data('id'));
                section.reorder_with(prev_section, 'up');                
            }
        } else {
            var $next_element = $section.next();

            if (!$next_element.is('#without_section')) {
                next_section = window.Competition.section_by_id($next_element.data('id'));
                section.reorder_with(next_section, 'down');
            }
        }
    },

    // Competitors

    edit_competitor_click: function(e) {
        e.preventDefault();
        var competitor_id = $(this).closest('tr')
                                   .attr('id')
                                   .replace('competitor_', '');
        window.Competition.competitor_by_id(competitor_id).open_form();

    },

    delete_competitor_click: function(e) {
        e.preventDefault(); 
        var competitor_id = $(this).closest('tr')
                                   .attr('id')
                                   .replace('competitor_', '');
        window.Competition.competitor_by_id(competitor_id).destroy();
    },

    // Rounds
    
    on_delete_round_click: function(e) {
        e.preventDefault();
        var round_id = $(this).closest('td').data('round-id');
        window.Competition.round_by_id(round_id).destroy();
    },

    // Results

    on_edit_result_click: function(e) {
        e.preventDefault();  
        var result_id = $(this).attr('data-result-id');
        if (result_id) {
            window.Competition.result_by_id(result_id).open_form();
        } else {
            var competitor_id = $(this).closest('tr')
                                       .attr('id')
                                       .replace('competitor_', '');
            var result = new Event.EventTrack({
                competitor_id: competitor_id,
                round_id: $(this).data('round-id')
            });
            result.open_form();            
        }
    },

    ///////////////////////////////////////////////////////////////
    // Rendering
    //
    render_round: function(value, index) {
        var can_manage = window.Competition.can_manage;
        this.$rounds_row.append(this.round_cell(
            $.extend(value, {can_manage: can_manage})
        ));

        this.$units_row.append(
            $('<td>')
                .text(window.Competition.units[value.discipline])
                .attr('data-discipline', value.discipline)
                .attr('data-role', 'unit')
                .attr('data-round-id', value.id)
        );
        this.$units_row.append(
            $('<td>')
                .text('%')
                .attr('data-discipline', value.discipline)
                .attr('data-role', 'points')
                .attr('data-round-id', value.id)
        );

        this.$template_row.append(this.result_cell({
            id: value.id,
            role: 'result',
            can_manage: can_manage
        }));
        this.$template_row.append(this.result_cell({
            id: value.id,
            role: 'points',
            can_manage: can_manage
        }));

    },

    render_discipline: function(value, key) {
        var col_count = value.length * 2 + 1;
        this.row_length += col_count;
        this.$discipline_row.append(
            $('<td>')
                .text(capitaliseFirstLetter(key))
                .attr('colspan', col_count)
                .attr('data-discipline', key)
        );

        _.each(value, this.render_round.bind(this));

        this.$rounds_row.append(
            $('<td>')
                .text('%')
                .addClass('text-center')
                .attr('data-discipline', key)
                .attr('data-role', 'points')
                .attr('rowspan', 2)
        );
        this.$template_row.append(
            $('<td>')
                .addClass('text-right')
                .attr('data-discipline', key)
                .attr('data-role', 'points')
            );
    },

    render_section: function(value, index) {
        var can_manage = window.Competition.can_manage;
        this.$table.append(this.section(
            $.extend(value, {can_manage: can_manage, row_length: this.row_length})
        ));
    },

    render_competitor: function(value, index) {
        var can_manage = window.Competition.can_manage;

        var new_row = this.$table.find('tr.template-row').clone();
        new_row.removeClass('template-row').addClass('competitor-row');
        new_row.attr('id', 'competitor_' + value.id);
        
        new_row.find("[data-role='competitor-name']").text(value.profile.name + ' ');
        new_row.find("[data-role='competitor-suit']").text(value.wingsuit.name);
        if (can_manage) {
            new_row.find("[data-role='competitor-edit-ctrls']").html([
                '<a href="#" class="edit-competitor">',
                    '<i class="fa fa-pencil text-muted"></i>',
                '</a>',
                '<a href="#" class="delete-competitor">',
                    '<i class="fa fa-times-circle text-muted"></i>',
                '</a>'
            ].join('\n'));
        }

        var el_id = (value.section && value.section.id) ? ('#section_' + value.section.id) : ('#without_section');
        $(el_id).append(new_row);
    },

    render_result: function(value, index) {
        var can_manage = window.Competition.can_manage;

        var result_cell = $('#competitor_' + value.competitor_id 
                            + ' td[data-round-id="' + value.round_id + '"]'
                            + '[data-role="result"]'),
            points_cell = $('#competitor_' + value.competitor_id 
                            + ' td[data-round-id="' + value.round_id + '"]' 
                            + '[data-role="points"]'),
            max_val = window.Competition.max_results['round_' + value.round_id][0].result,
            points = Math.round(value.result / max_val * 1000) / 10;

        result_cell.attr('data-url', value.url 
                         + '?f=' + Competition.range_from 
                         + '&t=' + Competition.range_to);

        result_cell.attr('data-track-id', value.track_id);
        result_cell.attr('data-result-id', value.id);

        if (!can_manage) {
            result_cell.addClass('clickableRow');
        }
        result_cell.text(value.result);
        points_cell.text(points.toFixed(1));
    },

    set_row_numbers: function() {
        this.$table.find('tbody').each(function() {
            var row_ind = 1;
            $(this).find("[data-role='row_number']").each(function () {
                $(this).text(row_ind);
                row_ind += 1;
            });
        });
    },

    calculate_totals: function() {
        _.each(window.Competition.competitors, function(competitor) {
            var competitor_row = $('#competitor_' + competitor.id);
            var total_points = 0;

            var rounds_by_discipline = 
                _.groupBy(window.Competition.rounds, 'discipline');

            _.each(rounds_by_discipline, function(rounds, discipline) {
                var discipline_points = 0;
                _.each(rounds, function(value, index) {
                    discipline_points += +competitor_row.find(
                        'td[data-round-id="' + value.id + '"][data-role="points"]'
                    ).text();
                });
                var discipline_cell = competitor_row.find('td[data-discipline="' + discipline + '"]');
                if (discipline_points) {
                    discipline_cell.text((discipline_points / rounds.length).toFixed(1)); 
                    total_points += discipline_points / rounds.length;
                } else {
                   discipline_cell.text(''); 
                }
            });

            var total_cell = competitor_row.find('td[data-role="total-points"]');
            if (total_points) {
                total_cell.text(total_points.toFixed(2));
            } else {
                total_cell.text('');
            }
        });
    },

    calculate_points: function() {
        _.each(window.Competition.competitors, function(competitor) {
            _.each(window.Competition.rounds, function(round) {
                var max_val = window.Competition.max_results['round_' + round.id][0].result;
                var result_cell = $('#competitor_' + competitor.id + '>' +
                                  'td[data-round-id=' + round.id + ']' +
                                  '[data-role=result]');
                var points_cell = $('#competitor_' + competitor.id + '>' +
                                  'td[data-round-id=' + round.id + ']' +
                                  '[data-role=points]');
                var result = +result_cell.text();
                if (result) {
                    var points = Math.round(result / max_val * 1000) / 10;
                    points_cell.text(points.toFixed(1)); 
                } else {
                    points_cell.text('');
                }

            }); 
        });    
    },

    sort_by_points: function() {
        this.$table.find('tbody').each(function(index, value) {
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
    },
   
    after_results_changes: function() {
        this.calculate_totals();
        this.sort_by_points();
    },

    render_total_points: function() {
        this.$discipline_row.append(
            $('<td>')
                .addClass('text-center')
                .text(I18n.t('events.show.total'))
                .attr('rowspan', 3)
                .attr('data-role', 'total-points')
        );
        this.$template_row.append(
            $('<td>').addClass('text-right').attr('data-role', 'total-points')
        );
        this.row_length += 1;
    },

    render: function() {
        // Disciplines, Rounds
        var rounds_by_discipline = _.groupBy(window.Competition.rounds, 'discipline');
        _.each(rounds_by_discipline, this.render_discipline.bind(this));

        if (window.Competition.rounds.length) {
            this.render_total_points();
        }

        // Sections
        _.each(window.Competition.sections, this.render_section.bind(this));

        this.$table.append($('<tbody>').attr('id', 'without_section'));

        // Competitors
        _.each(window.Competition.competitors, this.render_competitor.bind(this));

        // Results
        _.each(window.Competition.tracks, this.render_result.bind(this));

        this.calculate_totals();
        this.sort_by_points();
        this.set_row_numbers();
    },

    ///////////////////////////////////////////////////
    // Manipulations
    //

    // Sections
    create_section: function(section) {
        this.render_section(section);
    },

    update_section: function(section) {
        this.$table
            .find('#section_' + section.id 
                  + '_name_cell [data-role="name"]')
            .text(section.name + ':');
    },
    
    delete_section: function(section) {
        this.$table.find('#section_' + section.id).remove();         
    },

    move_sections: function(section, direction) {
        var $section = this.$table.find('#section_' + section.id);
        var tmp = $section.attr('data-order');

        if (direction == 'up') {
            var $prev_section = $section.prev();
            $section.insertBefore($prev_section);
            
            $section.attr('data-order', $prev_section.attr('data-order'));
            $prev_section.attr('data-order', tmp);
        } else {
            var $next_section = $section.next();
            $section.insertAfter($next_section);

            $section.attr('data-order', $next_section.attr('data-order'));
            $next_section.attr('data-order', tmp);
        }
    },

    // Competitors 

    create_competitor: function(competitor) {
        this.render_competitor(competitor);
        this.set_row_numbers();
    },

    update_competitor: function(competitor) {
        var competitor_row = $('#competitor_' + competitor.id);

        competitor_row.find("[data-role='competitor-name']").text(competitor.profile.name + ' ');
        competitor_row.find("[data-role='competitor-suit']").text(competitor.wingsuit.name);

        var current_section = competitor_row.closest('tbody').data('id');

        if (competitor.section.id != current_section) {
            (competitor.section.id ? $('#section_' + competitor.section.id) : $('#without_section'))
                .append(competitor_row
                    .remove()
                    .clone());
            }
        this.set_row_numbers();
    },

    delete_competitor: function(competitor) {
        $('#competitor_' + competitor.id).remove();
        this.calculate_points();
        this.set_row_numbers();
    },

    // Rounds
    
    create_round: function(round) {
        // 1. Проверить наличие дисциплины
        var discipline = round.discipline;
        var discipline_cell = $('#disciplines-row > td[data-discipline="' + discipline + '"]');
        var total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
        var addition_colspan = 0;

        if (!total_points_cell.length) {
            // header and template row
            this.render_total_points();
            // existent competitors rows
            $('#results-table > tbody > tr.competitor-row').each(function() {
                $(this).append($('<td>').attr('data-role', 'total-points'));
            });        

            total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
            addition_colspan += 1;
        }

        // 2. Создать дисциплину если отсутствует
        // 3. Увеличить colspan если присутствует
        if (!discipline_cell.length) {
            // discipline
            total_points_cell.before(
                $('<td>')
                    .text(capitaliseFirstLetter(discipline))
                    .attr('data-discipline', discipline)
                    .attr('colspan', 3)   
            );
            // discipline points
            this.$rounds_row.append(
                $('<td>')
                    .text('%')
                    .attr('data-discipline', discipline)
                    .attr('data-role', 'points')
                    .attr('rowspan', 2)   
            );
            // template row discipline points
            this.$template_row.find('td[data-role="total-points"]').before(
                $('<td>')
                    .addClass('text-right')
                    .attr('data-discipline', discipline)
                    .attr('data-role', 'points')
            );
            // competitor rows discipline points
            $('#results-table > tbody > tr.competitor-row').each(function() {
                $(this).find('td[data-role="total-points"]').before(
                    $('<td>')
                        .addClass('text-right')
                        .attr('data-discipline', discipline)
                        .attr('data-role', 'points')
                );
            });        
            addition_colspan += 1;
        } else {
            var colspan = +discipline_cell.attr('colspan');
            discipline_cell.attr('colspan', colspan + 2);
        }

        var can_manage = window.Competition.can_manage;
        // 4. Добавить раунд
        $('#rounds-row > td[data-discipline=' + discipline + '][data-role="points"]').before(
            this.round_cell(
                $.extend(round, {can_manage: can_manage})
        ));

        var units_selector = '#units-row > td[data-role="points"]';
        if ($('#units-row > td[data-discipline=' + discipline + ']').length) {
            units_selector += '[data-discipline=' + discipline + ']';
        }
        units_selector += ':last';

        $(units_selector).after(
            $('<td>')
                .text('%')
                .attr('data-discipline', discipline)
                .attr('data-role', 'points')
                .attr('data-round-id', round.id)
        ).after(
            $('<td>')
                .text(window.Competition.units[discipline])
                .attr('data-discipline', discipline)
                .attr('data-role', 'unit')
                .attr('data-round-id', round.id)
        );

        var result_cell = this.result_cell({
            id: round.id,
            role: 'result',
            can_manage: can_manage
        });

        var points_cell = this.result_cell({
            id: round.id,
            role: 'points',
            can_manage: can_manage
        });

        $('.template-row > td[data-discipline=' + discipline + '][data-role="points"]')
            .before($(result_cell).clone())
            .before($(points_cell).clone());

        addition_colspan += 2;

        // 5. Увеличить colspan в секциях
        $('#results-table > tbody > tr.head-row > td').each(function() {
            $(this).attr('colspan', +$(this).attr('colspan') + addition_colspan);
        });

        // 6. Добавить ячейки участникам
        $('.competitor-row > td[data-discipline=' + discipline + '][data-role="points"]').each(function() {
            $(this) 
                .before($(result_cell).clone())
                .before($(points_cell).clone());
        }); 
    },

    delete_round: function(round) {
        var del_discipline = _.where(
                window.Competition.rounds, 
                {discipline: round.discipline}
            ).length == 1;

        var del_total = window.Competition.rounds.length == 1;

        // Удалить ячейки в строках участников
        // Удалить ячейки в шаблоне
        // Удалить раунд
        // Удалить единицы измерения
        $('.competitor-row > td[data-round-id=' + round.id + '], '
            + '.template-row > td[data-round-id=' + round.id + '], '
            + '#rounds-row > td[data-round-id=' + round.id + '], '
            + '#units-row > td[data-round-id=' + round.id + ']').remove();

        var discipline_cell = $('#disciplines-row > td[data-discipline=' + round.discipline + ']');
        if (del_discipline) {
            $('td[data-discipline=' + round.discipline + '][data-role="points"]').remove(); 
            discipline_cell.remove();
        } else {
            // уменьшить colspan
            var colspan = +discipline_cell.attr('colspan');
            discipline_cell.attr('colspan', colspan - 2);
        }

        if (del_total) {
            $('td[data-role="total-points"]').remove();
        }
        // Уменьшить colspan в секциях
        $('#results-table > tbody > tr.head-row > td').each(function() {
            var colspan_diff = 2 + (del_total ? 1 : 0) + (del_discipline ? 1 : 0);
            $(this).attr('colspan', +$(this).attr('colspan') - colspan_diff);
        });
    },

    create_result: function(result) {
        var result_cell = $('#competitor_' + result.competitor_id + ' > ' +
                            'td[data-round-id=' + result.round_id + ']' + 
                            '[data-role=result]');
        var points_cell = $('#competitor_' + result.competitor_id + ' > ' +
                            'td[data-round-id=' + result.round_id + ']' + 
                            '[data-role=points]');

        result_cell.text(result.result);
        result_cell.attr('data-result-id', result.id);
        result_cell.attr('data-track-id', result.track_id);
        result_cell.attr('data-url', result.url);

        // var max_val = window.Competition.max_results['round_' + result.round_id][0].result;
        // var points = Math.round(result.result / max_val * 1000) / 10;
        //
        // points_cell.text(points);

        this.calculate_points();
        this.calculate_totals();
        this.sort_by_points();
    },

    delete_result: function(result) {
        var result_cell = $('td[data-result-id=' + result.id + ']');
        var points_cell = 
            result_cell.closest('tr')
                .find('td[data-round-id=' + 
                         result_cell.data('round-id') + 
                         '][data-role=points]');


        result_cell.text('');
        result_cell.attr('data-result-id', '');
        result_cell.attr('data-track-id', '');
        result_cell.attr('data-url', '');

        points_cell.text('');

        this.calculate_points();
        this.calculate_totals();
        this.sort_by_points();
    }
}
