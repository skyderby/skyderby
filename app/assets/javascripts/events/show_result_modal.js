if (!Event) { Event = {}; }

Event.ShowResultModal = function(result) {
    this.mft_k = 3.280839895;

    this.result = result;
    this.track_data = {};
    this.chart_points = [];
    
    // View settings
    this.in_imperial = false;
    this.display_on_single_chart = false;

    this.charts_view = {};
    
    this.$dialog = $('#show-result-modal');
    this.$elements = {
        title: $('#show-result-modal-title'),

        open_track_link: $('#open-track-link'),
        delete_link: $('#rm-delete'),
        loading_spinner: $('.result-loading-spinner'),

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

        this.charts_view = new Skyderby.views.TrackCharts({
            container: '#track_charts',
            display_in_imperial_units: this.in_imperial,
            display_single_chart: this.display_on_single_chart
        });

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
        this.$elements.header_distance
            .text('')
            .removeClass('text-danger');

        $('#total_distance').text('').hide();

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
            this.$elements.header_distance
                .text(this.result.result)
                .addClass('text-danger')
                .tooltip({title: 'Straight-line distance'});
        } else if (this.result.round_discipline === 'speed') {
            this.$elements.header_avg_h_speed.text(Math.round(this.result.result)).addClass('text-danger'); 
        } else if (this.result.round_discipline === 'time') {
            this.$elements.header_fl_time.text(this.result.result).addClass('text-danger'); 
        }
    },

    on_show_modal_shown: function() {
        this.charts_view.render();

        this.$elements.loading_spinner.show();

        $.get(
            this.result.url, 
            this.on_get_track_data.bind(this), 
            'json')
            .fail(this.on_fail_retreive_track_data.bind(this));        
    },

    on_get_track_data: function(data) {
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
            this.$elements.li_toggle_multi.removeClass('active');
        } else {
            this.$elements.li_toggle_multi.addClass('active');
            this.$elements.li_toggle_single.removeClass('active');
        }
    },

    init_units: function() {
        var units = $.cookie('units');
        this.in_imperial = units == 'imperial';

        if (units == 'imperial') {
            this.$elements.li_toggle_imperial.addClass('active');
            this.$elements.li_toggle_metric.removeClass('active');
        } else {
            this.$elements.li_toggle_metric.addClass('active');
            this.$elements.li_toggle_imperial.removeClass('active');
        }
    },

    render_track: function() {
        var chart_points = [],
        
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

        var isFirst = true,
        start_found = false,
        end_found = false;

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

                chart_points.push(point);

                min_h_speed = min_h_speed === 0 || min_h_speed > point.h_speed ? point.h_speed : min_h_speed;
                max_h_speed = max_h_speed === 0 || max_h_speed < point.h_speed ? point.h_speed : max_h_speed;

                min_v_speed = min_v_speed === 0 || min_v_speed > point.v_speed ? point.v_speed : min_v_speed;
                max_v_speed = max_v_speed === 0 || max_v_speed < point.v_speed ? point.v_speed : max_v_speed;

                min_gr = min_gr === 0 || min_gr === null || min_gr > point.glrat ? point.glrat : min_gr;
                max_gr = max_gr === 0 || max_gr === null || max_gr < point.glrat ? point.glrat : max_gr;
            }

            if (end_found && chart_points.length > 0) {
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

                    chart_points.push(point);
                }
                break;
            }
        }


        var dist_in_units = dist;
        var speed_in_units = dist / fl_time * 3.6;

        if (this.result.round_discipline === 'distance') {
            dist_in_units = this.result.result;
            $('#total_distance')
                .show()
                .text(Math.round(dist))
                .tooltip({title: 'Trajectory (total) distance'});
        }

        if (this.result.round_discipline === 'speed') {
            speed_in_units = this.result.result;
        }

        if (this.in_imperial){
            dist_in_units = dist * mft_k;
            this.$elements.header_elevation.text((elev * mft_k).toFixed(0));
        } else {
            this.$elements.header_elevation.text(elev.toFixed(0));
        }

        this.$elements.header_distance.text(dist_in_units.toFixed(0));
        this.$elements.header_avg_h_speed.text(Math.round(speed_in_units / km_m_k));
        
        if (this.result.round_discipline !== 'time') {
            this.$elements.header_fl_time.text(fl_time.toFixed(1));
        }

        this.$elements.header_min_h_speed.text((min_h_speed / km_m_k).toFixed(0));
        this.$elements.header_max_h_speed.text((max_h_speed / km_m_k).toFixed(0));

        this.$elements.header_min_v_speed.text((min_v_speed / km_m_k).toFixed(0));
        this.$elements.header_max_v_speed.text((max_v_speed / km_m_k).toFixed(0));
        this.$elements.header_avg_v_speed.text(Math.round((elev / fl_time * 3.6) / km_m_k).toString());

        this.$elements.header_min_gr.text(min_gr.toFixed(2));
        this.$elements.header_max_gr.text(max_gr.toFixed(2));
        this.$elements.header_avg_gr.text((dist / elev).toFixed(2));

        this.charts_view.setChartsData(chart_points);
    },

    update_units: function() {
        var speed_unit = (this.in_imperial ? I18n.t('units.mph') : I18n.t('units.kmh'));
        var dist_unit = (this.in_imperial ? I18n.t('units.ft') : I18n.t('units.m'));

        $('.spd-unit').text(speed_unit);
        $('.dst-unit').text(dist_unit);

        this.charts_view.setUnits();
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

        this.$elements.li_toggle_multi.addClass('active');
        this.$elements.li_toggle_single.removeClass('active');

        this.charts_view.toggleMultiChart();

        this.render_track();

        $.cookie('view_type', 'multi', { expires: 365, path: '/' });
    },
        
    on_toggle_single: function (e) {
        e.preventDefault();

        this.display_on_single_chart = true;

        this.$elements.li_toggle_single.addClass('active');
        this.$elements.li_toggle_multi.removeClass('active');

        this.charts_view.toggleSingleChart();

        this.render_track();

        $.cookie('view_type', 'single', { expires: 365, path: '/' });
    },

    on_toggle_metric: function (e) {
        e.preventDefault();

        if (!this.in_imperial) {
            return;
        }

        this.$elements.li_toggle_metric.addClass('active');
        this.$elements.li_toggle_imperial.removeClass('active');

        this.in_imperial = false;

        this.update_units();

        this.charts_view.setMetricUnits();
        
        this.render_track();
        $.cookie('units', 'metric', { expires: 365, path: '/' });
    },

    on_toggle_imperial: function (e) {
        e.preventDefault();

        if (this.in_imperial) {
            return;
        }

        this.$elements.li_toggle_metric.removeClass('active');
        this.$elements.li_toggle_imperial.addClass('active');

        this.in_imperial = true;

        this.charts_view.setImperialUnits();

        this.update_units();
        this.render_track();
        $.cookie('units', 'imperial', { expires: 365, path: '/'});
    }
};
