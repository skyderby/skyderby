import I18n from 'i18n'
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'
import {
  restoreSeriesVisibility,
  saveSeriesVisibility,
  tooltipFormatter,
  offsetSeriesX,
  offsetPlotBands,
  offsetPlotLines
} from './utils'
import { convertLength, lengthUnitLabel } from 'utils/units'

export const calculateCumulativeDistance = (
  points,
  { straightLine = false, rangeStartPosition = 0 } = {}
) => {
  if (points.length === 0) return []

  const firstPointTime = points[0].flTime
  let rangeStartIndex = points.findIndex(
    point => point.flTime - firstPointTime >= rangeStartPosition
  )
  if (rangeStartIndex === -1) rangeStartIndex = 0

  const rangeStartPoint = points[rangeStartIndex]
  const rangeStartCoords = new LatLon(rangeStartPoint.latitude, rangeStartPoint.longitude)
  const rangeStartAltitude = rangeStartPoint.altitude
  let cumulativeDistance = 0

  return points.map((point, index) => {
    const elevation = Math.max(0, rangeStartAltitude - point.altitude)

    if (index > rangeStartIndex) {
      const currentCoords = new LatLon(point.latitude, point.longitude)

      if (straightLine) {
        cumulativeDistance = rangeStartCoords.distanceTo(currentCoords)
      } else {
        const prevPoint = points[index - 1]
        const prevCoords = new LatLon(prevPoint.latitude, prevPoint.longitude)
        cumulativeDistance += prevCoords.distanceTo(currentCoords)
      }
    }
    return { ...point, cumulativeDistance, elevation }
  })
}

export const elevationSeries = (
  pointsWithDistance,
  { units = 'metric', ...options } = {}
) => ({
  name: I18n.t('charts.elev.series.elevation'),
  custom: {
    code: 'elevation'
  },
  type: 'spline',
  data: pointsWithDistance.map(point => ({
    x: point.flTime - pointsWithDistance[0].flTime,
    y: Math.round(convertLength(point.elevation, units)),
    custom: {
      tooltipValue: `${Math.round(convertLength(point.elevation, units))} ${lengthUnitLabel(units)}`,
      altitude: Math.round(convertLength(point.altitude, units)),
      altitudeUnits: lengthUnitLabel(units),
      gpsTime: point.gpsTime
    }
  })),
  yAxis: 1,
  ...options
})

export const distanceSeries = (
  pointsWithDistance,
  { units = 'metric', ...options } = {}
) => ({
  name: I18n.t('charts.elev.series.distance'),
  custom: {
    code: 'distance'
  },
  type: 'spline',
  data: pointsWithDistance.map(point => ({
    x: point.flTime - pointsWithDistance[0].flTime,
    y: Math.round(convertLength(point.cumulativeDistance, units)),
    custom: {
      tooltipValue: `${Math.round(convertLength(point.cumulativeDistance, units))} ${lengthUnitLabel(units)}`,
      altitude: Math.round(convertLength(point.altitude, units)),
      altitudeUnits: lengthUnitLabel(units),
      gpsTime: point.gpsTime
    }
  })),
  yAxis: 1,
  ...options
})

export const altitudeSeries = (points, { units = 'metric', ...options } = {}) => ({
  name: I18n.t('charts.all_data.series.height'),
  custom: {
    code: 'height'
  },
  type: 'area',
  data: points.map(point => ({
    x: point.flTime - points[0].flTime,
    y: Math.round(convertLength(point.altitude, units)),
    custom: {
      tooltipValue: Math.round(convertLength(point.altitude, units)),
      altitude: Math.round(convertLength(point.altitude, units)),
      altitudeUnits: lengthUnitLabel(units),
      gpsTime: point.gpsTime
    }
  })),
  yAxis: 0,
  color: '#7cb5ec',
  ...options
})

export const initAltitudeDistanceChart = (
  container,
  points,
  {
    plotLines = [],
    plotBands = [],
    straightLine = false,
    rangeStartPosition = 0,
    units = 'metric',
    xOffset = 0
  } = {}
) => {
  const chartName = 'AltitudeDistance'
  const pointsWithDistance = calculateCumulativeDistance(points, {
    straightLine,
    rangeStartPosition
  })

  const chartOptions = {
    chart: {
      type: 'spline',
      styledMode: true,
      events: {
        load: function () {
          restoreSeriesVisibility(chartName, this.series)
        }
      }
    },
    title: {
      text: I18n.t('charts.elev.title'),
      style: { color: '#777', fontSize: '16px' }
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
        events: {
          legendItemClick: function () {
            saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
          }
        }
      }
    },
    xAxis: {
      plotLines: offsetPlotLines(plotLines, xOffset),
      plotBands: offsetPlotBands(plotBands, xOffset)
    },
    yAxis: [
      {
        min: 0,
        title: {
          text: ''
        },
        labels: {
          x: 20,
          y: -2
        }
      },
      {
        min: 0,
        title: {
          text: ''
        },
        gridLineWidth: 0,
        opposite: true
      }
    ],
    tooltip: {
      shared: true,
      crosshairs: true,
      useHTML: true,
      formatter: tooltipFormatter
    },
    credits: { enabled: false },
    series: offsetSeriesX(
      [
        altitudeSeries(pointsWithDistance, { units }),
        elevationSeries(pointsWithDistance, { units }),
        distanceSeries(pointsWithDistance, { units })
      ],
      xOffset
    )
  }

  return Highcharts.chart(container, chartOptions)
}
