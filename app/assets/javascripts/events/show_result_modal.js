var Event = Event || {};

Event.ShowResultModal = function(result) {
    this.result = result;
    this.track_data = {};
    this.index_cache = [];
    
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

        track_uploaded: $('#rm-track-uploaded')
    };
}

Event.ShowResultModal.prototype = {
    open: function() {
        this.$elements.delete_link
            .off('click')
            .on('click', this.on_delete_link_click.bind(this));

        this.$elements.title.text(this.get_title());

        var uploaded_text = 'at ' + this.result.created_at;
        if (this.result.uploaded_by.name) {
            uploaded_text = this.result.uploaded_by.name + ' ' + uploaded_text;
        }
        this.$elements.track_uploaded.text(uploaded_text);

        this.$elements.open_track_link.attr('href', this.result.url);

        this.$dialog
            .off('shown.bs.modal')
            .on('shown.bs.modal', this.on_show_modal_shown.bind(this));

        this.init_charts();
        this.$dialog.modal('show');
    },

    get_title: function() {
        var competitor = window.Competition.competitor_by_id(this.result.competitor_id);
        var round = window.Competition.round_by_id(this.result.round_id);

        return 'Result: ' + competitor.profile.name + ' in ' +
            capitaliseFirstLetter(round.discipline) + ' - ' + round.name;
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
            mft_un_k = mft_k;
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
                    if (current_point.elevation != max_val && Track.charts_data.hasOwnProperty(index-1)) {

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
                if (current_point.elevation <= min_val && Track.charts_data.hasOwnProperty(index - 1)) {

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

        // if (this.in_imperial){
        //     $('#dd_distance').text(Math.round(dist * mft_k));
        //     $('#dd_elevation').text((elev * mft_k).toFixed(0));
        // } else {
        //     $('#dd_distance').text(dist.toFixed(0));
        //     $('#dd_elevation').text(elev.toFixed(0));
        // }
        // $('#dd_fl_time').text(fl_time.toFixed(1));
        //
        // $('#p_min_v_speed').text((min_v_speed / km_m_k).toFixed(0));
        // $('#p_max_v_speed').text((max_v_speed / km_m_k).toFixed(0));
        // $('#p_avg_v_speed').text(Math.round((elev / fl_time * 3.6) / km_m_k).toString());
        //
        // $('#p_min_h_speed').text((min_h_speed / km_m_k).toFixed(0));
        // $('#p_max_h_speed').text((max_h_speed / km_m_k).toFixed(0));
        // $('#p_avg_h_speed').text(Math.round((dist / fl_time * 3.6) / km_m_k).toString());
        //
        // $('#p_min_gr').text(min_gr.toFixed(2));
        // $('#p_max_gr').text(max_gr.toFixed(2));
        // $('#p_avg_gr').text((dist / elev).toFixed(2));


        // var all_data_chart = $('#all_data_chart');
        // var display_multiple_charts = $('#multiple-charts').css('display') !== 'none';
        // var display_all_data_chart = all_data_chart.css('display') !== 'none';
        //
        // if (display_multiple_charts) {
            var ed_chart = this.$elements.elev_chart_container.highcharts();
            ed_chart.series[0].setData(elev_data, false);
            ed_chart.series[1].setData(dist_data, false);
            ed_chart.series[2].setData(heights_data, false);
            ed_chart.redraw();
        //}

        // if (display_multiple_charts) {
            var sp_chart = this.$elements.spd_chart_container.highcharts();
            sp_chart.series[0].setData(h_speed, false);
            sp_chart.series[1].setData(v_speed, false);
            sp_chart.series[2].setData(raw_h_speed, false);
            sp_chart.series[3].setData(raw_v_speed, false);
            sp_chart.redraw();
        // }

        // if (display_multiple_charts) {
            var gr_chart = this.$elements.gr_chart_container.highcharts();
            gr_chart.series[0].setData(gr, false);
            gr_chart.series[1].setData(raw_gr, false);
            gr_chart.redraw();
        // }

        // if (display_all_data_chart) {
        //     var ad_chart = all_data_chart.highcharts();
        //     ad_chart.series[0].setData(h_speed, false);
        //     ad_chart.series[1].setData(v_speed, false);
        //     ad_chart.series[2].setData(gr, false);
        //     ad_chart.series[3].setData(heights_data, false);
        //     ad_chart.series[4].setData(dist_data, false);
        //     ad_chart.series[5].setData(elev_data, false);
        //     ad_chart.redraw();
        // }
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
    // Charts
    //

    init_charts: function() {
        this.init_gr_chart();
        this.init_spd_chart();
        this.init_elev_chart();
    },

    init_gr_chart: function() {
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
                                syncTooltip('glideratio_chart', this.x);
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
                                syncTooltip('speeds_chart', this.x);
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
                                syncTooltip('elevation_distance_chart', this.x);
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

    reflow_charts: function() {
        this.$elements.gr_chart_container.highcharts().reflow();
        this.$elements.spd_chart_container.highcharts().reflow();
        this.$elements.elev_chart_container.highcharts().reflow();  
    },
}
