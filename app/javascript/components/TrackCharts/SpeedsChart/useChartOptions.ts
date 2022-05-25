import { useMemo } from 'react'
import type { Chart, Options, Point, Series } from 'highcharts'

import { I18n } from 'components/TranslationsProvider'
import { METRIC, UnitSystem } from 'components/TrackViewPreferences'
import { PointRecord } from 'api/tracks/points'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'components/Highchart/utils'
import { calculateSpeedPoints } from '../calculateSpeedPoints'

const chartName = 'SpeedsChart'

const baseOptions = (): Options => ({
  chart: {
    type: 'spline',
    marginLeft: 0,
    marginRight: 0,
    events: {
      load: function (this: Chart) {
        restoreSeriesVisibility(chartName, this.series)
      }
    }
  },
  title: {
    style: { color: '#666', fontSize: '14px' },
    text: I18n.t('charts.spd.title')
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
      events: {
        legendItemClick: function (this: Series) {
          saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
        }
      }
    }
  },
  xAxis: {
    crosshair: true
  },
  yAxis: [
    {
      min: 0,
      labels: {
        x: 25,
        y: -2,
        style: {
          color: '#434348'
        }
      },
      title: {
        text: null,
        style: {
          color: '#434348'
        }
      }
    }
  ],
  tooltip: {
    shared: true,
    valueDecimals: 0,
    headerFormat: `
      ${I18n.t('charts.elev.series.height')}:
      {point.point.options.custom.altitude}${I18n.t('units.m')}<br>
    `
  },
  credits: {
    enabled: false
  },
  legend: {
    itemStyle: {
      fontSize: '10px'
    }
  }
})

export default (
  points: PointRecord[],
  zeroWindPoints: PointRecord[],
  unitSystem: UnitSystem
): Options => {
  const { verticalSpeed, horizontalSpeed, fullSpeed, zeroWindSpeed } = useMemo(
    () => calculateSpeedPoints(points, zeroWindPoints, unitSystem),
    [points, zeroWindPoints, unitSystem]
  )

  const speedUnits = unitSystem === METRIC ? 'kmh' : 'mph'

  return {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.spd.series.ground'),
        custom: {
          code: 'ground_speed'
        },
        data: horizontalSpeed,
        type: 'spline',
        color: '#52A964',
        tooltip: {
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.spd.series.vertical'),
        custom: {
          code: 'vertical_speed'
        },
        data: verticalSpeed,
        type: 'spline',
        color: '#A7414E',
        tooltip: {
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.spd.series.full'),
        custom: {
          code: 'full_speed'
        },
        data: fullSpeed,
        type: 'spline',
        color: '#D6A184',
        visible: false,
        tooltip: {
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.spd.series.wind_effect'),
        custom: {
          code: 'speed_wind_effect'
        },
        data: zeroWindSpeed,
        type: 'arearange',
        color: 'rgba(178, 201, 171, 0.5)',
        lineWidth: 1,
        dashStyle: 'ShortDash',
        tooltip: {
          pointFormatter: function (this: Point) {
            const { high = 0, low = 0 } = this.options
            const windEffect = high - low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
            <span style="color: ${this.color}">●</span>
            ${this.series.name}: <b> ${effectSign}${windEffect} ${this.series.options.tooltip?.valueSuffix}</b>
          `
          },
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      }
    ]
  }
}
