import { Controller } from '@hotwired/stimulus'

const sep50Series = (points, options) => {
  const clampAccuracy = val => Math.round(Math.min(Math.max(val, 0), 15) * 10) / 10
  // const validationWindowStart = windowEndAltitude + validationWindowHeight

  return {
    name: 'SEP 50',
    type: 'column',
    zones: [
      { value: 0, color: '#A6AFBB' },
      { value: 10, color: '#A6AFBB' },
      { color: '#e3353f' }
    ],
    data: points.map(point => ({
      x: point.flTime - points[0].flTime,
      y: clampAccuracy(point.sep50),
      custom: {
        trueValue: Math.round(point.sep50 * 10) / 10,
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
    'combinedChart'
  ]

  connect() {
    this.trackId = this.element.dataset.trackId
    this.result = Number(this.element.dataset.result)
    this.exitAltitude = Number(this.element.dataset.exitAltitude)
    this.chartType = this.element.dataset.chartType
    const initCharts =
      this.chartType === 'separate'
        ? this.initSeparateCharts.bind(this)
        : this.initCombinedCharts.bind(this)

    this.fetchPoints(this.trackId).then(data => initCharts(data))
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

  initSeparateCharts(data) {
    this.initAccuracyChart(data)
    console.log(data)
  }

  initCombinedCharts(data) {
    console.log(data)
  }

  initAccuracyChart(data) {
    const chartOptions = {
      chart: {
        type: 'column'
      },
      title: undefined,
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: { visible: false },
      yAxis: [
        {
          min: 0,
          max: 15,
          tickAmount: 3,
          title: undefined,
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
        formatter: function () {
          const point = this.points[0].point

          return `
            <div>Altitude: ${point.custom.altitude}</div>
            <div>Time: ${point.custom.gpsTime.toISOString().split('T').at(-1)}</div>
            <div>SEP 50: ${point.custom.trueValue}</div>
          `
        }
      },
      series: [sep50Series(data.points)]
    }

    this.accuracyChartTarget.chart = Highcharts.chart(
      this.accuracyChartTarget,
      chartOptions
    )
  }
}
