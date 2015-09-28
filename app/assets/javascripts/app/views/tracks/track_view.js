Skyderby.views.TrackView = Backbone.View.extend({

    template: JST['app/templates/track_show'],

    view_type: 'separate_charts',
    units: 'metric',

    events: {
        'click #toggle_single'  : 'on_toggle_single',
        'click #toggle_multi'   : 'on_toggle_multi',
        'click #toggle_metric'  : 'on_toggle_metric',
        'click #toggle_imperial': 'on_toggle_imperial',
        'click #rm-delete'      : 'on_click_delete_track'
    },

    initialize: function(opts) {
        if (_.has(opts, 'track_id')) this.track_id = opts.track_id;
        if (_.has(opts, 'result')) {
            this.discipline = opts.result.get('round_discipline');
            this.result = opts.result.get('result');  
        }

        if (_.has(opts, 'parent_view')) {
            this.listenTo(opts.parent_view, 'modal:shown', this.on_modal_shown);
            this.listenTo(opts.parent_view, 'modal:hidden', this.on_modal_hidden);
        }

        if ($.cookie('view_type') === 'single') this.view_type = 'single_chart';
        if ($.cookie('units') === 'imperial') this.view_type = 'imperial';

        this.on('change:view_type', this.on_change_view_type);
        this.on('change:units', this.on_change_units);
    },

    render: function() {
        this.$el.html(this.template());

        this.charts_view = new Skyderby.views.TrackCharts({
            el: '#track_charts',
            display_in_imperial_units: this.units === 'imperial',
            display_single_chart: this.view_type === 'single_chart'
        });

        this.on_change_units();
        this.on_change_view_type();

        if (_.has(this, 'model')) {
            this.on_load_data();
        } else {
            this.model = new Skyderby.models.Track({id: this.track_id});
            this.listenToOnce(this.model, 'sync', this.on_load_data.bind(this));

            this.model.fetch();
        }

        return this;
    },

    on_load_data: function() {
        this.hide_spinner();
        this.render_track();
        this.update_units();
        this.highlite_result();
    },

    hide_spinner: function() {
        this.$('.result-loading-spinner').hide();
    },

    on_modal_shown: function() {
        this.charts_view.render();
    },

    on_modal_hidden: function() {
        this.remove();
    },

    on_toggle_single: function(e) {
        e.preventDefault();

        if (this.view_type === 'single_chart') return;

        this.view_type = 'single_chart';
        this.trigger('change:view_type');
        this.render_track();
    },

    on_toggle_multi: function(e) {
        e.preventDefault();
        
        if (this.view_type === 'separate_charts') return;

        this.view_type = 'separate_charts';
        this.trigger('change:view_type');
        this.render_track();
    },

    on_toggle_metric: function(e) {
        e.preventDefault();

        if (this.units === 'metric') return;

        this.units = 'metric';
        this.trigger('change:units');
        this.render_track();
    },

    on_toggle_imperial: function(e) {
        e.preventDefault();
        
        if (this.units === 'imperial') return;

        this.units = 'imperial';
        this.trigger('change:units');
        this.render_track();
    },

    on_change_units: function() {
        if (this.units === 'imperial') {
            this.$('#li_toggle_metric').removeClass('active');
            this.$('#li_toggle_imperial').addClass('active');

            this.charts_view.setImperialUnits();
            $.cookie('units', 'imperial', { expires: 365, path: '/'});
        } else {
            this.$('#li_toggle_metric').addClass('active');
            this.$('#li_toggle_imperial').removeClass('active');

            this.charts_view.setMetricUnits();
            $.cookie('units', 'metric', { expires: 365, path: '/' });
        }

        this.update_units();
    },

    on_change_view_type: function() {
        if (this.view_type === 'separate_charts') {
            this.$('#li_toggle_single').removeClass('active');
            this.$('#li_toggle_multi').addClass('active');

            this.charts_view.toggleMultiChart();
            $.cookie('view_type', 'multi', { expires: 365, path: '/' });
        } else {
            this.$('#li_toggle_single').addClass('active');
            this.$('#li_toggle_multi').removeClass('active');

            this.charts_view.toggleSingleChart();
            $.cookie('view_type', 'single', { expires: 365, path: '/' });
        }
    },

    update_units: function() {
        var in_imperial = this.units === 'imperial';

        var speed_unit = (in_imperial ? I18n.t('units.mph') : I18n.t('units.kmh'));
        var dist_unit = (in_imperial ? I18n.t('units.ft') : I18n.t('units.m'));

        $('.spd-unit').text(speed_unit);
        $('.dst-unit').text(dist_unit);

        this.charts_view.setUnits();
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
        mft_k = 3.280839895,
        km_m_k = 1;

        if (this.units === 'imperial') {
            mft_un_k = mft_k;
            km_m_k = 1.6093;
        }

        var max_val = window.Competition.get('range_from');
        var min_val = window.Competition.get('range_to');

        var isFirst = true,
        start_found = false,
        end_found = false;

        var track_points = this.model.get('points');

        for (var index in track_points) {

            var current_point = track_points[index];
            var point = {};

            start_found = start_found || current_point.elevation <= max_val; 
            end_found = end_found || current_point.elevation < min_val;

            if (start_found && !end_found)  {

                point = clone(current_point);

                // Корректировка выбранного диапазона
                if (isFirst) {

                    isFirst = false;
                    if (current_point.elevation != max_val && track_points.hasOwnProperty(index-1)) {

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
                if (current_point.elevation <= min_val && track_points.hasOwnProperty(index - 1)) {

                    point = clone(current_point);
                    prev_point = track_points[index - 1];

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

        if (this.discipline === 'speed') {
            speed_in_units = this.result;
        }

        if (this.units === 'imperial'){
            dist_in_units = dist * mft_k;
            this.$('#dd_elevation').text((elev * mft_k).toFixed(0));
        } else {
            this.$('#dd_elevation').text(elev.toFixed(0));
        }

        if (this.discipline === 'distance') {
            if (this.units === 'imperial') {
                this.$('#dd_distance').text((this.result * mft_k).toFixed(0));
                $('#total_distance')
                    .show()
                    .text(Math.round(dist_in_units))
                    .tooltip({title: 'Trajectory (total) distance'});
            } else {
                this.$('#dd_distance').text(this.result.toFixed(0));
                $('#total_distance')
                    .show()
                    .text(Math.round(dist))
                    .tooltip({title: 'Trajectory (total) distance'});
            }
        } else {
            this.$('#dd_distance').text(dist_in_units.toFixed(0));
        }

        this.$('#p_avg_h_speed').text(Math.round(speed_in_units / km_m_k));
        
        if (this.discipline !== 'time') {
            this.$('#dd_fl_time').text(fl_time.toFixed(1));
        }

        this.$('#p_min_h_speed').text((min_h_speed / km_m_k).toFixed(0));
        this.$('#p_max_h_speed').text((max_h_speed / km_m_k).toFixed(0));

        this.$('#p_min_v_speed').text((min_v_speed / km_m_k).toFixed(0));
        this.$('#p_max_v_speed').text((max_v_speed / km_m_k).toFixed(0));
        this.$('#p_avg_v_speed').text(Math.round((elev / fl_time * 3.6) / km_m_k).toString());

        this.$('#p_min_gr').text(min_gr.toFixed(2));
        this.$('#p_max_gr').text(max_gr.toFixed(2));
        this.$('#p_avg_gr').text((dist / elev).toFixed(2));

        this.charts_view.setChartsData(chart_points);
    },

    highlite_result: function() {
        if (this.discipline === 'distance') {
            this.$('#dd_distance').text(this.result).addClass('text-danger')
                .tooltip({title: 'Straight-line distance'});
        } else if (this.discipline === 'speed') {
            this.$('#p_avg_h_speed').text(Math.round(this.result)).addClass('text-danger'); 
        } else if (this.discipline === 'time') {
            this.$('#dd_fl_time').text(this.result).addClass('text-danger'); 
        }
    },
});
