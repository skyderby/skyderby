Skyderby.views.AllDataChart = Backbone.View.extend({

    chart: {},

    initialize: function(opts) {
        if (opts.container) {
            this.setElement(opts.container);
        }

        this.render();
    },

    render: function() {
        if (!this.el) { return; }

        this.$el.highcharts({
            chart: {
                type: 'spline'
            },
            title: {
                text: I18n.t('charts.all_data.title')
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
                max: 350,
                tickInterval: 25,
                title: {
                    text: I18n.t('charts.all_data.axis.speed')
                }
            },
            { // Elev, dist yAxis
                min: 0,
                title: {
                    text: I18n.t('charts.all_data.axis.distance')
                },
                opposite: true
            },
            { // GR yAxis
                min: 0,
                max: 7,
                tickInterval: 0.5,
                title: {
                    text: I18n.t('charts.all_data.axis.gr')
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
            series: [
                {
                    name: I18n.t('charts.all_data.series.horiz_speed'),
                    yAxis: 0,
                    color: Highcharts.getOptions().colors[2],
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    }
                },
                {
                    name: I18n.t('charts.all_data.series.vert_speed'),
                    yAxis: 0,
                    color: Highcharts.getOptions().colors[0],
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    }
                },
                {
                    name: I18n.t('charts.all_data.series.full_speed'),
                    yAxis: 0,
                    color: '#D6A184',
                    visible: false,
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    }
                },
                {
                    name: I18n.t('charts.all_data.series.gr'),
                    yAxis: 2,
                    color: Highcharts.getOptions().colors[1],
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 2
                    }
                },
                {
                    name: I18n.t('charts.all_data.series.height'),
                    yAxis: 1,
                    color: '#aaa',
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    }
                },
                {
                    name: I18n.t('charts.all_data.series.distance'),
                    yAxis: 1,
                    color: Highcharts.getOptions().colors[5],
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    },
                    visible: false
                },
                {
                    name: I18n.t('charts.all_data.series.elevation'),
                    yAxis: 1,
                    color: Highcharts.getOptions().colors[3],
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    },
                    visible: false
                }
            ]
        });

        this.chart = this.$el.highcharts();

        return this;
    },

    reflow: function() {
        this.chart.reflow();
    },

    setUnits: function(distUnit, speedUnit) {
        var spdValueSuffix = ' ' + speedUnit;
        var distValueSuffix = ' ' + distUnit;

        this.chart.yAxis[0].update({
            title: {
                text: I18n.t('charts.all_data.axis.speed') + ', ' + speedUnit
            }
        });
        this.chart.yAxis[1].update({
            title: {
                text: I18n.t('charts.all_data.axis.distance') + ', ' + distUnit
            }
        });
        this.chart.series[0].update({
            tooltip: {
                valueSuffix: spdValueSuffix
            }
        });
        this.chart.series[1].update({
            tooltip: {
                valueSuffix: spdValueSuffix
            }
        });
        this.chart.series[2].update({
            tooltip: {
                valueSuffix: spdValueSuffix
            }
        });
        this.chart.series[4].update({
            tooltip: {
                valueSuffix: distValueSuffix
            }
        });
        this.chart.series[5].update({
            tooltip: {
                valueSuffix: distValueSuffix
            }
        });
        this.chart.series[6].update({
            tooltip: {
                valueSuffix: distValueSuffix
            }
        });
    },

    hide: function() {
        this.$el.hide();
    },

    show: function() {
        this.$el.show();
    },

    setData: function(data) {
        if (_.has(data, 'h_speed')) {
            this.chart.series[0].setData(data.h_speed, false);
        }

        if (_.has(data, 'v_speed')) {
            this.chart.series[1].setData(data.v_speed, false);
        }

        if (_.has(data, 'full_speed')) {
            this.chart.series[2].setData(data.full_speed, false);
        }

        if (_.has(data, 'gr')) {
            this.chart.series[3].setData(data.gr, false);
        }

        if (_.has(data, 'heights')) {
            this.chart.series[4].setData(data.heights, false);
        }

        if (_.has(data, 'dist')) {
            this.chart.series[5].setData(data.dist, false);
        }

        if (_.has(data, 'elev')) {
            this.chart.series[6].setData(data.elev, false);
        }

        this.chart.redraw();
    }
});
