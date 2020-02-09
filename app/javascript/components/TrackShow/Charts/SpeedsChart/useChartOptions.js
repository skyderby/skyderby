import { useMemo } from 'react'
import I18n from 'i18n-js'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'

const chartName = 'SpeedsChart'

const baseOptions = () => ({
  chart: {
    type: 'spline',
    marginLeft: 0,
    marginRight: 0,
    events: {
      load: function() {
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
        legendItemClick: function() {
          saveSeriesVisibility(chartName, this.options.code, !this.visible)
        }
      }
    }
  },
  yAxis: [
    {
      min: 0,
      labels: {
        x: 25,
        y: -2,
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      },
      title: {
        text: null,
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      }
    }
  ],
  tooltip: {
    shared: true,
    crosshairs: true,
    valueDecimals: 0,
    headerFormat: `
      ${I18n.t('charts.elev.series.height')}:
      {point.point.options.altitude}${I18n.t('units.m')}<br>
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

export default (points, zeroWindPoints) => {
  const calculateVerticalSpeedPoints = () =>
    points.map(el => ({
      x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
      y: Math.round(el.vSpeed),
      altitude: Math.round(el.altitude)
    }))

  const calculateHorizontalSpeedPoints = () =>
    points.map(el => ({
      x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
      y: Math.round(el.hSpeed),
      altitude: Math.round(el.altitude)
    }))

  const calculateFullSpeedPoints = () =>
    points.map(el => ({
      x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
      y: Math.round(Math.sqrt(el.hSpeed ** 2 + el.vSpeed ** 2)),
      altitude: Math.round(el.altitude)
    }))

  const calculateZeroWindSpeedPoints = () =>
    zeroWindPoints.map((point, idx) => ({
      x: Math.round((point.flTime - zeroWindPoints[0].flTime) * 10) / 10,
      low: Math.round(point.hSpeed),
      high: Math.round(points[idx].hSpeed),
      altitude: Math.round(point.altitude)
    }))

  const verticalSpeedPoints = useMemo(calculateVerticalSpeedPoints, [points])
  const horizontalSpeedPoints = useMemo(calculateHorizontalSpeedPoints, [points])
  const fullSpeedPoints = useMemo(calculateFullSpeedPoints, [points])
  const zeroWindSpeedPoints = useMemo(calculateZeroWindSpeedPoints, [zeroWindPoints])

  const options = {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.spd.series.ground'),
        code: 'ground_speed',
        data: horizontalSpeedPoints,
        type: 'spline',
        color: '#52A964',
        tooltip: {
          valueSuffix: ` ${I18n.t('units.kmh')}`
        }
      },
      {
        name: I18n.t('charts.spd.series.vertical'),
        code: 'vertical_speed',
        data: verticalSpeedPoints,
        type: 'spline',
        color: '#A7414E',
        tooltip: {
          valueSuffix: ` ${I18n.t('units.kmh')}`
        }
      },
      {
        name: I18n.t('charts.spd.series.full'),
        code: 'full_speed',
        data: fullSpeedPoints,
        type: 'spline',
        color: '#D6A184',
        visible: false,
        tooltip: {
          valueSuffix: ` ${I18n.t('units.kmh')}`
        }
      },
      {
        name: I18n.t('charts.spd.series.wind_effect'),
        code: 'speed_wind_effect',
        data: zeroWindSpeedPoints,
        type: 'arearange',
        color: 'rgba(178, 201, 171, 0.5)',
        lineWidth: 1,
        dashStyle: 'ShortDash',
        tooltip: {
          pointFormatter: function() {
            const windEffect = this.high - this.low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
            <span style="color: ${this.series.color}">●</span>
            ${this.series.name}: <b> ${effectSign}${windEffect} ${this.series.tooltipOptions.valueSuffix}</b>
          `
          },
          valueSuffix: ` ${I18n.t('units.kmh')}`
        }
      }
    ]
  }

  return options
}
