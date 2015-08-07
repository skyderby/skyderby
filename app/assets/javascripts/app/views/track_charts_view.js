Skyderby.views.TrackCharts = Backbone.View.extend({

    display_in_imperial_units: false,
    display_single_chart: false,

    dist_unit: {
        imperial: I18n.t('units.ft'),
        metric: I18n.t('units.m')
    },

    speed_unit: {
        imperial: I18n.t('units.mph'),
        metric: I18n.t('units.kmh')
    },

    initialize: function(opts) {
        if (_.has(opts, 'container')) {
            this.setElement(opts.container);
        }

        if (_.has(opts, 'display_single_chart')) {
            this.display_single_chart = opts.display_single_chart;
        }

        if (_.has(opts, 'display_in_imperial_units')) {
            this.display_in_imperial_units = opts.display_in_imperial_units;
        }

        this.gr_chart = new Skyderby.views.GrChart({
            container: '#glideratio_chart'
        });
        this.spd_chart = new Skyderby.views.SpdChart({
            container: '#speeds_chart'
        });
        this.elev_chart = new Skyderby.views.ElevChart({
            container: '#elevation_distance_chart'
        });
        this.all_data_chart = new Skyderby.views.AllDataChart({
            container: '#all_data_chart'
        });

        this.elev_chart.listenTo(this.spd_chart, 'pointMouseOver', this.elev_chart.drawCrosshair);
        this.elev_chart.listenTo(this.gr_chart,  'pointMouseOver', this.elev_chart.drawCrosshair);

        this.spd_chart.listenTo(this.elev_chart, 'pointMouseOver', this.spd_chart.drawCrosshair);
        this.spd_chart.listenTo(this.gr_chart,   'pointMouseOver', this.spd_chart.drawCrosshair);

        this.gr_chart.listenTo(this.elev_chart,  'pointMouseOver', this.gr_chart.drawCrosshair);
        this.gr_chart.listenTo(this.spd_chart,   'pointMouseOver', this.gr_chart.drawCrosshair);
    },

    render: function() {
        this.setChartsVisibility();
        this.setUnits();
    },
    
    setChartsVisibility: function() {
        if (this.display_single_chart) {
            this.gr_chart.hide();
            this.spd_chart.hide();        
            this.elev_chart.hide();        

            this.all_data_chart.show();        
        } else {
            this.gr_chart.show();
            this.spd_chart.show();        
            this.elev_chart.show();        

            this.all_data_chart.hide();        
        }

        this.reflowCharts();
    },

    toggleSingleChart: function() {
        this.display_single_chart = true;
        this.setChartsVisibility();
    },

    toggleMultiChart: function() {
        this.display_single_chart = false;
        this.setChartsVisibility();
    },

    setImperialUnits: function() {
        this.display_in_imperial_units = true;
        this.setUnits(); 
    },

    setMetricUnits: function() {
        this.display_in_imperial_units = false;
        this.setUnits(); 
    },

    setUnits: function() {
        var unit_system = this.display_in_imperial_units ? 'imperial' : 'metric';
        var dist_unit = this.dist_unit[unit_system];
        var speed_unit = this.speed_unit[unit_system];

        this.elev_chart.setUnits(dist_unit);
        this.spd_chart.setUnits(speed_unit);
        this.all_data_chart.setUnits(dist_unit, speed_unit);
    },

    reflowCharts: function() {
        this.gr_chart.reflow();
        this.elev_chart.reflow();
        this.spd_chart.reflow();
        this.all_data_chart.reflow();    
    },

    setChartsData: function(points) {
        var dist_data = [],
        elev_data = [],
        heights_data = [],

        h_speed = [],
        v_speed = [],
        full_speed = [],

        raw_h_speed = [],
        raw_v_speed = [],
        raw_full_speed = [],

        gr = [],
        raw_gr = [];
 
        var fl_time = 0,
        dist = 0,
        elev = 0;

        var dist_k = this.display_in_imperial_units ? 3.280839895 : 1;
        var spd_k = this.display_in_imperial_units ? 1.6093 : 1;

        for (var i = 0; i < points.length; i++) {
            
            var point = points[i];

            fl_time = Math.round((fl_time + point.fl_time) * 10) / 10;

            dist += point.distance;
            elev += point.elevation_diff;

            elev_data.push([fl_time, Math.round(elev * dist_k)]);
            dist_data.push([fl_time, Math.round(dist * dist_k)]);
            heights_data.push([fl_time, Math.round(point.elevation * dist_k)]);

            h_speed.push([fl_time, Math.round(point.h_speed / spd_k)]);
            v_speed.push([fl_time, Math.round(point.v_speed / spd_k)]);
            full_speed.push([fl_time, Math.round(point.full_speed / spd_k)]);
            raw_h_speed.push([fl_time, Math.round(point.raw_h_speed / spd_k)]);
            raw_v_speed.push([fl_time, Math.round(point.raw_v_speed / spd_k)]);
            raw_full_speed.push([fl_time, Math.round(point.raw_full_speed / spd_k)]);

            gr.push([fl_time, point.glrat]);
            raw_gr.push([fl_time, point.raw_gr]);
        }

        this.gr_chart.setData({
            gr: gr,
            raw_gr: gr
        });

        this.spd_chart.setData({
            h_speed: h_speed,
            v_speed: v_speed,
            full_speed: full_speed,
            raw_h_speed: raw_h_speed,
            raw_v_speed: raw_v_speed,
            raw_full_speed: raw_full_speed
        });

        this.elev_chart.setData({
            elev_data: elev_data,
            dist_data: dist_data,
            heights_data: heights_data
        });

        this.all_data_chart.setData({
            h_speed: h_speed,
            v_speed: v_speed,
            full_speed: full_speed,
            gr: gr,
            elev: elev_data,
            dist: dist_data,
            heights: heights_data 
        });
    }
}); 
