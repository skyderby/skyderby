import { useMemo } from 'react'
import merge from 'lodash.merge'

import { I18n } from 'components/TranslationsProvider'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'components/Highchart'
import { msToKmh } from 'utils/unitsConversion'
import { PointRecord } from 'api/tracks/points'
import type { Chart, Options, Series } from 'highcharts'

const chartName = 'AltitudeRangeSelect'

function onChartLoad(this: Chart) {
  restoreSeriesVisibility(chartName, this.series)
}

function onLegendItemClick(this: Series) {
  saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
}

const baseOptions = () => ({
  chart: {
    marginLeft: 16,
    marginRight: 16,
    events: {
      load: onChartLoad
    }
  },
  title: {
    text: null
  },
  plotOptions: {
    series: {
      marker: {
        radius: 1
      },
      events: {
        legendItemClick: onLegendItemClick
      }
    }
  },
  yAxis: [
    {
      title: {
        text: null
      },
      min: 0,
      tickInterval: 500,
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
    enabled: false
  }
})

const buildSeries = (points: PointRecord[]) => {
  const startTime = points[0]?.flTime ?? 0

  const altitudePoints = points.map(el => [
    Math.round((el.flTime - startTime) * 10) / 10,
    Math.round(el.altitude)
  ])

  const horizontalSpeed = points.map(el => [
    Math.round((el.flTime - startTime) * 10) / 10,
    Math.round(msToKmh(el.hSpeed))
  ])

  const verticalSpeed = points.map(el => [
    Math.round((el.flTime - startTime) * 10) / 10,
    Math.round(msToKmh(el.vSpeed))
  ])

  return {
    series: [
      {
        name: I18n.t('charts.all_data.series.height'),
        type: 'area',
        custom: {
          code: 'height'
        },
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
        custom: {
          code: 'ground_speed'
        },
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
        custom: {
          code: 'vertical_speed'
        },
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
  }
}

const useChartOptions = (points: PointRecord[], additionalOptions: Options): Options => {
  const series = useMemo(() => buildSeries(points), [points])

  return useMemo(() => merge(baseOptions(), additionalOptions, series), [
    additionalOptions,
    series
  ])
}

export default useChartOptions
