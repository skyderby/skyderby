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
  findPositionForAltitude,
  sep50Series,
  initAccuracyChart
} from 'charts'
import cropPoints from 'utils/cropPoints'
import RangeSummary from 'charts/RangeSummary'

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
      this.windowPoints = cropPoints(
        this.points,
        this.windowStartAltitude,
        this.windowEndAltitude
      )
      this.rangeSummary = new RangeSummary(this.windowPoints, { straightLine: true })
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

  updateTrackIndicators() {
    this.distanceTarget.innerText = Math.floor(this.rangeSummary.distance)
    this.glideRatioTarget.innerText = this.rangeSummary.glideRatio.avg.toFixed(2)
    this.glideRatioMinTarget.innerText = this.rangeSummary.glideRatio.min.toFixed(2)
    this.glideRatioMaxTarget.innerText = this.rangeSummary.glideRatio.max.toFixed(2)
    this.groundSpeedTarget.innerText = this.rangeSummary.horizontalSpeed.avg.toFixed(0)
    this.groundSpeedMinTarget.innerText = this.rangeSummary.horizontalSpeed.min.toFixed(0)
    this.groundSpeedMaxTarget.innerText = this.rangeSummary.horizontalSpeed.max.toFixed(0)
    this.elevationTarget.innerText = this.rangeSummary.elevation.toFixed(0)
    this.verticalSpeedTarget.innerText = this.rangeSummary.verticalSpeed.avg.toFixed(0)
    this.verticalSpeedMinTarget.innerText = this.rangeSummary.verticalSpeed.min.toFixed(0)
    this.verticalSpeedMaxTarget.innerText = this.rangeSummary.verticalSpeed.max.toFixed(0)
    this.durationTarget.innerText = this.rangeSummary.time.toFixed(1)

    if (this.windCancellation) this.updateWindEffectIndicators()
  }

  updateWindEffectIndicators() {
    const distanceEffect = this.rangeSummary.distanceWindEffect
    if (distanceEffect.value !== null) {
      this.updateWindEffectValues(
        distanceEffect,
        this.windEffectDistanceTarget,
        this.windEffectDistanceWindTarget,
        this.windEffectDistancePercentTarget,
        this.windEffectDistanceWindPercentTarget,
        0
      )
    }

    const speedEffect = this.rangeSummary.horizontalSpeedWindEffect
    if (speedEffect.value !== null) {
      this.updateWindEffectValues(
        speedEffect,
        this.windEffectSpeedTarget,
        this.windEffectSpeedWindTarget,
        this.windEffectSpeedPercentTarget,
        this.windEffectSpeedWindPercentTarget,
        0
      )
    }

    const glideEffect = this.rangeSummary.glideRatioWindEffect
    if (glideEffect.value !== null) {
      this.updateWindEffectValues(
        glideEffect,
        this.windEffectGlideRatioTarget,
        this.windEffectGlideRatioWindTarget,
        this.windEffectGlideRatioPercentTarget,
        this.windEffectGlideRatioWindPercentTarget,
        2
      )
    }
  }

  updateWindEffectValues(effect, valueEl, windEl, percentEl, windPercentEl, decimals) {
    valueEl.innerText = effect.value.toFixed(decimals)
    windEl.innerText =
      effect.windEffect > 0
        ? `+${effect.windEffect.toFixed(decimals)}`
        : effect.windEffect.toFixed(decimals)

    const absPercent = Math.abs(effect.windEffectPercent)
    const valuePercent = 100 - absPercent

    const clampedValuePercent = Math.max(0, Math.min(100, valuePercent))
    const clampedWindPercent = Math.max(0, Math.min(100, absPercent))

    percentEl.style.width = `${clampedValuePercent}%`
    windPercentEl.style.width = `${clampedWindPercent}%`
  }

  initSeparateCharts() {
    this.initAccuracyChart()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initAltitudeDistanceChart()
  }

  initCombinedCharts() {
    const chartName = 'PerformanceFlyingCombinedChart'

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
        plotLines: this.windowPlotLines({ includeLabels: true })
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
          max: 75,
          visible: false
        }
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: tooltipFormatter
      },
      credits: {
        enabled: false
      },
      series: [
        altitudeSeries(this.points, { yAxis: 0, color: '#aaa', type: 'spline' }),
        horizontalSpeedSeries(this.points, { yAxis: 1 }),
        verticalSpeedSeries(this.points, { yAxis: 1 }),
        fullSpeedSeries(this.points, { yAxis: 1 }),
        this.windCancellation && zeroWindSpeedSeries(this.points, { yAxis: 1 }),
        glideRatioSeries(this.points, { yAxis: 2 }),
        this.windCancellation && zeroWindGlideRatioSeries(this.points, { yAxis: 2 }),
        sep50Series(this.points, { yAxis: 3 })
      ].filter(Boolean)
    }

    this.combinedChartTarget.chart = Highcharts.chart(
      this.combinedChartTarget,
      chartOptions
    )
  }

  initAccuracyChart() {
    this.accuracyChartTarget.chart = initAccuracyChart(
      this.accuracyChartTarget,
      this.points,
      this.windowPlotLines()
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
