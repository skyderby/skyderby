import { useMemo } from 'react'
import I18n from 'i18n-js'

import { METRIC } from 'redux/userPreferences/unitSystem'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'

import { calculateSpeedPoints } from '../calculateSpeedPoints'
import { calculateGlideRatioPoints } from '../calculateGlideRatioPoints'

const chartName = 'CombinedChart'

const baseOptions = () => ({
  chart: {
    type: 'spline',
    height: 600,
    events: {
      load: function () {
        restoreSeriesVisibility(chartName, this.series)
      }
    }
  },
  title: {
    style: { color: '#666', fontSize: '14px' },
    text: I18n.t('charts.all_data.title')
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
        legendItemClick: function () {
          saveSeriesVisibility(chartName, this.options.code, !this.visible)
        }
      }
    }
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
        formatter: function () {
          return this.isLast ? '≥ 7' : this.value
        }
      },
      opposite: true
    }
  ],
  tooltip: {
    shared: true,
    crosshairs: true,
    formatter: function () {
      return this.points
        .map(point => {
          const seriesName = point.series.name
          const value = point.point.options.trueValue || point.y
          const valueSuffix = point.series.options.tooltip.valueSuffix || ''

          return `${seriesName}: ${value} ${valueSuffix}`
        })
        .join('<br />')
    }
  },
  credits: {
    enabled: false
  }
})

const useChartOptions = (points, zeroWindPoints, unitSystem) => {
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

  const options = {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.all_data.series.height'),
        code: 'height',
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
        code: 'ground_speed',
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
        code: 'vertical_speed',
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
        code: 'full_speed',
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
        code: 'speed_wind_effect',
        data: zeroWindSpeed,
        yAxis: 1,
        type: 'arearange',
        color: 'rgba(178, 201, 171, 0.5)',
        lineWidth: 1,
        dashStyle: 'ShortDash',
        tooltip: {
          pointFormatter: function () {
            const windEffect = this.high - this.low
            const effectSign = windEffect > 0 ? '+' : ''
            return `
            <span style="color: ${this.series.color}">●</span>
            ${this.series.name}: <b> ${effectSign}${windEffect} ${this.series.tooltipOptions.valueSuffix}</b>
          `
          },
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.all_data.series.gr'),
        code: 'gr',
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
        code: 'gr_wind_effect',
        type: 'arearange',
        data: zeroWindGlideRatio,
        yAxis: 2,
        color: 'rgba(63, 136, 167, 0.3)',
        lineWidth: 1,
        dashStyle: 'ShortDash',
        tooltip: {
          pointFormatter: function () {
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

export default useChartOptions
