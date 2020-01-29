import React, { useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'

import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'
import { buildRefreshTooltipHandler } from './buildRefreshTooltipHandler'

const chartName = 'SpeedsChart'

const SpeedsChart = forwardRef(({ points = [] }, ref) => {
  const element = useRef()
  const chart = useRef()

  useImperativeHandle(
    ref,
    () => ({
      refreshTooltip: buildRefreshTooltipHandler(chart)
    }),
    []
  )

  useEffect(() => {
    chart.current = Highcharts.chart(element.current, options)
  }, [])

  const verticalSpeed = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(el.vSpeed),
        altitude: Math.round(el.altitude)
      })),
    [points]
  )

  const horizontalSpeed = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(el.hSpeed),
        altitude: Math.round(el.altitude)
      })),
    [points]
  )

  useEffect(() => {
    if (!chart.current) return

    chart.current.series[0].setData(horizontalSpeed)
    chart.current.series[1].setData(verticalSpeed)
  }, [horizontalSpeed, verticalSpeed])

  return <div ref={element} />
})

SpeedsChart.displayName = 'SpeedsChart'

const options = {
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
  },
  series: [
    {
      name: I18n.t('charts.spd.series.ground'),
      code: 'ground_speed',
      color: '#52A964',
      tooltip: {
        valueSuffix: ` ${I18n.t('units.kmh')}`
      }
    },
    {
      name: I18n.t('charts.spd.series.vertical'),
      code: 'vertical_speed',
      color: '#A7414E',
      tooltip: {
        valueSuffix: ` ${I18n.t('units.kmh')}`
      }
    },
    {
      name: I18n.t('charts.spd.series.full'),
      code: 'full_speed',
      color: '#D6A184',
      visible: false,
      tooltip: {
        valueSuffix: ` ${I18n.t('units.kmh')}`
      }
    },
    {
      name: I18n.t('charts.spd.series.wind_effect'),
      code: 'speed_wind_effect',
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

SpeedsChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number.isRequired,
      vSpeed: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired,
      altitude: PropTypes.number.isRequired
    })
  )
}

export default SpeedsChart
