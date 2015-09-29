Skyderby.views.ElevChart = Backbone.View.extend({

    chart: {},

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

        this.chart = this.$el.highcharts();

        return this;
    },

    reflow: function() {
        this.chart.reflow();
    },

    setUnits: function(unit) {
        this.chart.yAxis[0].update({
            title: {
                text: I18n.t('charts.elev.axis.distance', {unit: unit})
            }
        });

        var valueSuffix = ' ' + unit;
        this.chart.series[0].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
        this.chart.series[1].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
        this.chart.series[2].update({
            tooltip: {
                valueSuffix: valueSuffix
            }
        });
    },

    drawCrosshair: function(x) {
        var points = this.chart.series[0].data;
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
            this.chart.tooltip.refresh([
                point, 
                this.chart.series[1].data[index], 
                this.chart.series[2].data[index]
            ]);
            this.chart.xAxis[0].drawCrosshair(
                { 
                    chartX: point.plotX, 
                    chartY: point.plotY
                }, 
                point
            );
        }
    },

    hide: function() {
        this.$el.hide();
    },

    show: function() {
        this.$el.show();
    },

    setData: function(data) {
        if (_.has(data, 'elev_data')) {
            this.chart.series[0].setData(data.elev_data, false);
        }

        if (_.has(data, 'dist_data')) {
            this.chart.series[1].setData(data.dist_data, false);
        }

        if (_.has(data, 'heights_data')) {
            this.chart.series[2].setData(data.heights_data, false);
        }

        this.chart.redraw();
    }
});
