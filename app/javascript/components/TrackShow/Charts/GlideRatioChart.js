import React, { useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'

import { restoreSeriesVisibility, saveSeriesVisibility } from 'utils/chartSeriesSettings'
import { buildRefreshTooltipHandler } from './buildRefreshTooltipHandler'

const chartName = 'GlideRatioChart'

const GlideRatioChart = forwardRef(({ points = [] }, ref) => {
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

  const chartPoints = useMemo(
    () =>
      points.map(el => ({
        x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
        y: Math.round(Math.min(Math.max(el.glideRatio, 0), 7) * 100) / 100,
        trueValue: Math.round(el.glideRatio * 100) / 100,
        altitude: Math.round(el.altitude)
      })),
    [points]
  )

  useEffect(() => {
    if (!chart.current) return

    chart.current.series[0].setData(chartPoints)
  }, [chartPoints])

  return <div ref={element} />
})

GlideRatioChart.displayName = 'GlideRatioChart'

const options = {
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
  },
  series: [
    {
      name: I18n.t('charts.gr.series.gr'),
      code: 'gr',
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

GlideRatioChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired,
      altitude: PropTypes.number.isRequired
    })
  ).isRequired
}

export default GlideRatioChart
