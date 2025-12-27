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
  sep50Series
} from 'charts'
import cropPoints from 'utils/cropPoints'
import RangeSummary from 'charts/RangeSummary'

export default class extends Controller {
  static targets = [
    'accuracyChart',
    'glideChart',
    'speedChart',
    'altitudeDistanceChart',
    'combinedChart',
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
    'windEffectGlideRatioWind',
    'range3000to2000',
    'range2500to1500',
    'straightLineButton'
  ]

  static outlets = ['tracks--range-selector']

  static values = {
    pointsUrl: String,
    chartType: { type: String, default: 'separate' }
  }

  connect() {
    this.initializeStraightLine()

    this.fetchPoints().then(data => {
      this.points = data.points
      this.windCancellation = data.windCancellation
      this.initializeRange()
      this.updateCharts()
    })
  }

  initializeStraightLine() {
    const url = new URL(window.location)
    this.straightLine = url.searchParams.get('straight-line') === 'true'
    this.updateStraightLineButton()
  }

  updateStraightLineButton() {
    if (!this.hasStraightLineButtonTarget) return
    this.straightLineButtonTarget.classList.toggle('active', this.straightLine)
  }

  toggleStraightLine() {
    this.straightLine = !this.straightLine
    this.updateStraightLineButton()
    this.updateStraightLineUrl()
    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })
    this.updateIndicators()
  }

  updateStraightLineUrl() {
    const url = new URL(window.location)
    if (this.straightLine) {
      url.searchParams.set('straight-line', 'true')
    } else {
      url.searchParams.delete('straight-line')
    }
    history.replaceState({}, '', url)
  }

  fetchPoints() {
    return fetch(this.pointsUrlValue, {
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

  initializeRange() {
    this.maxAltitude = this.points[0].altitude
    this.minAltitude = this.points.at(-1).altitude

    const url = new URL(window.location)
    const fromParam = url.searchParams.get('f')
    const toParam = url.searchParams.get('t')

    this.fromValue = fromParam ? Number(fromParam) : this.maxAltitude
    this.toValue = toParam ? Number(toParam) : this.minAltitude

    if (this.fromValue > this.maxAltitude) this.fromValue = this.maxAltitude
    if (this.toValue < this.minAltitude || this.toValue >= this.fromValue) {
      this.toValue = this.minAltitude
    }

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.initSlider(
        this.maxAltitude,
        this.minAltitude,
        this.fromValue,
        this.toValue
      )
    }

    this.showRangeShortcuts()
  }

  showRangeShortcuts() {
    if (
      this.hasRange3000to2000Target &&
      this.maxAltitude > 3000 &&
      this.minAltitude < 2000
    ) {
      this.range3000to2000Target.classList.remove('hidden')
    }
    if (
      this.hasRange2500to1500Target &&
      this.maxAltitude > 2500 &&
      this.minAltitude < 1500
    ) {
      this.range2500to1500Target.classList.remove('hidden')
    }
  }

  updateRange(event) {
    const [from, to] = event.detail.range
    this.fromValue = from
    this.toValue = to
    this.updateUrl(from, to)
    this.updateCharts()
  }

  setRange(event) {
    const from = Number(event.currentTarget.dataset.from)
    const to = Number(event.currentTarget.dataset.to)
    this.fromValue = from
    this.toValue = to

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.updateSlider(from, to)
    }

    this.updateUrl(from, to)
    this.updateCharts()
  }

  updateUrl(from, to) {
    const url = new URL(window.location)
    url.searchParams.set('f', from)
    url.searchParams.set('t', to)
    history.replaceState({}, '', url)
  }

  clearRangeUrl() {
    const url = new URL(window.location)
    url.searchParams.delete('f')
    url.searchParams.delete('t')
    history.replaceState({}, '', url)
  }

  resetRange() {
    this.fromValue = this.maxAltitude
    this.toValue = this.minAltitude

    if (this.hasTracksRangeSelectorOutlet) {
      this.tracksRangeSelectorOutlet.updateSlider(this.maxAltitude, this.minAltitude)
    }

    this.clearRangeUrl()
    this.updateCharts()
  }

  updateCharts() {
    this.windowPoints = cropPoints(this.points, this.fromValue, this.toValue)
    this.rangeSummary = new RangeSummary(this.windowPoints, {
      straightLine: this.straightLine
    })

    this.calculateChartPoints()
    this.destroyCharts()

    if (this.chartType === 'separate') {
      this.initSeparateCharts()
    } else {
      this.initCombinedChart()
    }

    this.updateIndicators()
  }

  get chartType() {
    return this.chartTypeValue
  }

  calculateChartPoints() {
    const bufferSeconds = 3
    const rangeStartTime = this.windowPoints[0].gpsTime.getTime()
    const rangeEndTime = this.windowPoints.at(-1).gpsTime.getTime()

    const bufferStartTime = rangeStartTime - bufferSeconds * 1000
    const bufferEndTime = rangeEndTime + bufferSeconds * 1000

    this.chartPoints = this.points.filter(
      point =>
        point.gpsTime.getTime() >= bufferStartTime &&
        point.gpsTime.getTime() <= bufferEndTime
    )

    if (this.chartPoints.length === 0) {
      this.chartPoints = this.windowPoints
    }

    const firstChartTime = this.chartPoints[0].flTime
    this.bufferStartPosition = rangeStartTime - this.chartPoints[0].gpsTime.getTime()
    this.bufferEndPosition = rangeEndTime - this.chartPoints[0].gpsTime.getTime()
    this.chartEndPosition = this.chartPoints.at(-1).flTime - firstChartTime
  }

  bufferPlotBands() {
    return [
      {
        from: 0,
        to: this.bufferStartPosition / 1000,
        color: 'rgba(200, 200, 200, 0.3)'
      },
      {
        from: this.bufferEndPosition / 1000,
        to: this.chartEndPosition,
        color: 'rgba(200, 200, 200, 0.3)'
      }
    ]
  }

  destroyCharts() {
    const charts = [
      this.hasAccuracyChartTarget && this.accuracyChartTarget.chart,
      this.hasGlideChartTarget && this.glideChartTarget.chart,
      this.hasSpeedChartTarget && this.speedChartTarget.chart,
      this.hasAltitudeDistanceChartTarget && this.altitudeDistanceChartTarget.chart,
      this.hasCombinedChartTarget && this.combinedChartTarget.chart
    ]

    charts.filter(Boolean).forEach(chart => chart.destroy())
  }

  initSeparateCharts() {
    this.initAccuracyChart()
    this.initGlideChart()
    this.initSpeedsChart()
    this.initAltitudeDistanceChart()
  }

  updateIndicators() {
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
    if (distanceEffect?.value !== null) {
      this.windEffectContainerDistanceTarget.style.display = ''
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
    if (speedEffect?.value !== null) {
      this.windEffectContainerSpeedTarget.style.display = ''
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
    if (glideEffect?.value !== null) {
      this.windEffectContainerGlideRatioTarget.style.display = ''
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

  initCombinedChart() {
    const chartName = 'TrackCombinedChart'

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
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands()
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
        altitudeSeries(this.chartPoints, { yAxis: 0, color: '#aaa', type: 'spline' }),
        horizontalSpeedSeries(this.chartPoints, { yAxis: 1 }),
        verticalSpeedSeries(this.chartPoints, { yAxis: 1 }),
        fullSpeedSeries(this.chartPoints, { yAxis: 1 }),
        this.windCancellation && zeroWindSpeedSeries(this.chartPoints, { yAxis: 1 }),
        glideRatioSeries(this.chartPoints, { yAxis: 2 }),
        this.windCancellation && zeroWindGlideRatioSeries(this.chartPoints, { yAxis: 2 }),
        sep50Series(this.chartPoints, { yAxis: 3 })
      ].filter(Boolean)
    }

    this.combinedChartTarget.chart = Highcharts.chart(
      this.combinedChartTarget,
      chartOptions
    )
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
        labels: { enabled: false },
        tickWidth: 0,
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands()
      },
      yAxis: [
        {
          min: 0,
          max: 15,
          tickAmount: 3,
          title: undefined,
          labels: { enabled: false },
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
      series: [sep50Series(this.chartPoints)]
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
        plotLines: this.altitudePlotLines({ includeLabels: true }),
        plotBands: this.bufferPlotBands()
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
        glideRatioSeries(this.chartPoints),
        this.windCancellation && zeroWindGlideRatioSeries(this.chartPoints)
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
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands()
      },
      yAxis: [
        {
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
        horizontalSpeedSeries(this.chartPoints),
        verticalSpeedSeries(this.chartPoints),
        fullSpeedSeries(this.chartPoints),
        this.windCancellation && zeroWindSpeedSeries(this.chartPoints)
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
        plotLines: this.altitudePlotLines(),
        plotBands: this.bufferPlotBands()
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
      series: [altitudeSeries(this.chartPoints)]
    }

    this.altitudeDistanceChartTarget.chart = Highcharts.chart(
      this.altitudeDistanceChartTarget,
      chartOptions
    )
  }

  altitudePlotLines({ includeLabels } = {}) {
    const minAltitude = this.chartPoints.at(-1).altitude
    const maxAltitude = this.chartPoints[0].altitude

    const startMark = Math.ceil(minAltitude / 500) * 500
    const endMark = Math.floor(maxAltitude / 500) * 500

    const positions = []
    for (let altitude = startMark; altitude <= endMark; altitude += 500) {
      const position = findPositionForAltitude(this.chartPoints, altitude)
      positions.push([altitude, position])
    }

    return positions.map(([altitude, position], idx) => ({
      id: `altitude-plot-line-${idx}`,
      value: position,
      width: 1,
      color: '#999',
      ...(includeLabels
        ? {
            label: {
              text: `${altitude} ${I18n.t('units.m')}`,
              style: { color: '#999' },
              y: 10
            }
          }
        : {})
    }))
  }
}
