import { Controller } from '@hotwired/stimulus'
import { differenceInMilliseconds } from 'date-fns'
import { saveSeriesVisibility, restoreSeriesVisibility } from 'utils/chartSeriesSettings'
import I18n from 'i18n'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft
const validationWindowHeight = 1000
const chartName = 'SpeedSkydivingCombinedChart'

const findPositionForAltitude = (points, altitude) => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  if (idx === -1) return null

  const firstPoint = points[idx]
  const secondPoint = points[idx + 1]

  const flTime =
    firstPoint.flTime +
    ((secondPoint.flTime - firstPoint.flTime) /
      (firstPoint.altitude - secondPoint.altitude)) *
      (firstPoint.altitude - altitude)

  return flTime - points[0].flTime
}

const accuracySeries = (points, windowEndAltitude) => {
  const validationWindowStart = windowEndAltitude + validationWindowHeight

  return {
    name: 'Speed Accuracy',
    type: 'column',
    yAxis: 2,
    zones: [{ value: 0, color: '#ccc' }, { value: 3, color: '#ccc' }, { color: 'red' }],
    data: points
      .filter(
        point =>
          point.altitude <= validationWindowStart && point.altitude >= windowEndAltitude
      )
      .map(point => [
        point.flTime - points[0].flTime,
        (Math.sqrt(2) * point.verticalAccuracy) / 3
      ])
  }
}

const altitudeSeries = points => ({
  name: I18n.t('charts.all_data.series.height'),
  custom: {
    code: 'height'
  },
  type: 'spline',
  data: points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.altitude)
  })),
  yAxis: 0,
  color: '#aaa',
  tooltip: {
    valueSuffix: ` ${I18n.t('units.m')}`,
    valueDecimals: 0
  }
})

const clampGlideValue = val => Math.round(Math.min(Math.max(val, 0), 7) * 100) / 100

const glideRatioSeries = points => ({
  name: I18n.t('charts.all_data.series.gr'),
  custom: {
    code: 'gr'
  },
  type: 'spline',
  data: points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: clampGlideValue(el.glideRatio),
    custom: {
      trueValue: Math.round(el.glideRatio * 100) / 100,
      altitude: Math.round(el.altitude)
    }
  })),
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
})

const zeroWindGlideRatioSeries = points => ({
  name: I18n.t('charts.gr.series.wind_effect'),
  custom: {
    code: 'gr_wind_effect'
  },
  type: 'arearange',
  data: points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    low: clampGlideValue(el.glideRatio),
    high: clampGlideValue(el.zerowindGlideRatio),
    custom: {
      trueValue: Math.round(el.glideRatio * 100) / 100
    }
  })),
  yAxis: 2,
  color: 'rgba(63, 136, 167, 0.3)',
  lineWidth: 1,
  dashStyle: 'ShortDash',
  tooltip: {
    pointFormatter: function () {
      const { high = 0, low = 0 } = this.options
      const windEffect = high - low
      const effectSign = windEffect > 0 ? '+' : ''
      return `
        <span style="color: ${this.series.options.color}">●</span>
        ${this.series.name}: <b>${effectSign}${windEffect.toFixed(2)}</b>
      `
    }
  }
})

const horizontalSpeedSeries = points => ({
  name: I18n.t('charts.all_data.series.horiz_speed'),
  custom: {
    code: 'ground_speed'
  },
  type: 'spline',
  data: points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.hSpeed),
    custom: {
      altitude: Math.round(el.altitude)
    }
  })),
  yAxis: 1,
  color: '#52A964',
  tooltip: {
    valueSuffix: ` ${I18n.t('units.kmh')}`,
    valueDecimals: 0
  }
})

const verticalSpeedSeries = points => ({
  name: I18n.t('charts.all_data.series.vert_speed'),
  custom: {
    code: 'vertical_speed'
  },
  type: 'spline',
  data: points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.vSpeed),
    custom: {
      altitude: Math.round(el.altitude)
    }
  })),
  yAxis: 1,
  color: '#A7414E',
  tooltip: {
    valueSuffix: ` ${I18n.t('units.kmh')}`,
    valueDecimals: 0
  }
})

const fullSpeedSeries = points => ({
  name: I18n.t('charts.all_data.series.full_speed'),
  custom: {
    code: 'full_speed'
  },
  type: 'spline',
  data: points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.fullSpeed),
    custom: {
      altitude: Math.round(el.altitude)
    }
  })),
  yAxis: 1,
  color: '#D6A184',
  visible: false,
  tooltip: {
    valueSuffix: ` ${I18n.t('units.kmh')}`,
    valueDecimals: 0
  }
})

const zeroWindSpeedSeries = points => ({
  name: I18n.t('charts.spd.series.wind_effect'),
  custom: {
    code: 'speed_wind_effect'
  },
  data: points.map(point => ({
    x: Math.round((point.flTime - points[0].flTime) * 10) / 10,
    low: Math.round(point.hSpeed),
    high: Math.round(point.zerowindHSpeed),
    custom: {
      altitude: Math.round(point.altitude)
    }
  })),
  yAxis: 1,
  type: 'arearange',
  color: 'rgba(178, 201, 171, 0.5)',
  lineWidth: 1,
  dashStyle: 'ShortDash',
  tooltip: {
    pointFormatter: function () {
      const { high = 0, low = 0 } = this.options
      const windEffect = high - low
      const effectSign = windEffect > 0 ? '+' : ''
      return `
        <span style="color: ${this.series.options.color}">●</span>
        ${this.series.name}: <b> ${effectSign}${windEffect} ${this.series.options.tooltip?.valueSuffix}</b>
      `
    },
    valueSuffix: ` ${I18n.t('units.kmh')}`
  }
})

export default class SpeedSkydivingChart extends Controller {
  connect() {
    this.trackId = this.element.getAttribute('data-track-id')
    this.result = Number(this.element.getAttribute('data-result'))
    this.exitAltitude = Number(this.element.getAttribute('data-exit-altitude'))
    this.windowStartTime = new Date(this.element.getAttribute('data-window-start'))
    this.windowEndTime = new Date(this.element.getAttribute('data-window-end'))

    this.fetchPoints(this.trackId).then(this.initChart.bind(this))
  }

  fetchPoints(trackId) {
    return fetch(`/tracks/${trackId}/points?original_frequency=true`, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        data.points.forEach(point => {
          point.gpsTime = new Date(point.gpsTime)
          point.hSpeed = point.hSpeed * 3.6
          point.vSpeed = point.vSpeed * 3.6
          point.fullSpeed = point.fullSpeed * 3.6
          if (point.zerowindHSpeed) point.zerowindHSpeed = point.zerowindHSpeed * 3.6
        })

        return data
      })
  }

  initChart({ points, windCancellation }) {
    const windowEndAltitude = Math.max(this.exitAltitude - windowHeight, breakoffAltitude)

    const plotLineValue = findPositionForAltitude(points, windowEndAltitude)

    const chartOptions = {
      chart: {
        height: 600,
        events: {
          load: function () {
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
            legendItemClick: function () {
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
        crosshair: true,
        plotLines: [
          {
            value: plotLineValue,
            width: 1,
            color: 'red',
            label: {
              text: `End of window - ${windowEndAltitude.toFixed()} ${I18n.t('units.m')}`,
              style: { color: 'red' },
              y: 100
            }
          }
        ],
        plotBands: [
          {
            color: 'rgba(0, 150, 0, 0.25)',
            zIndex: 8,
            label: {
              text: `Best speed: ${this.result.toFixed(2)} ${I18n.t('units.kmh')}`,
              rotation: 90,
              textAlign: 'left',
              y: 100
            },
            from:
              differenceInMilliseconds(this.windowStartTime, points[0].gpsTime) / 1000,
            to: differenceInMilliseconds(this.windowEndTime, points[0].gpsTime) / 1000
          }
        ]
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
          min: 0,
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
        formatter: function () {
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
      },
      series: [
        altitudeSeries(points),
        horizontalSpeedSeries(points),
        verticalSpeedSeries(points),
        fullSpeedSeries(points),
        windCancellation && zeroWindSpeedSeries(points),
        glideRatioSeries(points),
        windCancellation && zeroWindGlideRatioSeries(points),
        accuracySeries(points, windowEndAltitude)
      ].filter(Boolean)
    }

    this.element.chart = Highcharts.chart(this.element, chartOptions)
  }
}
