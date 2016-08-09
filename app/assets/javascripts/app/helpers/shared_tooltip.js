Skyderby.helpers.shared_tooltip_handler = function (e) {
    var chart, point, i, event;

    var charts = $(this).children('div');

    for (i = 0; i < charts.length; i = i + 1) {
        chart = $(charts[i]).highcharts();
        if (!chart) continue;

        event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart

        var points = [];
        for (j = 0; j < chart.series.length; j = j + 1) {
            serie = chart.series[j];
            if (!serie.visible || serie.enableMouseTracking === false) continue;

            point = serie.searchPoint(event, true);
            if (point) points.push(point); // Get the hovered point
        }

        if (points.length) {
            if (chart.tooltip.shared) {
                chart.tooltip.refresh(points);
            } else {
                chart.tooltip.refresh(points[0]);
            }
            chart.xAxis[0].drawCrosshair(e, points[0]);
        }
    }
};
