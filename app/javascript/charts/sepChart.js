import {
  tooltipFormatter,
  offsetSeriesX,
  offsetPlotBands,
  offsetPlotLines
} from './utils'
import { convertLength, lengthUnitLabel } from 'utils/units'

export const sep50Series = (points, { units = 'metric', ...options } = {}) => {
  const clampAccuracy = val => Math.round(Math.min(Math.max(val, 0), 15) * 10) / 10

  return {
    name: 'SEP 50',
    type: 'area',
    zones: [
      { value: 0, color: '#A6AFBB' },
      { value: 10, color: '#A6AFBB' },
      { color: '#e3353f' }
    ],
    data:
      points.length > 0
        ? points.map(point => ({
            x: point.flTime - points[0].flTime,
            y: clampAccuracy(point.sep50),
            custom: {
              tooltipValue: Math.round(point.sep50 * 10) / 10,
              altitude: Math.round(convertLength(point.altitude, units)),
              altitudeUnits: lengthUnitLabel(units),
              gpsTime: point.gpsTime
            }
          }))
        : [],
    ...options
  }
}

export const initAccuracyChart = (
  container,
  points,
  { plotLines = [], plotBands = [], units = 'metric', xOffset = 0 } = {}
) => {
  const chartOptions = {
    chart: {
      type: 'area'
    },
    title: undefined,
    credits: { enabled: false },
    legend: { enabled: false },
    plotOptions: {
      area: {
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
    xAxis: {
      plotLines: offsetPlotLines(plotLines, xOffset),
      plotBands: offsetPlotBands(plotBands, xOffset),
      labels: { enabled: false },
      tickLength: 0
    },
    yAxis: [
      {
        min: 0,
        max: 15,
        tickAmount: 3,
        title: undefined,
        labels: {
          enabled: false
        },
        plotLines: [
          {
            value: 10,
            color: '#9e0419',
            dashStyle: 'Dash',
            width: 1,
            zIndex: 5
          }
        ]
      }
    ],
    tooltip: {
      crosshair: true,
      shared: true,
      useHTML: true,
      formatter: tooltipFormatter
    },
    series: offsetSeriesX([sep50Series(points, { units })], xOffset)
  }

  return Highcharts.chart(container, chartOptions)
}
