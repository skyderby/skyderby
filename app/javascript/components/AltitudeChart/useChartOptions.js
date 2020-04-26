import { useMemo } from 'react'
import I18n from 'i18n-js'

import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'
import { msToKmh } from 'utils/unitsConversion'

const chartName = 'AltitudeRangeSelect'

const baseOptions = () => ({
  chart: {
    marginLeft: 16,
    marginRight: 16,
    events: {
      load: function() {
        restoreSeriesVisibility(chartName, this.series)
      }
    }
  },
  title: {
    text: I18n.t('tracks.edit.elev_chart')
  },
  plotOptions: {
    series: {
      marker: {
        radius: 1
      },
      events: {
        legendItemClick: function() {
          saveSeriesVisibility(chartName, this.options.code, !this.visible)
        }
      }
    }
  },
  yAxis: [
    {
      title: {
        text: null
      },
      min: 0,
      labels: {
        x: 25,
        y: -2
      }
    },
    {
      title: {
        text: null
      },
      gridLineWidth: 0,
      min: 0,
      opposite: true,
      visible: false
    }
  ],
  xAxis: {
    minPadding: 0,
    maxPadding: 0
  },
  tooltip: {
    crosshairs: true,
    shared: true
  },
  credits: {
    enabled: false
  },
  legend: {
    enabled: true
  }
})

const useChartOptions = points => {
  const altitudePoints = useMemo(
    () =>
      points.map(el => [
        Math.round((el.flTime - points[0].flTime) * 10) / 10,
        Math.round(el.altitude)
      ]),
    [points]
  )

  const horizontalSpeed = useMemo(
    () =>
      points.map(el => [
        Math.round((el.flTime - points[0].flTime) * 10) / 10,
        Math.round(msToKmh(el.hSpeed))
      ]),
    [points]
  )

  const verticalSpeed = useMemo(
    () =>
      points.map(el => [
        Math.round((el.flTime - points[0].flTime) * 10) / 10,
        Math.round(msToKmh(el.vSpeed))
      ]),
    [points]
  )

  const options = useMemo(
    () => ({
      ...baseOptions(),
      series: [
        {
          name: I18n.t('charts.all_data.series.height'),
          type: 'area',
          code: 'height',
          data: altitudePoints,
          yAxis: 0,
          color: '#9ec8f1',
          tooltip: {
            valueSuffix: ` ${I18n.t('units.m')}`,
            valueDecimals: 0
          }
        },
        {
          name: I18n.t('charts.all_data.series.horiz_speed'),
          type: 'spline',
          code: 'ground_speed',
          data: horizontalSpeed,
          yAxis: 1,
          color: '#52A964',
          lineWidth: 1,
          tooltip: {
            valueSuffix: ` ${I18n.t('units.kmh')}`,
            valueDecimals: 0
          }
        },
        {
          name: I18n.t('charts.all_data.series.vert_speed'),
          type: 'spline',
          code: 'vertical_speed',
          data: verticalSpeed,
          yAxis: 1,
          color: '#A7414E',
          lineWidth: 1,
          tooltip: {
            valueSuffix: ` ${I18n.t('units.kmh')}`,
            valueDecimals: 0
          }
        }
      ]
    }),
    [altitudePoints, horizontalSpeed, verticalSpeed]
  )

  return options
}

export default useChartOptions
