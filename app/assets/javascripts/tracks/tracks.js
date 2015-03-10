// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

var mft_k = 3.280839895;

var Track = {
        in_imperial: false,
        charts_data: [],
        max_height: 0,
        min_height: 0,
        range_from: 0,
        range_to: 0,
        index_cache: []
    },
    Dict = {};

//////////////////////////////////////////////////////
// VIEW INIT

function init_chart_view() {

    var track_data = $('.track-data');

    Track.charts_data = track_data.data('points');
    Track.max_height = track_data.data('height-max');
    Track.min_height = track_data.data('height-min');

    var params = track_data.data('params');

    if (params.from <= params.to || params.from > Track.max_height || params.to >= Track.max_height) {
        params.from = -1;
        params.to = -1;
    }

    if (params.to < Track.min_height) {
        params.to = -1;
    }

    Track.range_from = params.from == -1 ? Track.max_height : params.from;
    Track.range_to = params.to == -1 ? Track.min_height : params.to;

    Dict = track_data.data('dict');

    init_range_selector();

    init_elev_dist_chart();
    init_spd_chart();
    init_gr_chart();
    init_multi_chart();

    init_units();
    init_view_type();

    init_objects();

    set_chart_data();
    updateRangeSelector();
    updateUnits();

}

function init_edit_view() {

    var track_data = $('.track-edit-data');

    Track.charts_data  = track_data.data('points');
    Track.max_rel_time = track_data.data('max-rel-time');
    Track.range_from   = track_data.data('range-from');
    Track.range_to     = track_data.data('range-to');
    Track.suit         = {
        id: track_data.data('suit-id'),
        name: track_data.data('suit-name')
    };

    if (Track.suit && Track.suit.id) {
        $('<option />', {value: Track.suit.id, text: Track.suit.name})
            .appendTo($('.track-wingsuit-select'));
    }       
        
    $('.track-wingsuit-select').select2({
        width: '100%',
        ajax: {
            url: '/api/wingsuits',
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (term) {
                return {
                    query: term
                };
            },
            processResults: function (data) {
                var suits_data = _.chain(data)
                    .map(function(obj) {
                        return {
                            id: obj.id,
                            text: obj.name,
                            manufacturer: obj.manufacturer.name
                        }
                    })
                    .groupBy(function(obj) { 
                        return obj.manufacturer;
                    })
                    .map(function(obj, key) {
                        return {
                            text: key, 
                            children: obj
                        };
                    })
                    .sortBy(function(obj) {
                        return obj.text;
                    })
                    .value();
                return {
                    results: suits_data
                };
            },
            cache: true
        }
        });


    Dict = track_data.data('dict');

    $("#time-selector").ionRangeSlider({
      min: 0,
      max: Track.max_rel_time,
      type: 'double',
      step: 1,
      prettify: false,
      hasGrid: true,
      from: Track.range_from,
      to: Track.range_to,
      onChange: function (obj) {
        Track.range_from = obj.fromNumber;
        Track.range_to = obj.toNumber;
        set_plot_bands();
      }
    });

    $('#heights-chart').highcharts({
      chart: {
        type: 'area'
      },
      title: {
        text: Dict.heights.titl
      },
      plotOptions: {
        series: {
          marker: {
            radius: 1
          }
        }
      },
      xAxis: {
      plotBands: [{
          color: 'gray',
          from: 0,
          to: 0,
          id: 'plotband-start'
        },
        {
          color: 'gray',
          from: 0,
          to: 0,
          id: 'plotband-end'
        },
      ]},
      tooltip: {
        crosshairs: true
      },
      credits: {
        enabled: false
      },
      series: [{
        name: Dict.heights.elev_s,
        pointInterval: 10,
        tooltip: {
          valueSuffix: Dict.units.m
        },
        data: Track.charts_data
      }]
    });

    set_plot_bands();
}

function init_map_view() {

    Track.charts_data = $('.track-map-data').data('points');
    window.handler = Gmaps.build('Google');
    window.handler.buildMap({ 
            provider: {}, 
            internal: {id: 'map'}
        }, function(){
            draw_map_polyline();
        }
    );

}

function init_earth_view() {
    Track.charts_data = $('.track-earth-data').data('points');
    google.setOnLoadCallback(init_ge);
}

function init_ge() {
    google.earth.createInstance('map3d', initCB, failureCB);
}

function set_plot_bands() {
    chart = $('#heights-chart').highcharts();
    chart.xAxis[0].removePlotBand('plotband-start');
    chart.xAxis[0].removePlotBand('plotband-end');

    chart.xAxis[0].addPlotBand({
                    from: 0,
                    to: Track.range_from,
                    color: 'gray',
                    id: 'plotband-start'
                });

    chart.xAxis[0].addPlotBand({
                    from: Track.range_to,
                    to: Track.max_rel_time,
                    color: 'gray',
                    id: 'plotband-end'
                });

    $('#ff_start').val(Track.range_from);
    $('#ff_end').val(Track.range_to);
}

function init_range_selector() {

    $("#range-selector").ionRangeSlider({
        min: Track.max_height,
        max: Track.min_height,
        type: 'double',
        step: 50,
        prettify: false,
        hasGrid: true,
        from: Track.max_height,
        to: Track.min_height,
        onFinish: function (obj) {      // callback is called on slider action is finished
            if (in_imperial) {
                Track.range_from = obj.fromNumber / mft_k;
                Track.range_to = obj.toNumber / mft_k;
            } else {
                Track.range_from = obj.fromNumber;
                Track.range_to = obj.toNumber;
            }
            window.history.replaceState({}, document.title, "?f=" + Track.range_from + "&t=" + Track.range_to);
            set_chart_data();
        }
    });

}

function init_elev_dist_chart() {

    $('#elevation_distance_chart').highcharts({
        chart: {
            type: 'spline',
            marginLeft: 70
        },
        title: {
            text: Dict.elev_dist.titl
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
            name: Dict.elev_dist.elev_s,
            pointInterval: 10,
            tooltip: {
                valueSuffix: ''
            }
        },
        {
            name: Dict.elev_dist.dist_s,
            pointInterval: 10,
            tooltip: {
                valueSuffix: ''
            }
        },
        {
            name: Dict.elev_dist.height_s,
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

}

function init_spd_chart() {

    $('#speeds_chart').highcharts({
        chart: {
            type: 'spline',
            marginLeft: 70
        },
        title: {
            text: Dict.speed.titl
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
            name: Dict.speed.hs_s,
            color: '#52A964',
            tooltip: {
                valueSuffix: ''
            }
        },
        {
            name: Dict.speed.vs_s,
            color: '#A7414E',
            tooltip: {
                valueSuffix: ''
            }
        },
        {
            name: Dict.speed.rhs_s,
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
            name: Dict.speed.rvs_s,
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

}

function init_gr_chart() {

    $('#glideratio_chart').highcharts({
        chart: {
            type: 'spline',
            marginLeft: 70
        },
        title: {
            text: Dict.gr.titl
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
            name: Dict.gr.gr_s,
            color: '#37889B',
            tooltip: {
                valueSuffix: ''
            },
            zIndex: 2
        },
        {
            name: Dict.gr.rgr_s,
            type: 'line',
            color: '#A6CDCE',
            lineWidth: 7,
            enableMouseTracking: false,
            zIndex: 1,
            visible: false
        }
        ]
    });

}

function init_multi_chart() {

    $('#all_data_chart').highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: Dict.all.titl
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
                text: Dict.all.spd_y
            }
        },
        { // Elev, dist yAxis
            min: 0,
            title: {
                text: Dict.all.ed_y
            },
            opposite: true
        },
        { // GR yAxis
            min: 0,
            max: 5,
            tickInterval: 0.5,
            title: {
                text: Dict.all.gr_y
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
            name: Dict.all.hs_s,
            yAxis: 0,
            color: Highcharts.getOptions().colors[2],
            tooltip: {
                valueSuffix: '',
                valueDecimals: 0
            }
        },
        {
            name: Dict.all.vs_s,
            yAxis: 0,
            color: Highcharts.getOptions().colors[0],
            tooltip: {
                valueSuffix: '',
                valueDecimals: 0
            }
        },
        {
            name: Dict.all.gr_s,
            yAxis: 2,
            color: Highcharts.getOptions().colors[1],
            tooltip: {
                valueSuffix: '',
                valueDecimals: 2
            }
        },
        {
            name: Dict.all.height_s,
            yAxis: 1,
            color: '#aaa',
            tooltip: {
                valueSuffix: '',
                valueDecimals: 0
            }
        },
        {
            name: Dict.all.dist_s,
            yAxis: 1,
            color: Highcharts.getOptions().colors[5],
            tooltip: {
                valueSuffix: '',
                valueDecimals: 0
            }
        },
        {
            name: Dict.all.elev_s,
            yAxis: 1,
            color: Highcharts.getOptions().colors[3],
            tooltip: {
                valueSuffix: '',
                valueDecimals: 0
            }
        }
        ]
    });

}

function updateUnits() {

    var chart;
    var speed_unit = (in_imperial ? Dict.units.mph : Dict.units.kmh);
    var dist_unit = (in_imperial ? Dict.units.ft : Dict.units.m);

    $('.spd-unit').text(speed_unit);
    $('.dst-unit').text(dist_unit);

    // elevation/distance chart
    chart = $('#elevation_distance_chart').highcharts();
    chart.yAxis[0].update({
        title: {
            text: Dict.elev_dist.y + ', ' + dist_unit
        }
    });
    chart.series[0].update({
        tooltip: {
            valueSuffix: ' ' + dist_unit
        }
    });
    chart.series[1].update({
        tooltip: {
            valueSuffix: ' ' + dist_unit
        }
    });
    chart.series[2].update({
        tooltip: {
            valueSuffix: ' ' + dist_unit
        }
    });

    // speeds chart
    chart = $('#speeds_chart').highcharts();
    chart.yAxis[0].update({
        title: {
            text: Dict.speed.y + ', ' + speed_unit
        }
    });
    chart.series[0].update({
        tooltip: {
            valueSuffix: ' ' + speed_unit
        }
    });
    chart.series[1].update({
        tooltip: {
            valueSuffix: ' ' + speed_unit
        }
    });

    chart = $('#all_data_chart').highcharts();
    chart.yAxis[0].update({
        title: {
            text: Dict.all.sp_y + ', ' + speed_unit
        }
    });
    chart.yAxis[1].update({
        title: {
            text: Dict.all.ed_y + ', ' + dist_unit
        }
    });
    chart.series[0].update({
        tooltip: {
            valueSuffix: ' ' + speed_unit
        }
    });
    chart.series[1].update({
        tooltip: {
            valueSuffix: ' ' + speed_unit
        }
    });
    chart.series[3].update({
        tooltip: {
            valueSuffix: ' ' + dist_unit
        }
    });
    chart.series[4].update({
        tooltip: {
            valueSuffix: ' ' + dist_unit
        }
    });
    chart.series[5].update({
        tooltip: {
            valueSuffix: ' ' + dist_unit
        }
    });

}

function updateRangeSelector() {
    if (in_imperial) {
        $('#range-selector').ionRangeSlider('update', {
            min: Math.round(Track.max_height * mft_k),
            max: Math.round(Track.min_height * mft_k),
            from: Math.round(Track.range_from * mft_k),
            to: Math.round(Track.range_to * mft_k) });
    } else {
        $('#range-selector').ionRangeSlider('update', {
            min: Track.max_height,
            max: Track.min_height,
            from: Math.round(Track.range_from),
            to: Math.round(Track.range_to) });
    }
}

function set_chart_data() {

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

    if (Track.in_imperial) {
        mft_un_k = mft_k;
        km_m_k = 1.6093;
    }

    var max_val = typeof Track.range_from !== 'undefined' ? Track.range_from : 100000;
    var min_val = typeof Track.range_to !== 'undefined' ? Track.range_to : 0;

    Track.index_cache = [];

    var isFirst = true,
    start_found = false,
    end_found = false,
    isLast = false;

    for (var index in Track.charts_data) {

        var current_point = Track.charts_data[index];
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

            fl_time += Math.round(point.fl_time * 10) / 10;

            elev_data.push([fl_time, Math.round(elev * mft_un_k)]);
            dist_data.push([fl_time, Math.round(dist * mft_un_k)]);
            h_speed.push([fl_time, Math.round(point.h_speed / km_m_k)]);
            v_speed.push([fl_time, Math.round(point.v_speed / km_m_k)]);
            heights_data.push([fl_time, Math.round(point.elevation * mft_un_k)]);
            Track.index_cache.push(fl_time);

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
                prev_point = Track.charts_data[index - 1];

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
                Track.index_cache.push(fl_time);

                gr.push([fl_time, point.glrat]);

                raw_h_speed.push([fl_time, point.raw_h_speed]);
                raw_v_speed.push([fl_time, point.raw_v_speed]);
                raw_gr.push([fl_time, point.raw_gr]);

            }
            break;
        }
    }

    if (in_imperial){
        $('#dd_distance').text(Math.round(dist * mft_k));
        $('#dd_elevation').text((elev * mft_k).toFixed(0));
    } else {
        $('#dd_distance').text(dist.toFixed(0));
        $('#dd_elevation').text(elev.toFixed(0));
    }
    $('#dd_fl_time').text(fl_time.toFixed(1));

    $('#p_min_v_speed').text((min_v_speed / km_m_k).toFixed(0));
    $('#p_max_v_speed').text((max_v_speed / km_m_k).toFixed(0));
    $('#p_avg_v_speed').text(Math.round((elev / fl_time * 3.6) / km_m_k).toString());

    $('#p_min_h_speed').text((min_h_speed / km_m_k).toFixed(0));
    $('#p_max_h_speed').text((max_h_speed / km_m_k).toFixed(0));
    $('#p_avg_h_speed').text(Math.round((dist / fl_time * 3.6) / km_m_k).toString());

    $('#p_min_gr').text(min_gr.toFixed(2));
    $('#p_max_gr').text(max_gr.toFixed(2));
    $('#p_avg_gr').text((dist / elev).toFixed(2));


    var all_data_chart = $('#all_data_chart');
    var display_multiple_charts = $('#multiple-charts').css('display') !== 'none';
    var display_all_data_chart = all_data_chart.css('display') !== 'none';

    if (display_multiple_charts) {
        var ed_chart = $('#elevation_distance_chart').highcharts();
        ed_chart.series[0].setData(elev_data, false);
        ed_chart.series[1].setData(dist_data, false);
        ed_chart.series[2].setData(heights_data, false);
        ed_chart.redraw();
    }

    if (display_multiple_charts) {
        var sp_chart = $('#speeds_chart').highcharts();
        sp_chart.series[0].setData(h_speed, false);
        sp_chart.series[1].setData(v_speed, false);
        sp_chart.series[2].setData(raw_h_speed, false);
        sp_chart.series[3].setData(raw_v_speed, false);
        sp_chart.redraw();
    }

    if (display_multiple_charts) {
        var gr_chart = $('#glideratio_chart').highcharts();
        gr_chart.series[0].setData(gr, false);
        gr_chart.series[1].setData(raw_gr, false);
        gr_chart.redraw();
    }

    if (display_all_data_chart) {
        var ad_chart = all_data_chart.highcharts();
        ad_chart.series[0].setData(h_speed, false);
        ad_chart.series[1].setData(v_speed, false);
        ad_chart.series[2].setData(gr, false);
        ad_chart.series[3].setData(heights_data, false);
        ad_chart.series[4].setData(dist_data, false);
        ad_chart.series[5].setData(elev_data, false);
        ad_chart.redraw();
    }

}

function syncTooltip(container_id, x) {

    var index = Track.index_cache.indexOf(x);
    var chart, p, p1;

    if (container_id !== 'glideratio_chart') {
        chart = $('#glideratio_chart').highcharts();
        p = chart.series[0].data[index];
        chart.tooltip.refresh(p);
        chart.xAxis[0].drawCrosshair({ chartX: p.plotX, chartY: p.plotY}, p);
    }

    if (container_id !== 'speeds_chart') {
        chart = $('#speeds_chart').highcharts();
        p1 = chart.series[0].data[index];
        chart.tooltip.refresh([p1, chart.series[1].data[index]]);
        chart.xAxis[0].drawCrosshair({ chartX: p1.plotX, chartY: p1.plotY}, p1);
    }

    if (container_id !== 'elevation_distance_chart') {
        chart = $('#elevation_distance_chart').highcharts();
        p1 = chart.series[0].data[index];
        chart.tooltip.refresh([p1, chart.series[1].data[index], chart.series[2].data[index]]);
        chart.xAxis[0].drawCrosshair({ chartX: p1.plotX, chartY: p1.plotY}, p1);
    }

}

function init_view_type() {
    var view_type = $.cookie('view_type');
    if (view_type == 'single') {
        $('#li_toggle_single').addClass('active');
        $('#single-chart').show();
        $('#multiple-charts').hide();
    } else {
        $('#li_toggle_multi').addClass('active');
        $('#single-chart').hide();
        $('#multiple-charts').show();
    }
}

function init_units() {
    var units = $.cookie('units');
    if (units == 'imperial') {
        $('#li_toggle_imperial').addClass('active');
        in_imperial = true;
    } else {
        $('#li_toggle_metric').addClass('active');
        in_imperial = false;
    }
}

function init_objects() {

    $('#toggle_multi').click(function (e) {
        e.preventDefault();

        $('#li_toggle_single').removeClass('active');
        $('#li_toggle_multi').addClass('active');

        $('#single-chart').hide();
        $('#multiple-charts').show();
        set_chart_data();
        $.cookie('view_type', 'multi', { expires: 365, path: '/' });
    });

    $('#toggle_single').click(function (e) {
        e.preventDefault();

        $('#li_toggle_single').addClass('active');
        $('#li_toggle_multi').removeClass('active');

        $('#multiple-charts').hide();
        $('#single-chart').show();
        set_chart_data();
        $.cookie('view_type', 'single', { expires: 365, path: '/' });
    });

    $('#toggle_metric').click(function (e) {
        e.preventDefault();

        var li_toggle_metric = $('#li_toggle_metric');
        var li_toggle_imperial = $('#li_toggle_imperial');

        if (li_toggle_metric.hasClass('active'))
            return;

        li_toggle_metric.addClass('active');
        li_toggle_imperial.removeClass('active');

        in_imperial = false;

        updateRangeSelector();
        updateUnits();
        set_chart_data();
        $.cookie('units', 'metric', { expires: 365, path: '/' });
    });

    $('#toggle_imperial').click(function (e) {
        e.preventDefault();

        var li_toggle_metric = $('#li_toggle_metric');
        var li_toggle_imperial = $('#li_toggle_imperial');

        if (li_toggle_imperial.hasClass('active'))
            return;

        li_toggle_metric.removeClass('active');
        li_toggle_imperial.addClass('active');

        in_imperial = true;

        updateRangeSelector();
        updateUnits();
        set_chart_data();
        $.cookie('units', 'imperial', { expires: 365, path: '/'});
    });

    $('#range-from, #range-to').keypress(function (e) {
        //if the letter is not digit then display error and don't type anything
        if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });

    $('#range-edit-button').click(function (){
        var k = (in_imperial ? mft_k : 1);
        $('#range-from').val(Math.round(Track.range_from * k));
        $('#range-to').val(Math.round(Track.range_to * k));
    });

    $('#edit-range').on('shown.bs.modal', function () {
        $('#range-from').focus();
    });

    $('#range-from').keydown(function (e) {
        if (e.which == 9 || e.which == 13) {
            $('#range-to').focus();
            e.preventDefault();
        }
    });

    $('#range-to').keydown(function (e) {
        if (e.which == 9 || e.which == 13) {
            $('#apply-new-range').focus();
            e.preventDefault();
        }
    });

    $('#apply-new-range').click(function () {
        var tmp_range_from = $('#range-from').val();
        var tmp_range_to = $('#range-to').val();

        var k = (in_imperial ? mft_k : 1);

        if (tmp_range_from > Track.max_height * k)
            tmp_range_from = Math.round(Track.max_height * k);

        if (tmp_range_to < Track.min_height * k)
            tmp_range_to = Math.round(Track.min_height * k);

        Track.range_from = tmp_range_from / k;
        Track.range_to = tmp_range_to / k;

        updateRangeSelector();

        window.history.replaceState({}, document.title, "?f=" + Track.range_from + "&t=" + Track.range_to);
        set_chart_data();

    });

}

function speed_group(speed) {
    if (speed > 250) {
      return 6;
    } else if (speed > 220) {
      return 5;
    } else if (speed > 190) {
      return 4;
    } else if (speed > 160) {
      return 3;
    } else if (speed > 130) {
      return 2;
    } else {
      return 1;
    }
}

function speed_group_color(spd_group) {
    if (spd_group == 1) {
      return 'aa2e7e2d';
    } else if (spd_group == 2) {
      return 'aa43c042';
    } else if (spd_group == 3) {
      return 'aa34ced9';
    } else if (spd_group == 4) {
      return 'aa0f67e4';
    } else if (spd_group == 5) {
      return 'aa0c00e7';
    } else if (spd_group == 6) {
      return 'aa0c0060';
    }
}


function draw_map_polyline() {
    var polyline = [];
    var prev_point = null;

    for (var index in Track.charts_data) {
      current_point = Track.charts_data[index];
      if (polyline.length === 0 || (speed_group(prev_point.h_speed) == speed_group(current_point.h_speed))) {
        polyline.push({'lat': current_point.latitude, 'lng': current_point.longitude});
      } else {
        window.handler.addPolyline(polyline,
                              { strokeColor: $('.hl' + speed_group(prev_point.h_speed)).css( "background-color" ),
                              strokeOpacity: 1, strokeWeight: 6});
        polyline = [];
        polyline.push({'lat': prev_point.latitude, 'lng': prev_point.longitude});
      }
      prev_point = current_point;
    }

    window.handler.addPolyline(polyline,
                        { strokeColor: $('.hl' + speed_group(prev_point.h_speed)).css( "background-color" ),
                        strokeOpacity: 1, strokeWeight: 6});
    window.handler.bounds.extend({'lat': Track.charts_data[0].latitude, 'lng': Track.charts_data[0].longitude});
    window.handler.bounds.extend({'lat': Track.charts_data[Track.charts_data.length - 1].latitude, 'lng': Track.charts_data[Track.charts_data.length - 1].longitude});
    window.handler.fitMapToBounds();
}

function initCB(instance) {
    window.ge = instance;
    window.ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
    draw_polyline();
    window.ge.getWindow().setVisibility(true);
    var la = ge.createLookAt('');
    la.set(Track.charts_data[0].latitude, Track.charts_data[0].longitude, 0, ge.ALTITUDE_ABSOLUTE, -8.541, 66.213, Track.charts_data[0].elevation + 2000);
    window.ge.getView().setAbstractView(la);
}

function failureCB(errorCode) {
}

function draw_polyline() {

    // Создадим метку.
    var lineStringPlacemark = ge.createPlacemark('');
    // Создадим ломаную линию, зададим высоту.
    var lineString = ge.createLineString('');
    lineStringPlacemark.setGeometry(lineString);
    //lineString.setExtrude(true);
    lineString.setAltitudeMode(ge.ALTITUDE_ABSOLUTE);

    var polyline_length = 0;
    var prev_point = null;

    for (var index in Track.charts_data) {

      current_point = Track.charts_data[index];

      if (polyline_length == 0 || (speed_group(prev_point.h_speed) == speed_group(current_point.h_speed))) {

        lineString.getCoordinates().pushLatLngAlt(current_point.latitude, current_point.longitude, current_point.elevation);
        polyline_length += 1;

      } else {

        // Определим стиль, ширину и цвет линии.
        lineStringPlacemark.setStyleSelector(ge.createStyle(''));
        var lineStyle = lineStringPlacemark.getStyleSelector().getLineStyle();
        lineStyle.setWidth(5);
        lineStyle.getColor().set(speed_group_color(speed_group(prev_point.h_speed)));

        // Добавим компонент в Планету Земля.
        ge.getFeatures().appendChild(lineStringPlacemark);

        polyline_length = 0;
        // Создадим метку.
        var lineStringPlacemark = ge.createPlacemark('');
        // Создадим ломаную линию, зададим высоту.
        var lineString = ge.createLineString('');
        lineStringPlacemark.setGeometry(lineString);
        //lineString.setExtrude(true);
        lineString.setAltitudeMode(ge.ALTITUDE_ABSOLUTE);

        lineString.getCoordinates().pushLatLngAlt(prev_point.latitude, prev_point.longitude, prev_point.elevation);
        polyline_length += 1;

      }

      prev_point = current_point;

    }

    // Определим стиль, ширину и цвет линии.
    lineStringPlacemark.setStyleSelector(ge.createStyle(''));
    var lineStyle = lineStringPlacemark.getStyleSelector().getLineStyle();
    lineStyle.setWidth(5);
    lineStyle.getColor().set(speed_group_color(speed_group(prev_point.h_speed)));

    // Добавим компонент в Планету Земля.
    ge.getFeatures().appendChild(lineStringPlacemark);

}


$(document).on('ready page:load', function() {
    if ($('.track-data').length) {
        init_chart_view();	
    } else if ($('.track-edit-data').length) {
        init_edit_view();
    } else if ($('.track-map-data').length) {
        init_map_view();        
    } else if ($('.track-earth-data').length) {
        init_earth_view();
    }
});
