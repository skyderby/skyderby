import { useMemo } from 'react'
import type {
  AxisLabelsFormatterContextObject,
  Options,
  Chart,
  Series,
  Point
} from 'highcharts'

import { PointRecord } from 'api/tracks/points'
import { I18n } from 'components/TranslationsProvider'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'components/Highchart/utils'
import { calculateGlideRatioPoints } from '../calculateGlideRatioPoints'

const chartName = 'GlideRatioChart'

const baseOptions = (): Options => ({
  chart: {
    type: 'spline',
    marginLeft: 0,
    marginRight: 0,
    height: '250px',
    events: {
      load: function (this: Chart): void {
        restoreSeriesVisibility(chartName, this.series)
      }
    }
  },
  title: {
    style: { color: '#555', fontSize: '14px' },
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
      events: {
        legendItemClick: function (this: Series): void {
          saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
        }
      }
    }
  },
  tooltip: {
    shared: true,
    valueDecimals: 2,
    headerFormat: `
      ${I18n.t('charts.elev.series.height')}:
      {point.point.options.custom.altitude}${I18n.t('units.m')}<br>
    `,
    pointFormat: `
      <span style="color:{series.color}">\u25CF</span>
      {series.name}: <b>{point.options.custom.trueValue}</b><br/>
    `
  },
  xAxis: {
    crosshair: true
  },
  yAxis: {
    min: 0,
    max: 7.5,
    startOnTick: false,
    endOnTick: false,
    minPadding: 0.2,
    maxPadding: 0.2,
    tickInterval: 1,
    title: {
      text: null
    },
    labels: {
      x: 20,
      y: -2,
      formatter: function (this: AxisLabelsFormatterContextObject) {
        return this.isLast ? '≥ 7' : String(this.value)
      }
    }
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

export default (points: PointRecord[], zeroWindPoints: PointRecord[]): Options => {
  const { glideRatio, zeroWindGlideRatio } = useMemo(
    () => calculateGlideRatioPoints(points, zeroWindPoints),
    [points, zeroWindPoints]
  )

  return {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.gr.series.gr'),
        type: 'spline' as const,
        custom: {
          code: 'gr'
        },
        data: glideRatio,
        tooltip: {
          valueSuffix: ''
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
        color: '#37889B',
        zIndex: 2
      },
      {
        name: I18n.t('charts.gr.series.wind_effect'),
        custom: {
          code: 'gr_wind_effect'
        },
        type: 'arearange' as const,
        data: zeroWindGlideRatio,
        color: 'rgba(63, 136, 167, 0.3)',
        lineWidth: 1,
        dashStyle: 'ShortDash' as const,
        tooltip: {
          pointFormatter: function (this: Point): string {
            const { high = 0, low = 0 } = this.options
            const windEffect = high - low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
              <span style="color: ${this.color}">●</span>
              ${this.series.name}: <b>${effectSign}${windEffect.toFixed(2)}</b>
            `
          }
        }
      }
    ]
  }
}
