app.views.SpdChart = Backbone.View.extend({
    
    initialize: function(opts) {
        if (opts.container) {
            this.setElement(opts.container);
        }

        this.render();
    },

    render: function() {
        if (!this.el) { return; }

        var _this = this;

        this.$el.highcharts({
            chart: {
                type: 'spline',
                marginLeft: 70
            },
            title: {
                text: I18n.t('charts.spd.title')
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
                                _this.trigger('pointMouseOver', this.x);
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
                name: I18n.t('charts.spd.series.ground'),
                color: '#52A964',
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('charts.spd.series.vertical'),
                color: '#A7414E',
                tooltip: {
                    valueSuffix: ''
                }
            },
            {
                name: I18n.t('charts.spd.series.raw_ground'),
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
                name: I18n.t('charts.spd.series.raw_vertical'),
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
    },

    setUnits: function(unit) {
        var chart = this.$el.highcharts();

        chart.yAxis[0].update({
            title: {
                text: I18n.t('charts.spd.axis.speed', {unit: unit})
            }
        });

        var valueSuffix = ' ' + unit;
        chart.series[0].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
        chart.series[1].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
        chart.series[2].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
        chart.series[3].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
    },

    drawCrosshair: function(x) {
        var chart = this.$el.highcharts();
        var points = chart.series[0].data;
        var point;
        var index;

        for (var i = 0; i < points.length; i++) {
            if (points[i].x === x) {
                index = i;
                point = points[i];
                break;
            }
        }

        if (index) {
            chart.tooltip.refresh([
                point, 
                chart.series[1].data[index]
            ]);
            chart.xAxis[0].drawCrosshair(
                { 
                    chartX: point.plotX, 
                    chartY: point.plotY
                }, 
                point
            );
        }
    }
});
