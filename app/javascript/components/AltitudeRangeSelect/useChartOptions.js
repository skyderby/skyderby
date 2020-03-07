import { useMemo } from 'react'
import I18n from 'i18n-js'

import { msToKmh } from 'utils/unitsConversion'

const baseOptions = () => ({
  title: {
    text: I18n.t('tracks.edit.elev_chart')
  },
  plotOptions: {
    series: {
      marker: {
        radius: 1
      }
    }
  },
  yAxis: [
    {
      title: {
        text: null
      }
    },
    {
      title: {
        text: null
      },
      gridLineWidth: 0,
      min: 0,
      opposite: true
    }
  ],
  tooltip: {
    crosshairs: true,
    shared: true
  },
  credits: {
    enabled: false
  },
  legend: {
    enabled: false
  },
  series: [
    {
      name: I18n.t('tracks.edit.elevation'),
      pointInterval: 10,
      tooltip: {
        valueSuffix: ' ' + I18n.t('units.m')
      },
      showInLegend: false
    }
  ]
})

const useChartOptions = points => {
  const altitudePoints = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(el.altitude)
      })),
    [points]
  )

  const horizontalSpeed = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(msToKmh(el.hSpeed))
      })),
    [points]
  )

  const verticalSpeed = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(msToKmh(el.vSpeed))
      })),
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
