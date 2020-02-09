import { useMemo } from 'react'
import I18n from 'i18n-js'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'

const chartName = 'GlideRatioChart'

const baseOptions = () => ({
  chart: {
    type: 'spline',
    marginLeft: 0,
    marginRight: 0,
    height: '250px',
    events: {
      load: function() {
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
        legendItemClick: function() {
          saveSeriesVisibility(chartName, this.options.code, !this.visible)
        }
      }
    }
  },
  tooltip: {
    crosshairs: true,
    shared: true,
    valueDecimals: 2,
    headerFormat: `
      ${I18n.t('charts.elev.series.height')}:
      {point.point.options.altitude}${I18n.t('units.m')}<br>
    `,
    pointFormat: `
      <span style="color:{series.color}">\u25CF</span>
      {series.name}: <b>{point.options.trueValue}</b><br/>
    `
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
      formatter: function() {
        return this.isLast ? '≥ 7' : this.value
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

const clampValue = val => Math.round(Math.min(Math.max(val, 0), 7) * 100) / 100

export default (points, zeroWindPoints) => {
  const glideRatioPoints = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: clampValue(el.glideRatio, 0),
        trueValue: Math.round(el.glideRatio * 100) / 100,
        altitude: Math.round(el.altitude)
      })),
    [points]
  )

  const zeroWindGlideRatioPoints = useMemo(
    () =>
      zeroWindPoints.map((el, idx, arr) => ({
        x: Math.round((el.flTime - arr[0].flTime) * 10) / 10,
        low: clampValue(el.glideRatio),
        high: clampValue(points[idx].glideRatio),
        trueValue: Math.round(el.glideRatio * 100) / 100
      })),
    [points, zeroWindPoints]
  )

  const options = {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.gr.series.gr'),
        code: 'gr',
        data: glideRatioPoints,
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
        code: 'gr_wind_effect',
        type: 'arearange',
        data: zeroWindGlideRatioPoints,
        color: 'rgba(63, 136, 167, 0.3)',
        lineWidth: 1,
        dashStyle: 'ShortDash',
        tooltip: {
          pointFormatter: function() {
            const windEffect = this.high - this.low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
            <span style="color: ${this.series.color}">●</span>
            ${this.series.name}: <b>${effectSign}${windEffect.toFixed(2)}</b>
          `
          }
        }
      }
    ]
  }

  return options
}
