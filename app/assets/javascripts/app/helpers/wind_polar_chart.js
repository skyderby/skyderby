Skyderby.helpers.init_wind_polar_chart = function(container, chart_data) {
    container.highcharts({

        chart: {
            polar: true
        },

        title: {
            text: 'Winds aloft'
        },

        pane: {
            startAngle: 0,
            endAngle: 360
        },

        tooltip: {
            formatter: function() {
                return '<b>Altitude</b> ' + this.point.options.altitude + ' m <br>' +
                       '<b>Speed:</b> ' + Math.round(Number(this.point.options.wind_speed) * 10) / 10 + ' m/s <br>' +
                       '<b>Direction:</b> ' + Math.round(this.x) + '°';
            }
        },
        xAxis: {
            tickInterval: 45,
            min: 0,
            max: 360,
            labels: {
                formatter: function () {
                    return this.value + '°';
                }
            }
        },

        yAxis: {
            min: 0,
            max: 5,
            tickInterval: 1,
            labels: {
                formatter: function() {
                return this.value + 'k';
              }
            }
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    verticalAlign: 'middle',
                    color: '#606060',
                    formatter: function() {
                      return Math.round(this.point.wind_speed * 10) / 10 + ' m/s';
                    }
                }
            },
            column: {
                pointPadding: 0,
                groupPadding: 0
            }
        },

        legend: {
            enabled: false,
        },

        series: [{
            // color: {
            //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            //     stops: [
            //         [0, 'red'],
            //         [5, 'yellow'],
            //         [10, 'green'],
            //         [15, 'yellow'],
            //         [20, 'red']
            //     ]
            // },
            type: 'scatter',
            name: 'Wind speed',
            data: chart_data,
            pointPlacement: 'between'
        }],

        credits: false,
    });
};
