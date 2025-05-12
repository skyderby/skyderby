import { Controller } from '@hotwired/stimulus'
import I18n from 'i18n'
import {
  glideRatioSeries,
  zeroWindGlideRatioSeries,
  horizontalSpeedSeries,
  verticalSpeedSeries,
  fullSpeedSeries,
  zeroWindSpeedSeries,
  altitudeSeries,
  restoreSeriesVisibility,
  saveSeriesVisibility,
  tooltipFormatter,
  findPositionForAltitude
} from 'charts'

const sep50Series = (points, options) => {
  const clampAccuracy = val => Math.round(Math.min(Math.max(val, 0), 15) * 10) / 10
  // const validationWindowStart = windowEndAltitude + validationWindowHeight

  return {
    name: 'SEP 50',
    type: 'area',
    zones: [
      { value: 0, color: '#A6AFBB' },
      { value: 10, color: '#A6AFBB' },
      { color: '#e3353f' }
    ],
    data: points.map(point => ({
      x: point.flTime - points[0].flTime,
      y: clampAccuracy(point.sep50),
      custom: {
        tooltipValue: Math.round(point.sep50 * 10) / 10,
        altitude: Math.round(point.altitude),
        gpsTime: point.gpsTime
      }
    })),
    ...options
  }
}

export default class PerformanceFlyingChartsController extends Controller {
  static targets = [
    'accuracyChart',
    'glideChart',
    'speedChart',
    'altitudeDistanceChart',
    'combinedChart',
    // Track indicators targets
    'distance',
    'groundSpeed',
    'groundSpeedMax',
    'groundSpeedMin',
    'glideRatio',
    'glideRatioMax',
    'glideRatioMin',
    'elevation',
    'verticalSpeed',
    'verticalSpeedMax',
    'verticalSpeedMin',
    'duration',
    // Wind effect targets
    'windEffectContainerDistance',
    'windEffectDistancePercent',
    'windEffectDistanceWindPercent',
    'windEffectDistance',
    'windEffectDistanceWind',
    'windEffectContainerSpeed',
    'windEffectSpeedPercent',
    'windEffectSpeedWindPercent',
    'windEffectSpeed',
    'windEffectSpeedWind',
    'windEffectContainerGlideRatio',
    'windEffectGlideRatioPercent',
    'windEffectGlideRatioWindPercent',
    'windEffectGlideRatio',
    'windEffectGlideRatioWind'
  ]

  connect() {
    this.trackId = this.element.dataset.trackId
    this.result = Number(this.element.dataset.result)
    this.exitAltitude = Number(this.element.dataset.exitAltitude)
    this.windowStartAltitude = Number(this.element.dataset.windowStart)
    this.windowEndAltitude = Number(this.element.dataset.windowEnd)
    this.chartType = this.element.dataset.chartType
    const initCharts =
      this.chartType === 'separate'
        ? this.initSeparateCharts.bind(this)
        : this.initCombinedCharts.bind(this)

    this.fetchPoints(this.trackId).then(data => {
      this.points = data.points
      this.windCancellation = data.windCancellation

      initCharts()
      this.updateTrackIndicators()
    })
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

  updateTrackIndicators() {}

  initSeparateCharts() {
    this.initAccuracyChart()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initAltitudeDistanceChart()
  }

  initCombinedCharts() {
    console.log(this.points)
  }

  initAccuracyChart() {
    const chartOptions = {
      chart: {
        type: 'area'
      },
      title: undefined,
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        labels: {
          enabled: false
        },
        tickWidth: 0,
        plotLines: this.windowPlotLines()
      },
      yAxis: [
        {
          min: 0,
          max: 15,
          tickAmount: 3,
          title: undefined,
          labels: {
            enabled: false
          },
          plotLines: [
            {
              value: 10,
              color: '#9e0419',
              dashStyle: 'Dash',
              width: 1,
              zIndex: 5
            }
          ]
        }
      ],
      tooltip: {
        crosshair: true,
        shared: true,
        useHTML: true,
        formatter: tooltipFormatter
      },
      series: [sep50Series(this.points)]
    }

    this.accuracyChartTarget.chart = Highcharts.chart(
      this.accuracyChartTarget,
      chartOptions
    )
  }

  initGlideChart() {
    const chartName = 'GlideChart'

    const chartOptions = {
      chart: {
        type: 'spline',
        styledMode: true,
        events: function () {
          restoreSeriesVisibility(chartName, this.series)
        }
      },
      title: {
        text: I18n.t('charts.gr.title'),
        style: { color: 'var(--gray-80)', fontSize: '16px' }
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
              saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
            }
          }
        }
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        valueDecimals: 2,
        useHTML: true,
        formatter: tooltipFormatter
      },
      xAxis: {
        labels: {
          enabled: false
        },
        tickWidth: 0,
        plotLines: this.windowPlotLines({ includeLabels: true })
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
          formatter: function () {
            return this.isLast ? '≥ 7' : this.value
          }
        }
      },
      credits: { enabled: false },
      series: [
        glideRatioSeries(this.points),
        this.windCancellation && zeroWindGlideRatioSeries(this.points)
      ].filter(Boolean)
    }

    this.glideChartTarget.chart = Highcharts.chart(this.glideChartTarget, chartOptions)
  }

  initSpeedsChart() {
    const chartName = 'SpeedsChart'

    const chartOptions = {
      chart: {
        type: 'spline',
        styledMode: true,
        events: {
          load: function () {
            restoreSeriesVisibility(chartName, this.series)
          }
        }
      },
      title: {
        text: I18n.t('charts.spd.title'),
        style: { color: 'var(--gray-80)', fontSize: '16px' }
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
              saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
            }
          }
        }
      },
      xAxis: {
        labels: {
          enabled: false
        },
        tickWidth: 0,
        plotLines: this.windowPlotLines()
      },
      yAxis: [
        {
          //Speed yAxis
          min: 0,
          labels: {
            x: 20,
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
        useHTML: true,
        valueDecimals: 0,
        formatter: tooltipFormatter
      },
      credits: { enabled: false },
      series: [
        horizontalSpeedSeries(this.points),
        verticalSpeedSeries(this.points),
        fullSpeedSeries(this.points),
        this.windCancellation && zeroWindSpeedSeries(this.points)
      ].filter(Boolean)
    }

    this.speedChartTarget.chart = Highcharts.chart(this.speedChartTarget, chartOptions)
  }

  initAltitudeDistanceChart() {
    const chartName = 'AltitudeDistance'

    const chartOptions = {
      chart: {
        type: 'spline',
        styledMode: true,
        events: {
          load: function () {
            restoreSeriesVisibility(chartName, this.series)
          }
        }
      },
      title: {
        text: I18n.t('charts.elev.title'),
        style: { color: '#777', fontSize: '16px' }
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        },
        area: {
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
          }
        }
      },
      xAxis: {
        labels: {
          enabled: false
        },
        tickWidth: 0,
        plotLines: this.windowPlotLines()
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        },
        labels: {
          x: 20,
          y: -2
        }
      },
      tooltip: {
        shared: true,
        crosshairs: true,
        useHTML: true,
        formatter: tooltipFormatter
      },
      credits: { enabled: false },
      series: [altitudeSeries(this.points)]
    }

    this.altitudeDistanceChartTarget.chart = Highcharts.chart(
      this.altitudeDistanceChartTarget,
      chartOptions
    )
  }

  windowPlotLines({ includeLabels } = {}) {
    if (!this.windowPlotLinePositions) {
      this.windowPlotLinePositions = [
        this.windowStartAltitude,
        this.windowEndAltitude
      ].map(altitude => [altitude, findPositionForAltitude(this.points, altitude)])
    }

    return this.windowPlotLinePositions.map(([altitude, position]) => ({
      value: position,
      width: 1,
      color: 'red',
      ...(includeLabels
        ? {
            label: {
              text: `${altitude.toFixed()} ${I18n.t('units.m')}`,
              style: { color: 'red' },
              y: 10
            }
          }
        : {})
    }))
  }
}
