import { useMemo } from 'react'
import I18n from 'i18n-js'

import { METRIC } from 'redux/userPreferences/unitSystem'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'

import { calculateSpeedPoints } from '../calculateSpeedPoints'

const chartName = 'SpeedsChart'

const baseOptions = () => ({
  chart: {
    type: 'spline',
    marginLeft: 0,
    marginRight: 0,
    events: {
      load: function () {
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
        legendItemClick: function () {
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

export default (points, zeroWindPoints, unitSystem) => {
  const { verticalSpeed, horizontalSpeed, fullSpeed, zeroWindSpeed } = useMemo(
    () => calculateSpeedPoints(points, zeroWindPoints, unitSystem),
    [points, zeroWindPoints, unitSystem]
  )

  const speedUnits = unitSystem === METRIC ? 'kmh' : 'mph'

  const options = {
    ...baseOptions(),
    series: [
      {
        name: I18n.t('charts.spd.series.ground'),
        code: 'ground_speed',
        data: horizontalSpeed,
        type: 'spline',
        color: '#52A964',
        tooltip: {
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.spd.series.vertical'),
        code: 'vertical_speed',
        data: verticalSpeed,
        type: 'spline',
        color: '#A7414E',
        tooltip: {
          valueSuffix: ` ${I18n.t(`units.${speedUnits}`)}`
        }
      },
      {
        name: I18n.t('charts.spd.series.full'),
        code: 'full_speed',
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
        code: 'speed_wind_effect',
        data: zeroWindSpeed,
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
      }
    ]
  }

  return options
}
