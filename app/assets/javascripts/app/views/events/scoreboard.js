Skyderby.views.Scoreboard = Backbone.View.extend({

    el: '#results-table',

    events: {
       'click .edit-result'      : 'on_edit_result_click',
       'click .show-result'      : 'on_show_result_click',
       'click .delete-round'     : 'on_delete_round_click'
    },
    
    units: {
        distance: I18n.t('units.m'),
        speed: I18n.t('units.kmh'),
        time: I18n.t('units.t_unit')
    },

    $discipline_row: null,
    $rounds_row: null,
    $units_row: null,
    // $template_row: null,
    $table_footer: null,
    $table_footer_row: null,
    row_length: 3,

    header:      JST['app/templates/scoreboard_header'],
    round_cell:  JST['app/templates/round_cell'],
    result_cell: JST['app/templates/result_cell'],

    initialize: function(opts) {
        this.$el.append(this.header());

        this.$discipline_row = $('#disciplines-row');
        this.$rounds_row     = $('#rounds-row');
        this.$units_row      = $('#units-row');
        // this.$template_row   = this.$el.find('.template-row');

        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;

        this.rules = this.model.get('rules');

        this.listenTo(this.model.sections, 'add', this.render_section);
        this.listenTo(this.model.sections, 'sort', this.order_sections);

        this.listenTo(this.model.competitors, 'add', this.render_competitor);

        this.listenTo(this.model.rounds, 'add', this.create_round);
        this.listenTo(this.model.rounds, 'remove', this.delete_round);

        this.listenTo(this.model.tracks, 'add', this.create_result);
        this.listenTo(this.model.tracks, 'remove', this.delete_result);

        this.listenTo(this.model.rounds, 'add remove', this.calculate_totals);
        this.listenTo(this.model.rounds, 'add remove', this.sort_by_points);
        this.listenTo(this.model.rounds, 'add remove', this.set_row_numbers);

        this.listenTo(this.model.tracks, 'add remove', this.calculate_points);
        this.listenTo(this.model.tracks, 'add remove', this.calculate_totals);
        this.listenTo(this.model.tracks, 'add remove', this.sort_by_points);
        this.listenTo(this.model.tracks, 'add remove', this.set_row_numbers);
    },

    ////////////////////////////////////////////////////////////
    // Event handlers
    //

    // Rounds
    
    on_delete_round_click: function(e) {
        e.preventDefault();
        var round_id = $(e.currentTarget).closest('td').data('round-id');
        this.model.rounds.get(round_id).destroy({wait: true});
    },

    // Results

    on_edit_result_click: function(e) {
        e.preventDefault();  
        var result_id = $(e.currentTarget).attr('data-result-id');
        if (result_id) {
            var result = window.Competition.tracks.get(result_id);
            var view = new Skyderby.views.ShowResultForm({
                model: result,
                can_manage: this.can_manage
            });
            view.render().open();
        } else {
            var competitor_id = 
                $(e.currentTarget).closest('tr').attr('id').replace('competitor_', '');
            var new_result = new Skyderby.models.EventTrack({
                competitor_id: competitor_id,
                round_id: $(e.currentTarget).data('round-id')
            });
            var result_form = new Skyderby.views.NewResultForm({model: new_result});
            result_form.render().open();
        }
    },

    on_show_result_click: function(e) {
        e.preventDefault();  
        var result_id = $(this).attr('data-result-id');
        if (result_id) {
            window.Competition.result_by_id(result_id).open_form();
        }   
    },

    ///////////////////////////////////////////////////////////////
    // Rendering
    //

    // render_round: function(round) {
    //     console.log(round);
        // this.$rounds_row.append(this.round_cell(
        //     $.extend(round.toJSON(), {
        //         can_manage: this.can_manage, 
        //         rules: this.rules
        //     })
        // ));
        //
        // this.$units_row.append(
        //     $('<td>')
        //         .text(this.units[round.get('discipline')])
        //         .addClass('text-center')
        //         .attr('data-discipline', round.get('discipline'))
        //         .attr('data-role', 'unit')
        //         .attr('data-round-id', round.id)
        // );

        // this.$template_row.append(this.result_cell({
        //     id: round.id,
        //     role: 'result',
        //     can_manage: can_manage
        // }));
        
        // if (this.rules !== 'hungary_boogie') {
        //     this.$units_row.append(
        //         $('<td>')
        //             .text('%')
        //             .addClass('text-center')
        //             .attr('data-discipline', round.get('discipline'))
        //             .attr('data-role', 'points')
        //             .attr('data-round-id', round.id)
        //     );
        //
        //     // this.$template_row.append(this.result_cell({
        //     //     id: value.id,
        //     //     role: 'points',
        //     //     can_manage: can_manage
        //     // }));
        // }
    // },

    // render_discipline: function(value, key) {
    //     var col_count;
    //
    //     if (this.rules === 'hungary_boogie') {
    //         col_count = value.length;
    //     } else {
    //         col_count = value.length * 2 + 1;
    //     }
    //
    //     this.row_length += col_count;
    //     this.$discipline_row.append(
    //         $('<td>')
    //             .text(I18n.t('disciplines.' + key))
    //             .addClass('text-center')
    //             .attr('colspan', col_count)
    //             .attr('data-discipline', key)
    //     );
    //
    //     _.each(value, this.render_round.bind(this));
    //
    //     if (this.rules !== 'hungary_boogie') {
    //         this.$rounds_row.append(
    //             $('<td>')
    //                 .text('%')
    //                 .addClass('text-center')
    //                 .attr('data-discipline', key)
    //                 .attr('data-role', 'points')
    //                 .attr('rowspan', 2)
    //         );
    //         this.$template_row.append(
    //             $('<td>')
    //                 .addClass('text-right')
    //                 .attr('data-discipline', key)
    //                 .attr('data-role', 'points')
    //             );
    //     }
    // },

    render_section: function(section) {
        var section_view = new Skyderby.views.Section({
            model: section, 
            can_manage: this.can_manage,
            row_length: this.row_length
        });

        this.$el.append(section_view.render().$el);
    },

    render_competitor: function(competitor) {
        var competitor_view = new Skyderby.views.Competitor({
            model: competitor,
            can_manage: this.can_manage,
            rules: this.rules
        });
        $('#section_' + competitor.get('section_id')).append(competitor_view.render().$el);

        this.set_row_numbers();

        this.listenTo(competitor, 'change:section_id', this.move_competitor);

    },

    move_competitor: function(competitor) {
        $('#section_' + competitor.get('section_id')).append(this.$('#competitor_' + competitor.id));
    },

    // render_result: function(result) {
    //     var result_cell = $('#competitor_' + result.get('competitor_id') + 
    //                         ' td[data-round-id="' + result.get('round_id') + '"]' +
    //                         '[data-role="result"]'),
    //         points_cell = $('#competitor_' + result.get('competitor_id') +
    //                         ' td[data-round-id="' + result.get('round_id') + '"]' +
    //                         '[data-role="points"]'),
    //         max_val = window.Competition.max_results[result.get('round_id')],
    //         points = Math.round(result.get('result') / max_val * 1000) / 10;
    //
    //     result_cell.attr('data-url', result.get('url') +
    //                      '?f=' + Competition.range_from +
    //                      '&t=' + Competition.range_to);
    //
    //     result_cell.attr('data-track-id', result.get('track_id'));
    //     result_cell.attr('data-result-id', result.get('id'));
    //
    //     result_cell.text(result.get('result'));
    //     points_cell.text(points.toFixed(1));
    //     points_cell.attr('data-result-id', result.get('id'));
    // },

    set_row_numbers: function() {
        this.$el.find('tbody').each(function() {
            var row_ind = 1;
            $(this).find("[data-role='row_number']").each(function () {
                $(this).text(row_ind);
                row_ind += 1;
            });
        });
    },

    calculate_totals: function() {
        if (this.rules === 'hungary_boogie') {
            this.calc_totals_hungary_boogie();
        } else {
            this.calc_totals_speed_distance_time();
        }
    },

    calc_totals_speed_distance_time: function() {
        var rounds_by_discipline = this.model.rounds.groupBy('discipline');

        this.model.competitors.each(function(competitor) {
            var competitor_row = $('#competitor_' + competitor.id);
            var total_points = 0;

            _.each(rounds_by_discipline, function(rounds, discipline) {
                var discipline_points = 0;
                _.each(rounds, function(value) {
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

    calc_totals_hungary_boogie: function() {
        this.model.competitors.each(function(competitor) {
            var total_points = 0;

            var tracks = this.model.tracks.where({competitor_id: competitor.id});
            if (tracks.length >= 3) {
                var best_tracks = _.chain(tracks)
                    .sortBy(function(trk) { return -trk.result; })
                    .first(3)
                    .reduce(function(memo, num) { return memo + num.result; }, 0)
                    .value();

                total_points = best_tracks / 3;
            }

            var total_cell = $('#competitor_' + competitor.id + ' > td[data-role="total-points"]');
            if (total_points) {
                total_cell.text(Math.round(total_points));
            } else {
                total_cell.text('');
            }

        });

        this.indicate_best_worst_results();
    },

    indicate_best_worst_results: function() {

        $('.hc-best-result').removeClass('hc-best-result');
        $('.hc-worst-result').removeClass('hc-worst-result');

        this.model.sections.each(function(section) {
            var competitors_ids = 
                _.chain(window.Competition.competitors)
                    .filter(function(el) { return el.section.id === section.id; })
                    .map(function(el) { return el.id; })
                    .value();
            var results = 
                _.chain(window.Competition.tracks)
                    .filter(function(el) { return _.contains(competitors_ids, el.competitor_id); })
                    .sortBy(function(el) { return -el.result; })
                    .value();

            if (results.length) {
                $('td[data-result-id="' + _.last(results).id + '"]').addClass('hc-worst-result');
                $('td[data-result-id="' + _.first(results).id + '"]').addClass('hc-best-result');
            }

        });        
    },

    calculate_points: function() {
        window.Competition.competitors.each(function(competitor) {
            window.Competition.rounds.each(function(round) {
                var result_cell = $('#competitor_' + competitor.id + '>' +
                                  'td[data-round-id=' + round.id + ']' +
                                  '[data-role=result]');
                var points_cell = $('#competitor_' + competitor.id + '>' +
                                  'td[data-round-id=' + round.id + ']' +
                                  '[data-role=points]');
                var result = +result_cell.text();

                var max_result_for_round = window.Competition.max_results[round.id];
                var max_val = max_result_for_round ? max_result_for_round : result;

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
        this.$el.find('tbody').each(function(index, value) {
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
   
    // after_results_changes: function() {
        // this.calculate_totals();
        // this.sort_by_points();
    // },

    render_total_points: function() {
        this.$discipline_row.append(
            $('<td>')
                .addClass('text-center')
                .text(I18n.t('events.show.total'))
                .attr('rowspan', 3)
                .attr('data-role', 'total-points')
        );
        this.row_length += 1;
    },

    // render_table_footer: function() {
    //     $('#table-footer > tr').append(
    //         $('<td>').attr('colspan', 2)
    //     );
    //
    //     this.$table_footer = $('#table-footer');
    //     this.$table_footer_row = $('#table-footer > tr');
    //
    //     var footer_row = this.$table_footer_row;
    //
    //     var rounds_by_discipline = 
    //         _.groupBy(window.Competition.rounds, 'discipline');
    //
    //     _.each(rounds_by_discipline, function(rounds, discipline) {
    //         _.each(rounds, function(round) {
    //             var signed_cell = 
    //                 $('<td>')
    //                     .addClass('text-center')
    //                     .addClass('text-success')
    //                     .attr('colspan', 2)
    //                     .text(' Signed')
    //                     .prepend($('<i>').addClass('fa').addClass('fa-lock'));
    //             if (!round.signed_off) {
    //                 signed_cell =
    //                     $('<td>')
    //                         .addClass('text-center')
    //                         .addClass('text-danger')
    //                         .attr('colspan', 2)
    //                         .text(' Not signed')
    //                         .prepend($('<i>').addClass('fa').addClass('fa-unlock'));
    //             }
    //             footer_row.append(signed_cell);
    //         });
    //         footer_row.append($('<td>'));
    //     });
    //
    //     var total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
    //     if (total_points_cell.length) {
    //          var signed_cell =
    //             $('<td>')
    //                 .addClass('text-center')
    //                 .addClass('text-danger')
    //                 .attr('colspan', 2)
    //                 .text(' Not signed')
    //                 .prepend($('<i>').addClass('fa').addClass('fa-unlock'));
    //         footer_row.append(signed_cell);
    //     }
    // },

    render: function() {

        // Sections
        this.model.sections.each(this.render_section.bind(this));

        // Rounds
        this.model.rounds.each(this.create_round.bind(this));

        // Competitors
        this.model.competitors.each(this.render_competitor.bind(this));
        
        // Results
        this.model.tracks.each(this.create_result.bind(this));

        // Table footer
        this.$el.append(
            $('<tbody>').attr('id', 'table-footer').append($('<tr>'))
        );
        if (window.Competition.is_official && window.Competition.can_manage) {
            this.render_table_footer();
        }

        this.calculate_points();
        this.calculate_totals();
        this.sort_by_points();
        this.set_row_numbers();
    },

    ///////////////////////////////////////////////////
    // Manipulations
    //

    order_sections: function() {
        var sections = this.$el.find('tbody').get();
        sections.sort(function(a, b) {

            if ($(b).attr('id') === 'table-footer') return -1;

            var A = Number($(a).attr('data-order'));
            var B = Number($(b).attr('data-order'));

            if (A > B) return 1;
            if (A < B) return -1;
            return 0;

        });

        var $el = this.$el;

        $.each(sections, function(index, section) {
            $el.append(section);
        });
    },
   

    move_sections: function(section, direction) {
        var $section = this.$el.find('#section_' + section.id);
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

    // update_competitor: function(competitor) {
    //     var competitor_row = $('#competitor_' + competitor.id);
    //
    //     competitor_row.find("[data-role='competitor-name']")
    //         .attr('href', competitor.profile.url)
    //         .text(competitor.profile.name + ' ');
    //     competitor_row.find("[data-role='competitor-suit']").text(competitor.wingsuit.name);
    //     competitor_row.find("[data-role='competitor-country']")
    //         .text(competitor.country.code.toUpperCase())
    //         .attr('title', competitor.country.name);
    //
    //     var current_section = competitor_row.closest('tbody').data('id');
    //
    //     if (competitor.section.id != current_section) {
    //         $('#section_' + competitor.section.id).append(
    //             competitor_row
    //                 .remove()
    //                 .clone()
    //         );
    //     }
    //
    //     this.set_row_numbers();
    // },
    //
    // delete_competitor: function(competitor) {
    //     $('#competitor_' + competitor.id).remove();
    //     this.calculate_points();
    //     this.set_row_numbers();
    // },

    // Rounds
    
    create_round: function(round) {
        // 1. Проверить наличие дисциплины
        var discipline = round.get('discipline');
        var discipline_cell = $('#disciplines-row > td[data-discipline="' + discipline + '"]');
        var total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
        var addition_colspan = 0;

        if (!total_points_cell.length) {
            // header
            this.render_total_points();

            // existent competitors rows
            this.$('tr.competitor-row').each(function() {
                $(this).append($('<td>').attr('data-role', 'total-points'));
            });        

            total_points_cell = $('#disciplines-row > td[data-role="total-points"]');
            addition_colspan += 1;
        }

        // 2. Создать дисциплину если отсутствует
        // 3. Увеличить colspan если присутствует
        if (!discipline_cell.length) {
            var discipline_colspan = this.rules === 'hungary_boogie' ? 1 : 3;
            // discipline
            total_points_cell.before(
                $('<td>')
                    .text(I18n.t('disciplines.' + discipline))
                    .addClass('text-center')
                    .attr('data-discipline', discipline)
                    .attr('colspan', discipline_colspan)   
            );

            if (this.rules !== 'hungary_boogie') {
                // discipline points
                this.$rounds_row.append(
                    $('<td>')
                        .text('%')
                        .attr('data-discipline', discipline)
                        .attr('data-role', 'points')
                        .attr('rowspan', 2)   
                );

                // competitor rows discipline points
                //
                this.$('tr.competitor-row').each(function() {
                    $(this).find('td[data-role="total-points"]').before(
                        $('<td>')
                            .addClass('text-right')
                            .attr('data-discipline', discipline)
                            .attr('data-role', 'points')
                    );
                });        
                addition_colspan += 1;
            }
        } else {
            var colspan = Number(discipline_cell.attr('colspan'));
            discipline_cell.attr('colspan', colspan + (this.rules === 'hungary_boogie' ? 1 : 2));
        }

        // 4. Добавить раунд
        if (this.rules === 'hungary_boogie') {
            this.$rounds_row.append(
                this.round_cell(
                    $.extend(round.toJSON(), {can_manage: this.can_manage, rules: this.rules})
            ));
        } else {
            $('#rounds-row > td[data-discipline=' + discipline + '][data-role="points"]').before(
                this.round_cell(
                    $.extend(round.toJSON(), {can_manage: this.can_manage, rules: this.rules})
            ));
        }

        var units_selector = '#units-row > td[data-role="points"]';
        if ($('#units-row > td[data-discipline=' + discipline + ']').length) {
            units_selector += '[data-discipline=' + discipline + ']';
        }
        units_selector += ':last';

        var percent_cell = 
            $('<td>')
                .text('%')
                .addClass('text-center')
                .attr('data-discipline', discipline)
                .attr('data-role', 'points')
                .attr('data-round-id', round.id);

        var unit_cell =
            $('<td>')
                .text(this.units[discipline])
                .addClass('text-center')
                .attr('data-discipline', discipline)
                .attr('data-role', 'unit')
                .attr('data-round-id', round.id);

        var result_cell = this.result_cell({
            id: round.id,
            role: 'result',
            can_manage: this.can_manage
        });

        var points_cell = this.result_cell({
            id: round.id,
            role: 'points',
            can_manage: this.can_manage
        });

        if (this.rules === 'hungary_boogie') {

            if ($(units_selector).length) {
                $(units_selector).after(unit_cell);
            } else {
                this.$units_row.append(unit_cell);
            }

            // $('.template-row > td[data-role="total-points"]')
            //     .before($(result_cell).clone());

            addition_colspan += 1;

            // 5. Добавить ячейки участникам
            this.$('.competitor-row > td[data-role="total-points"]').each(function() {
                $(this).before($(result_cell).clone());
            }); 

        } else {

            if ($(units_selector).length) {
                $(units_selector).after(percent_cell).after(unit_cell);
            } else {
                this.$units_row.append(unit_cell).append(percent_cell);
            }

            // $('.template-row > td[data-discipline=' + discipline + '][data-role="points"]')
            //     .before($(result_cell).clone())
            //     .before($(points_cell).clone());

            addition_colspan += 2;

            // 5. Добавить ячейки участникам
            this.$('.competitor-row > td[data-discipline=' + discipline + '][data-role="points"]').each(function() {
                $(this) 
                    .before($(result_cell).clone())
                    .before($(points_cell).clone());
            }); 
        }

        // 6. Увеличить colspan в секциях
        $('#results-table > tbody > tr.head-row > td').each(function() {
            $(this).attr('colspan', Number($(this).attr('colspan')) + addition_colspan);
        });

    },

    delete_round: function(round) {
        var del_discipline = 
            this.model.rounds.where({
                discipline: round.get('discipline')
            }).length === 0;

        var del_total = this.model.rounds.isEmpty();

        // Удалить ячейки в строках участников
        // Удалить раунд
        // Удалить единицы измерения
        $('.competitor-row > td[data-round-id=' + round.id + '], ' +
            '#rounds-row > td[data-round-id=' + round.id + '], ' +
            '#units-row > td[data-round-id=' + round.id + ']').remove();

        var discipline_cell = $('#disciplines-row > td[data-discipline=' + round.get('discipline') + ']');
        if (del_discipline) {
            $('td[data-discipline=' + round.get('discipline') + '][data-role="points"]').remove(); 
            discipline_cell.remove();
        } else {
            // уменьшить colspan
            var colspan = Number(discipline_cell.attr('colspan'));
            discipline_cell.attr('colspan', colspan - (this.rules === 'hungary_boogie' ? 1 : 2));
        }

        if (del_total) {
            $('td[data-role="total-points"]').remove();
        }
        // Уменьшить colspan в секциях
        $('#results-table > tbody > tr.head-row > td').each(function() {
            var colspan_diff = (this.rules === 'hungary_boogie' ? 1 : 2) + (del_total ? 1 : 0) + (del_discipline ? 1 : 0);
            $(this).attr('colspan', Number($(this).attr('colspan')) - colspan_diff);
        });
    },

    after_rounds_changed: function() {
        // Пересчитать итоги по дисциплинам
        // this.calculate_totals();
    },

    create_result: function(result) {
        var result_cell = $('#competitor_' + result.get('competitor_id') + ' > ' +
                            'td[data-round-id=' + result.get('round_id') + ']' + 
                            '[data-role=result]');
        var points_cell = $('#competitor_' + result.get('competitor_id') + ' > ' +
                            'td[data-round-id=' + result.get('round_id') + ']' + 
                            '[data-role=points]');

        result_cell.text(result.get('result'))
            .attr('data-result-id', result.id)
            .attr('data-track-id', result.get('track_id'))
            .attr('data-url', result.get('url'));

        points_cell.attr('data-result-id', result.id);

        // this.calculate_points();
        // this.calculate_totals();
        // this.sort_by_points();
        // this.set_row_numbers();
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

        // this.calculate_points();
        // this.calculate_totals();
        // this.sort_by_points();
        // this.set_row_numbers();
    }
});
