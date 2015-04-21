var Track = Track || {};

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
        text: I18n.t('tracks.edit.elev_chart')
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
        name: I18n.t('tracks.edit.elevation'),
        pointInterval: 10,
        tooltip: {
          valueSuffix: I18n.t('units.m')
        },
        data: Track.charts_data
      }]
    });

    set_plot_bands();
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

$(document).on('ready page:load', function() {
    if ($('.track-edit-data').length) {
        init_edit_view();
    }
});
