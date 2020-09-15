import { useMemo } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { METRIC } from 'redux/userPreferences/unitSystem'
import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'

import { calculateSpeedPoints } from '../calculateSpeedPoints'

const chartName = 'SpeedsChart'

const baseOptions = t => ({
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
    text: t('charts.spd.title')
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
      ${t('charts.elev.series.height')}:
      {point.point.options.altitude}${t('units.m')}<br>
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
  const { t } = useI18n()

  const { verticalSpeed, horizontalSpeed, fullSpeed, zeroWindSpeed } = useMemo(
    () => calculateSpeedPoints(points, zeroWindPoints, unitSystem),
    [points, zeroWindPoints, unitSystem]
  )

  const speedUnits = unitSystem === METRIC ? 'kmh' : 'mph'

  const options = {
    ...baseOptions(t),
    series: [
      {
        name: t('charts.spd.series.ground'),
        code: 'ground_speed',
        data: horizontalSpeed,
        type: 'spline',
        color: '#52A964',
        tooltip: {
          valueSuffix: ` ${t(`units.${speedUnits}`)}`
        }
      },
      {
        name: t('charts.spd.series.vertical'),
        code: 'vertical_speed',
        data: verticalSpeed,
        type: 'spline',
        color: '#A7414E',
        tooltip: {
          valueSuffix: ` ${t(`units.${speedUnits}`)}`
        }
      },
      {
        name: t('charts.spd.series.full'),
        code: 'full_speed',
        data: fullSpeed,
        type: 'spline',
        color: '#D6A184',
        visible: false,
        tooltip: {
          valueSuffix: ` ${t(`units.${speedUnits}`)}`
        }
      },
      {
        name: t('charts.spd.series.wind_effect'),
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
          valueSuffix: ` ${t(`units.${speedUnits}`)}`
        }
      }
    ]
  }

  return options
}
