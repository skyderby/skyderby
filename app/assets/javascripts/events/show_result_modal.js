if (!Event) { Event = {}; }

Event.ShowResultModal = function(result) {
    this.mft_k = 3.280839895;

    this.result = result;
    this.track_data = {};
    this.index_cache = [];
    
    // View settings
    this.in_imperial = false;
    this.display_on_single_chart = false;
    
    this.$dialog = $('#show-result-modal');
    this.$elements = {
        title: $('#show-result-modal-title'),

        open_track_link: $('#open-track-link'),
        delete_link: $('#rm-delete'),
        loading_spinner: $('.result-loading-spinner'),

        multiple_charts: $('#multiple-charts'),
        gr_chart_container: $('#result-gr-chart'),
        spd_chart_container: $('#result-spd-chart'),
        elev_chart_container: $('#result-elev-chart'),

        single_chart: $('#single-chart'),
        all_data_chart_container: $('#result-all-data-chart'),

        track_uploaded: $('#rm-track-uploaded'),

        li_toggle_single: $('#li_toggle_single'),
        li_toggle_multi: $('#li_toggle_multi'),

        toggle_single_link: $('#toggle_single'),
        toggle_multi_link: $('#toggle_multi'),

        li_toggle_metric: $('#li_toggle_metric'),
        li_toggle_imperial: $('#li_toggle_imperial'),
        toggle_metric_link: $('#toggle_metric'),
        toggle_imperial_link: $('#toggle_imperial'),

        header_distance: $('#dd_distance'),

        header_avg_h_speed: $('#p_avg_h_speed'),
        header_max_h_speed: $('#p_max_h_speed'),
        header_min_h_speed: $('#p_min_h_speed'),

        header_avg_gr: $('#p_avg_gr'),
        header_max_gr: $('#p_max_gr'),
        header_min_gr: $('#p_min_gr'),

        header_elevation: $('#dd_elevation'),

        header_avg_v_speed: $('#p_avg_v_speed'),
        header_max_v_speed: $('#p_max_v_speed'),
        header_min_v_speed: $('#p_min_v_speed'),

        header_fl_time: $('#dd_fl_time')
    };
};

Event.ShowResultModal.prototype = {
    open: function() {
        this.$elements.title.text(this.get_title());

        var uploaded_text = 'at ' + this.result.created_at;
        if (this.result.uploaded_by.name) {
            uploaded_text = this.result.uploaded_by.name + ' ' + uploaded_text;
        }
        this.$elements.track_uploaded.text(uploaded_text);

        this.$elements.open_track_link.attr(
            'href', 
            this.result.url + 
                '?f=' + window.Competition.range_from + 
                '&t=' + window.Competition.range_to
        );
        
        if (!window.Competition.can_manage) {
            this.$elements.delete_link.hide();
        }

        this.reset_header();

        this.init_view_type();
        this.init_units();

        this.bind_events();
        this.init_charts();

        this.highlite_result();

        this.$dialog.modal('show');
    },

    bind_events: function() {
        this.$elements.toggle_single_link
            .off('click')
            .on('click', this.on_toggle_single.bind(this));

        this.$elements.toggle_multi_link
            .off('click')
            .on('click', this.on_toggle_multi.bind(this));

        this.$elements.toggle_metric_link
            .off('click')
            .on('click', this.on_toggle_metric.bind(this));

        this.$elements.toggle_imperial_link
            .off('click')
            .on('click', this.on_toggle_imperial.bind(this));

        this.$elements.delete_link
            .off('click')
            .on('click', this.on_delete_link_click.bind(this));

        this.$dialog
            .off('shown.bs.modal')
            .on('shown.bs.modal', this.on_show_modal_shown.bind(this));
    },

    get_title: function() {
        var competitor = window.Competition.competitor_by_id(this.result.competitor_id);
        var round = window.Competition.round_by_id(this.result.round_id);

        return 'Result: ' + competitor.profile.name + ' in ' +
            capitaliseFirstLetter(round.discipline) + ' - ' + round.name;
    },

    reset_header: function() {
        this.$elements.header_distance.text('').removeClass('text-danger');
        this.$elements.header_avg_h_speed.text('').removeClass('text-danger'); 
        this.$elements.header_fl_time.text('').removeClass('text-danger'); 

        this.$elements.header_min_h_speed.text('');
        this.$elements.header_max_h_speed.text('');

        this.$elements.header_min_v_speed.text('');
        this.$elements.header_max_v_speed.text('');
        this.$elements.header_avg_v_speed.text('');

        this.$elements.header_min_gr.text('');
        this.$elements.header_max_gr.text('');
        this.$elements.header_avg_gr.text('');

        this.$elements.header_elevation.text('');
    },

    highlite_result: function() {
        if (this.result.round_discipline === 'distance') {
            this.$elements.header_distance.text(this.result.result).addClass('text-danger'); 
        } else if (this.result.round_discipline === 'speed') {
            this.$elements.header_avg_h_speed.text(this.result.result).addClass('text-danger'); 
        } else if (this.result.round_discipline === 'time') {
            this.$elements.header_fl_time.text(this.result.result).addClass('text-danger'); 
        }
    },

    on_show_modal_shown: function() {
        this.reflow_charts();
        this.$elements.loading_spinner.show();
        $.get(
            this.result.url, 
            this.on_get_track_data.bind(this), 
            'json')
            .fail(this.on_fail_retreive_track_data.bind(this));        
    },

    on_get_track_data: function(data, status, jqXHR) {
        this.$elements.loading_spinner.hide();
        this.track_data = data;

        this.render_track();
        this.update_units();
    },

    init_view_type: function() {
        var view_type = $.cookie('view_type');
        this.display_on_single_chart = view_type == 'single';

        if (view_type == 'single') {
            this.$elements.li_toggle_single.addClass('active');
            this.$elements.single_chart.show();
            this.$elements.multiple_charts.hide();
        } else {
            this.$elements.li_toggle_multi.addClass('active');
            this.$elements.single_chart.hide();
            this.$elements.multiple_charts.show();
        }
    },

    init_units: function() {
        var units = $.cookie('units');
        this.in_imperial = units == 'imperial';

        if (units == 'imperial') {
            this.$elements.li_toggle_imperial.addClass('active');
        } else {
            this.$elements.li_toggle_metric.addClass('active');
        }
    },

    render_track: function() {
        var dist_data = [],
        elev_data = [],
        heights_data = [],
        h_speed = [],
        v_speed = [],
        gr = [],
        raw_h_speed = [],
        raw_v_speed = [],
        raw_gr = [],

        min_h_speed = 0,
        max_h_speed = 0,

        min_v_speed = 0,
        max_v_speed = 0,

        min_gr = 0,
        max_gr = 0,

        fl_time = 0,
        dist = 0,
        elev = 0,

        k = 0,
        mft_un_k = 1,
        km_m_k = 1;

        if (this.in_imperial) {
            mft_un_k = this.mft_k;
            km_m_k = 1.6093;
        }

        var max_val = window.Competition.range_from;
        var min_val = window.Competition.range_to;

        this.index_cache = [];

        var isFirst = true,
        start_found = false,
        end_found = false,
        isLast = false;

        for (var index in this.track_data.points) {

            var current_point = this.track_data.points[index];
            var point = {};

            start_found = start_found || current_point.elevation <= max_val; 
            end_found = end_found || current_point.elevation < min_val;

            if (start_found && !end_found)  {

                point = clone(current_point);

                // Корректировка выбранного диапазона
                if (isFirst) {

                    isFirst = false;
                    if (current_point.elevation != max_val && this.track_data.points.hasOwnProperty(index-1)) {

                        point.elevation = max_val;
                        point.elevation_diff = max_val - current_point.elevation;

                        k = point.elevation_diff / current_point.elevation_diff;

                        point.distance = Math.round(current_point.distance * k);
                        point.fl_time = Math.round(current_point.fl_time * k * 10) / 10;

                    }
                }

                dist += point.distance;
                elev += point.elevation_diff;

                fl_time = Math.round((fl_time + point.fl_time) * 10) / 10;

                elev_data.push([fl_time, Math.round(elev * mft_un_k)]);
                dist_data.push([fl_time, Math.round(dist * mft_un_k)]);
                h_speed.push([fl_time, Math.round(point.h_speed / km_m_k)]);
                v_speed.push([fl_time, Math.round(point.v_speed / km_m_k)]);
                heights_data.push([fl_time, Math.round(point.elevation * mft_un_k)]);
                this.index_cache.push(fl_time);

                gr.push([fl_time, point.glrat]);

                raw_h_speed.push([fl_time, point.raw_h_speed]);
                raw_v_speed.push([fl_time, point.raw_v_speed]);
                raw_gr.push([fl_time, point.raw_gr]);

                min_h_speed = min_h_speed === 0 || min_h_speed > point.h_speed ? point.h_speed : min_h_speed;
                max_h_speed = max_h_speed === 0 || max_h_speed < point.h_speed ? point.h_speed : max_h_speed;

                min_v_speed = min_v_speed === 0 || min_v_speed > point.v_speed ? point.v_speed : min_v_speed;
                max_v_speed = max_v_speed === 0 || max_v_speed < point.v_speed ? point.v_speed : max_v_speed;

                min_gr = min_gr === 0 || min_gr === null || min_gr > point.glrat ? point.glrat : min_gr;
                max_gr = max_gr === 0 || max_gr === null || max_gr < point.glrat ? point.glrat : max_gr;
            }

            if (end_found && elev_data.length > 0) {
                if (current_point.elevation <= min_val && this.track_data.points.hasOwnProperty(index - 1)) {

                    point = clone(current_point);
                    prev_point = this.track_data.points[index - 1];

                    point.elevation_diff = prev_point.elevation - min_val;
                    k = point.elevation_diff / current_point.elevation_diff;

                    point.fl_time = current_point.fl_time * k;
                    point.elevation = min_val;
                    point.distance = Math.round(current_point.distance * k);

                    dist += point.distance;
                    elev += point.elevation_diff;
                    fl_time += Math.round(point.fl_time * 10) / 10;

                    elev_data.push([fl_time, Math.round(elev * mft_un_k)]);
                    dist_data.push([fl_time, Math.round(dist * mft_un_k)]);
                    h_speed.push([fl_time, Math.round(point.h_speed / km_m_k)]);
                    v_speed.push([fl_time, Math.round(point.v_speed / km_m_k)]);
                    heights_data.push([fl_time, Math.round(point.elevation * mft_un_k)]);
                    this.index_cache.push(fl_time);

                    gr.push([fl_time, point.glrat]);

                    raw_h_speed.push([fl_time, point.raw_h_speed]);
                    raw_v_speed.push([fl_time, point.raw_v_speed]);
                    raw_gr.push([fl_time, point.raw_gr]);

                }
                break;
            }
        }

        var dist_in_units = dist;
        if (this.in_imperial){
            dist_in_units = dist * mft_k;
            this.$elements.header_elevation.text((elev * mft_k).toFixed(0));
        } else {
            this.$elements.header_elevation.text(elev.toFixed(0));
        }

        if (this.result.round_discipline !== 'distance') {
            this.$elements.header_distance.text(dist_in_units.toFixed(0));
        }

        if (this.result.round_discipline !== 'time') {
            this.$elements.header_fl_time.text(fl_time.toFixed(1));
        }

        if (this.result.round_discipline !== 'speed') {
            this.$elements.header_avg_h_speed.text(Math.round((dist / fl_time * 3.6) / km_m_k).toString());
        }
        this.$elements.header_min_h_speed.text((min_h_speed / km_m_k).toFixed(0));
        this.$elements.header_max_h_speed.text((max_h_speed / km_m_k).toFixed(0));

        this.$elements.header_min_v_speed.text((min_v_speed / km_m_k).toFixed(0));
        this.$elements.header_max_v_speed.text((max_v_speed / km_m_k).toFixed(0));
        this.$elements.header_avg_v_speed.text(Math.round((elev / fl_time * 3.6) / km_m_k).toString());

        this.$elements.header_min_gr.text(min_gr.toFixed(2));
        this.$elements.header_max_gr.text(max_gr.toFixed(2));
        this.$elements.header_avg_gr.text((dist / elev).toFixed(2));

        if (!this.display_on_single_chart) {
            var ed_chart = this.$elements.elev_chart_container.highcharts();
            ed_chart.series[0].setData(elev_data, false);
            ed_chart.series[1].setData(dist_data, false);
            ed_chart.series[2].setData(heights_data, false);
            ed_chart.redraw();
        }

        if (!this.display_on_single_chart) {
            var sp_chart = this.$elements.spd_chart_container.highcharts();
            sp_chart.series[0].setData(h_speed, false);
            sp_chart.series[1].setData(v_speed, false);
            sp_chart.series[2].setData(raw_h_speed, false);
            sp_chart.series[3].setData(raw_v_speed, false);
            sp_chart.redraw();
        }

        if (!this.display_on_single_chart) {
            var gr_chart = this.$elements.gr_chart_container.highcharts();
            gr_chart.series[0].setData(gr, false);
            gr_chart.series[1].setData(raw_gr, false);
            gr_chart.redraw();
        }

        if (this.display_on_single_chart) {
            var ad_chart = this.$elements.all_data_chart_container.highcharts();
            ad_chart.series[0].setData(h_speed, false);
            ad_chart.series[1].setData(v_speed, false);
            ad_chart.series[2].setData(gr, false);
            ad_chart.series[3].setData(heights_data, false);
            ad_chart.series[4].setData(dist_data, false);
            ad_chart.series[5].setData(elev_data, false);
            ad_chart.redraw();
        }
    },

    sync_tooltip: function(chart_name, point) {
        var index = this.index_cache.indexOf(point);
        var chart, p, p1;

        if (chart_name !== 'glideratio_chart') {
            chart = this.$elements.gr_chart_container.highcharts();
            p = chart.series[0].data[index];
            chart.tooltip.refresh(p);
            chart.xAxis[0].drawCrosshair({ chartX: p.plotX, chartY: p.plotY}, p);
        }

        if (chart_name !== 'speeds_chart') {
            chart = this.$elements.spd_chart_container.highcharts();
            p1 = chart.series[0].data[index];
            chart.tooltip.refresh([p1, chart.series[1].data[index]]);
            chart.xAxis[0].drawCrosshair({ chartX: p1.plotX, chartY: p1.plotY}, p1);
        }

        if (chart_name !== 'elevation_distance_chart') {
            chart = this.$elements.elev_chart_container.highcharts();
            p1 = chart.series[0].data[index];
            chart.tooltip.refresh([p1, chart.series[1].data[index], chart.series[2].data[index]]);
            chart.xAxis[0].drawCrosshair({ chartX: p1.plotX, chartY: p1.plotY}, p1);
        }
    },

    update_units: function() {
        var speed_unit = (this.in_imperial ? I18n.t('units.mph') : I18n.t('units.kmh'));
        var dist_unit = (this.in_imperial ? I18n.t('units.ft') : I18n.t('units.m'));

        $('.spd-unit').text(speed_unit);
        $('.dst-unit').text(dist_unit);

        // elevation/distance chart
        this.$elements.elev_chart_container.highcharts().yAxis[0].update({
            title: {
                text: I18n.t('tracks.show.eldst_dst') + ', ' + dist_unit
            }
        });
        this.$elements.elev_chart_container.highcharts().series[0].update({
            tooltip: {
                valueSuffix: ' ' + dist_unit
            }
        });
        this.$elements.elev_chart_container.highcharts().series[1].update({
            tooltip: {
                valueSuffix: ' ' + dist_unit
            }
        });
        this.$elements.elev_chart_container.highcharts().series[2].update({
            tooltip: {
                valueSuffix: ' ' + dist_unit
            }
        });

        // speeds chart
        this.$elements.spd_chart_container.highcharts().yAxis[0].update({
            title: {
                text: I18n.t('tracks.show.spd_ax') + ', ' + speed_unit
            }
        });
        this.$elements.spd_chart_container.highcharts().series[0].update({
            tooltip: {
                valueSuffix: ' ' + speed_unit
            }
        });
        this.$elements.spd_chart_container.highcharts().series[1].update({
            tooltip: {
                valueSuffix: ' ' + speed_unit
            }
        });

        this.$elements.all_data_chart_container.highcharts().yAxis[0].update({
            title: {
                text: I18n.t('tracks.show.adc_sp_y') + ', ' + speed_unit
            }
        });
        this.$elements.all_data_chart_container.highcharts().yAxis[1].update({
            title: {
                text: I18n.t('tracks.show.adc_ed_y') + ', ' + dist_unit
            }
        });
        this.$elements.all_data_chart_container.highcharts().series[0].update({
            tooltip: {
                valueSuffix: ' ' + speed_unit
            }
        });
        this.$elements.all_data_chart_container.highcharts().series[1].update({
            tooltip: {
                valueSuffix: ' ' + speed_unit
            }
        });
        this.$elements.all_data_chart_container.highcharts().series[3].update({
            tooltip: {
                valueSuffix: ' ' + dist_unit
            }
        });
        this.$elements.all_data_chart_container.highcharts().series[4].update({
            tooltip: {
                valueSuffix: ' ' + dist_unit
            }
        });
        this.$elements.all_data_chart_container.highcharts().series[5].update({
            tooltip: {
                valueSuffix: ' ' + dist_unit
            }
        });
    },

    on_fail_retreive_track_data: function(data, status, jqXHR) {
        this.$dialog.modal('hide');
        fail_ajax_request(data, status, jqXHR);
    },

    on_delete_link_click: function(e) {
        e.preventDefault();
        this.result.destroy();
        this.$dialog.modal('hide');
    },

    /////////////////////////////////////////////////////////
    // Elements events
    //
    
    on_toggle_multi: function (e) {
        e.preventDefault();

        this.display_on_single_chart = false;

        this.$elements.li_toggle_single.removeClass('active');
        this.$elements.li_toggle_multi.addClass('active');

        this.$elements.single_chart.hide();
        this.$elements.multiple_charts.show();

        this.render_track();
        this.reflow_charts();

        $.cookie('view_type', 'multi', { expires: 365, path: '/' });
    },
        
    on_toggle_single: function (e) {
        e.preventDefault();

        this.display_on_single_chart = true;

        this.$elements.li_toggle_single.addClass('active');
        this.$elements.li_toggle_multi.removeClass('active');

        this.$elements.single_chart.show();
        this.$elements.multiple_charts.hide();

        this.render_track();
        this.reflow_charts();

        $.cookie('view_type', 'single', { expires: 365, path: '/' });
    },

    on_toggle_metric: function (e) {
        e.preventDefault();

        if (!this.in_imperial) {
            return;
        };

        this.$elements.toggle_metric_link.addClass('active');
        this.$elements.toggle_imperial_link.removeClass('active');

        this.in_imperial = false;

        this.update_units();
        this.render_track();
        $.cookie('units', 'metric', { expires: 365, path: '/' });
    },

    on_toggle_imperial: function (e) {
        e.preventDefault();

        if (this.in_imperial) {
            return;
        };

        this.$elements.toggle_metric_link.removeClass('active');
        this.$elements.toggle_imperial_link.addClass('active');

        this.in_imperial = true;

        this.update_units();
        this.render_track();
        $.cookie('units', 'imperial', { expires: 365, path: '/'});
    },

    /////////////////////////////////////////////////////////
    // Charts
    //

    init_charts: function() {
        this.init_gr_chart();
        this.init_spd_chart();
        this.init_elev_chart();
        this.init_multi_chart();
    },

    init_gr_chart: function() {
        var context = this;
        this.$elements.gr_chart_container.highcharts({
            chart: {
                type: 'spline',
                marginLeft: 70
            },
            title: {
                text: I18n.t('tracks.show.grch')
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    marker: {
                        radius: 1
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                context.sync_tooltip('glideratio_chart', this.x);
                            }
                        }
                    }
                }
            },
            tooltip: {
                crosshairs: true,
                valueDecimals: 2
            },
            yAxis: {
                min: 0,
                title: {
                    text: ' '
                }
            },
            credits: {
                enabled: false
            },
            series: [
                {
                name: I18n.t('tracks.show.gr_s'),
                color: '#37889B',
                tooltip: {
                    valueSuffix: ''
                },
                zIndex: 2
            },
            {
                name: I18n.t('tracks.show.raw_gr'),
                type: 'line',
                color: '#A6CDCE',
                lineWidth: 7,
                enableMouseTracking: false,
                zIndex: 1,
                visible: false
            }
            ]
        });

        this.$elements.gr_chart_container.highcharts().reflow();
    },

    init_spd_chart: function() {
        var context = this;
        this.$elements.spd_chart_container.highcharts({
            chart: {
                type: 'spline',
                marginLeft: 70
            },
            title: {
                text: I18n.t('tracks.show.spdch')
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    marker: {
                        radius: 1
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                context.sync_tooltip('speeds_chart', this.x);
                            }
                        }
                    }
                }
            },
            yAxis: [{ //Speed yAxis
                min: 0,
                labels: {
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: '',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }],
            tooltip: {
                shared: true,
                crosshairs: true,
                valueDecimals: 0
            },
            credits: {
                enabled: false
            },
            series:
                [
                {
                name: I18n.t('tracks.show.spd_hs'),
                color: '#52A964',
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('tracks.show.spd_vs'),
                color: '#A7414E',
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('tracks.show.raw_ground_speed'),
                type: 'line',
                color: '#AAE3CC',
                enableMouseTracking: false,
                lineWidth: 7,
                visible: false,
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('tracks.show.raw_vertical_speed'),
                type: 'line',
                color: '#DFAFAD',
                enableMouseTracking: false,
                lineWidth: 7,
                visible: false,
                tooltip: {
                    valueSuffix: ''
                }
            }
            ]
        });
        this.$elements.spd_chart_container.highcharts().reflow();
    },

    init_elev_chart: function() {
        var context = this;
        this.$elements.elev_chart_container.highcharts({
            chart: {
                type: 'spline',
                marginLeft: 70
            },
            title: {
                text: I18n.t('tracks.show.eldstch')
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                area: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    marker: {
                        radius: 1
                    },
                    point: {
                        events: {
                            mouseOver: function() {
                                context.sync_tooltip('elevation_distance_chart', this.x);
                            }
                        }
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true
            },
            credits: {
                enabled: false
            },
            series:
                [
                {
                name: I18n.t('tracks.show.eldst_el_s'),
                pointInterval: 10,
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('tracks.show.eldst_dst_s'),
                pointInterval: 10,
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('tracks.show.eldst_h_s'),
                type: 'area',
                fillOpacity: 0.3,
                color: Highcharts.getOptions().colors[0],
                lineWidth: 1,
                tooltip: {
                    valueSuffix: ''
                }
            }
            ]
        });
        this.$elements.elev_chart_container.highcharts().reflow();  
    },

    init_multi_chart: function() {

        this.$elements.all_data_chart_container.highcharts({
            chart: {
                type: 'spline'
            },
            title: {
                text: I18n.t('tracks.show.adc')
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    marker: {
                        radius: 1
                    }
                }
            },
            yAxis: [{ //Speed yAxis
                min: 0,
                title: {
                    text: I18n.t('tracks.show.adc')
                }
            },
            { // Elev, dist yAxis
                min: 0,
                title: {
                    text: I18n.t('tracks.show.adc_ed_y')
                },
                opposite: true
            },
            { // GR yAxis
                min: 0,
                max: 5,
                tickInterval: 0.5,
                title: {
                    text: I18n.t('tracks.show.adc_gr_y')
                },
                opposite: true
            }
            ],
            tooltip: {
                shared: true,
                crosshairs: true
            },
            credits: {
                enabled: false
            },
            series:
                [
                {
                name: I18n.t('tracks.show.adc_hspd'),
                yAxis: 0,
                color: Highcharts.getOptions().colors[2],
                tooltip: {
                    valueSuffix: '',
                    valueDecimals: 0
                }
            },
            {
                name: I18n.t('tracks.show.adc_vspd'),
                yAxis: 0,
                color: Highcharts.getOptions().colors[0],
                tooltip: {
                    valueSuffix: '',
                    valueDecimals: 0
                }
            },
            {
                name: I18n.t('tracks.show.adc_gr_s'),
                yAxis: 2,
                color: Highcharts.getOptions().colors[1],
                tooltip: {
                    valueSuffix: '',
                    valueDecimals: 2
                }
            },
            {
                name: I18n.t('tracks.show.adc_h_s'),
                yAxis: 1,
                color: '#aaa',
                tooltip: {
                    valueSuffix: '',
                    valueDecimals: 0
                }
            },
            {
                name: I18n.t('tracks.show.adc_dst'),
                yAxis: 1,
                color: Highcharts.getOptions().colors[5],
                tooltip: {
                    valueSuffix: '',
                    valueDecimals: 0
                }
            },
            {
                name: I18n.t('tracks.show.adc_ele'),
                yAxis: 1,
                color: Highcharts.getOptions().colors[3],
                tooltip: {
                    valueSuffix: '',
                    valueDecimals: 0
                }
            }
            ]
        });
        this.$elements.all_data_chart_container.highcharts().reflow();  
    },

    reflow_charts: function() {
        this.$elements.gr_chart_container.highcharts().reflow();
        this.$elements.spd_chart_container.highcharts().reflow();
        this.$elements.elev_chart_container.highcharts().reflow();  
        this.$elements.all_data_chart_container.highcharts().reflow();
    },
}
