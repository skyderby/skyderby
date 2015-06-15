Skyderby.views.ElevChart = Backbone.View.extend({

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
                text: I18n.t('charts.elev.title')
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
                                _this.trigger('pointMouseOver', this.x);
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
            series: [
                {
                    name: I18n.t('charts.elev.series.elevation'),
                    pointInterval: 10,
                    tooltip: {
                        valueSuffix: ''
                    }
                },
                {
                    name: I18n.t('charts.elev.series.distance'),
                    pointInterval: 10,
                    tooltip: {
                        valueSuffix: ''
                    }
                },
                {
                    name: I18n.t('charts.elev.series.height'),
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

        return this;
    },

    setUnits: function(unit) {
        var chart = this.$el.highcharts();

        chart.yAxis[0].update({
            title: {
                text: I18n.t('charts.elev.axis.distance', {unit: unit})
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
                chart.series[1].data[index], 
                chart.series[2].data[index]
            ]);
            chart.xAxis[0].drawCrosshair(
                { 
                    chartX: point.plotX, 
                    chartY: point.plotY
                }, 
                point
            );
        }
    },
});
