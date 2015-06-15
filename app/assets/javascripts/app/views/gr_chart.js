app.views.GrChart = Backbone.View.extend({

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
                text: I18n.t('charts.gr.title')
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
                name: I18n.t('charts.gr.series.gr'),
                color: '#37889B',
                tooltip: {
                    valueSuffix: ''
                },
                zIndex: 2
            },
            {
                name: I18n.t('charts.gr.series.raw_gr'),
                type: 'line',
                color: '#A6CDCE',
                lineWidth: 7,
                enableMouseTracking: false,
                zIndex: 1,
                visible: false
            }
            ]
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
            chart.tooltip.refresh(point);
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
