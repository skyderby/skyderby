import { useMemo } from 'react'
import {
  AxisLabelsFormatterContextObject,
  Chart,
  Options,
  Point,
  Series,
  SeriesOptionsType,
  TooltipFormatterContextObject
} from 'highcharts'

import { I18n } from 'components/TranslationsProvider'
import { METRIC, UnitSystem } from 'components/TrackViewPreferences'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'components/Highchart/utils'

import { calculateSpeedPoints } from '../calculateSpeedPoints'
import { calculateGlideRatioPoints } from '../calculateGlideRatioPoints'
import { PointRecord } from 'api/hooks/tracks/points'

const chartName = 'CombinedChart'

const baseOptions = (): Options => ({
  chart: {
    height: 600,
    events: {
      load: function (this: Chart): void {
        restoreSeriesVisibility(chartName, this.series)
      }
    }
  },
  title: undefined,
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
      events: {
        legendItemClick: function (this: Series): void {
          saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
        }
      },
      states: {
        inactive: {
          enabled: false
        }
      }
    }
  },
  xAxis: {
    crosshair: true
  },
  yAxis: [
    {
      title: {
        text: I18n.t('charts.all_data.series.height')
      },
      tickInterval: 200
    },
    {
      title: {
        text: I18n.t('charts.all_data.axis.speed')
      },
      gridLineWidth: 0,
      opposite: true
    },
    {
      min: 0,
      max: 7,
      startOnTick: false,
      endOnTick: false,
      minPadding: 0.2,
      maxPadding: 0.2,
      gridLineWidth: 0,
      title: {
        text: I18n.t('charts.all_data.axis.gr')
      },
      labels: {
        formatter: function (this: AxisLabelsFormatterContextObject<number>) {
          return this.isLast ? '≥ 7' : String(this.value)
        }
      },
      opposite: true
    },
    {
      min: 0,
      max: 50,
      visible: false
    }
  ],
  tooltip: {
    shared: true,
    formatter: function (this: TooltipFormatterContextObject) {
      const points = this.points ?? []
      return points
        .map(point => {
          const seriesName = point.series.name
          const value = point.point.options.custom?.trueValue || point.y
          const valueSuffix = point.series.options.tooltip?.valueSuffix || ''

          return `${seriesName}: ${value} ${valueSuffix}`
        })
        .join('<br />')
    }
  },
  credits: {
    enabled: false
  }
})

const useChartOptions = (
  points: PointRecord[],
  zeroWindPoints: PointRecord[],
  unitSystem: UnitSystem,
  additionalSeries: SeriesOptionsType[] = []
): Options => {
  const speedUnits = unitSystem === METRIC ? 'kmh' : 'mph'
  const altitudeUnits = unitSystem === METRIC ? 'm' : 'ft'

  const { verticalSpeed, horizontalSpeed, fullSpeed, zeroWindSpeed } = useMemo(
    () => calculateSpeedPoints(points, zeroWindPoints, unitSystem),
    [points, zeroWindPoints, unitSystem]
  )

  const { glideRatio, zeroWindGlideRatio } = useMemo(
    () => calculateGlideRatioPoints(points, zeroWindPoints),
    [points, zeroWindPoints]
  )

  const altitudePoints = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(el.altitude)
      })),
    [points]
  )

  return {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.all_data.series.height'),
        custom: {
          code: 'height'
        },
        type: 'spline' as const,
        data: altitudePoints,
        yAxis: 0,
        color: '#aaa',
        tooltip: {
          valueSuffix: ` ${I18n.t('units.' + altitudeUnits)}`,
          valueDecimals: 0
        }
      },
      {
        name: I18n.t('charts.all_data.series.horiz_speed'),
        custom: {
          code: 'ground_speed'
        },
        type: 'spline' as const,
        data: horizontalSpeed,
        yAxis: 1,
        color: '#52A964',
        tooltip: {
          valueSuffix: ` ${I18n.t('units.' + speedUnits)}`,
          valueDecimals: 0
        }
      },
      {
        name: I18n.t('charts.all_data.series.vert_speed'),
        custom: {
          code: 'vertical_speed'
        },
        type: 'spline' as const,
        data: verticalSpeed,
        yAxis: 1,
        color: '#A7414E',
        tooltip: {
          valueSuffix: ` ${I18n.t('units.' + speedUnits)}`,
          valueDecimals: 0
        }
      },
      {
        name: I18n.t('charts.all_data.series.full_speed'),
        custom: {
          code: 'full_speed'
        },
        type: 'spline' as const,
        data: fullSpeed,
        yAxis: 1,
        color: '#D6A184',
        visible: false,
        tooltip: {
          valueSuffix: ` ${I18n.t('units.' + speedUnits)}`,
          valueDecimals: 0
        }
      },
      {
        name: I18n.t('charts.spd.series.wind_effect'),
        custom: {
          code: 'speed_wind_effect'
        },
        data: zeroWindSpeed,
        yAxis: 1,
        type: 'arearange' as const,
        color: 'rgba(178, 201, 171, 0.5)',
        lineWidth: 1,
        dashStyle: 'ShortDash' as const,
        tooltip: {
          pointFormatter: function (this: Point) {
            const { high = 0, low = 0 } = this.options
            const windEffect = high - low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
            <span style="color: ${this.series.options.color}">●</span>
            ${this.series.name}: <b> ${effectSign}${windEffect} ${this.series.options.tooltip?.valueSuffix}</b>
          `
          },
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.all_data.series.gr'),
        custom: {
          code: 'gr'
        },
        type: 'spline' as const,
        data: glideRatio,
        yAxis: 2,
        tooltip: {
          valueSuffix: '',
          valueDecimals: 2
        },
        zones: [
          {
            value: 0.1,
            color: 'red'
          },
          {
            value: 6.8,
            color: '#37889B'
          },
          {
            color: 'red'
          }
        ],
        color: '#37889B'
      },
      {
        name: I18n.t('charts.gr.series.wind_effect'),
        custom: {
          code: 'gr_wind_effect'
        },
        type: 'arearange',
        data: zeroWindGlideRatio,
        yAxis: 2,
        color: 'rgba(63, 136, 167, 0.3)',
        lineWidth: 1,
        dashStyle: 'ShortDash',
        tooltip: {
          pointFormatter: function (this: Point) {
            const { high = 0, low = 0 } = this.options
            const windEffect = high - low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
            <span style="color: ${this.series.options.color}">●</span>
            ${this.series.name}: <b>${effectSign}${windEffect.toFixed(2)}</b>
          `
          }
        }
      },
      ...additionalSeries
    ]
  }
}

export default useChartOptions
