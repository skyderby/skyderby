Skyderby.views.GrChart = Backbone.View.extend({

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

        this.chart = this.$el.highcharts();

        return this;
    },

    reflow: function() {
        this.chart.reflow();
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
            this.chart.tooltip.refresh(point);
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
        if (_.has(data, 'gr')) {
            this.chart.series[0].setData(data.gr, false);
        }

        if (_.has(data, 'raw_gr')) {
            this.chart.series[1].setData(data.raw_gr, false);
        }

        this.chart.redraw();
    }

});
