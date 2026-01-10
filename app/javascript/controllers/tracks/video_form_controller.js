import { Controller } from '@hotwired/stimulus'
import { initYoutubeApi, videoCodeFromUrl, defaultPlayerOptions } from 'utils/youtube'
import smoothScroll from 'utils/smooth_scroll'
import I18n from 'i18n'

const HEADER_HEIGHT = 71

export default class extends Controller {
  static targets = ['player', 'chart', 'url', 'videoOffset', 'trackOffset']

  connect() {
    initYoutubeApi()
    this.initChart()
    this.fetchChartData()
  }

  fetchChartData() {
    fetch(this.element.getAttribute('data-url'), { credentials: 'same-origin' })
      .then(response => response.json())
      .then(data => {
        const chart = this.highchart

        chart.series[0].setData(data.altitude)
        chart.series[1].setData(data.h_speed)
        chart.series[2].setData(data.v_speed)
        chart.hideLoading()
      })
  }

  onYoutubeApiReady() {
    this.initPlayer()
  }

  onChangeUrl() {
    this.initPlayer()
    this.scrollTo(this.playerPosition)
  }

  setVideoOffset(event) {
    event.preventDefault()
    if (!this.player) return

    this.videoOffset = this.player.getCurrentTime()

    this.scrollTo(this.chartPosition)
  }

  decreaseTrackOffset(event) {
    event.preventDefault()
    this.changeTrackOffset(-0.5)
  }

  increaseTrackOffset(event) {
    event.preventDefault()
    this.changeTrackOffset(0.5)
  }

  changeTrackOffset(value) {
    this.trackOffset = this.trackOffset + value
    this.updatePlotLine()
  }

  setTrackOffset(value) {
    this.trackOffset = value
    this.updatePlotLine()
  }

  scrollTo(position) {
    smoothScroll(document.documentElement, position - HEADER_HEIGHT, 700)
  }

  updatePlotLine() {
    this.highchart.xAxis[0].removePlotLine('plot-line-track-offset')

    if (!this.trackOffset) return

    this.highchart.xAxis[0].addPlotLine({
      value: this.trackOffset,
      color: '#FF0000',
      width: 2,
      id: 'plot-line-track-offset'
    })
  }

  initPlayer() {
    if (this.player && this.videoCode) {
      this.player.loadVideoById({ videoId: this.videoCode })
      return
    }

    this.player = new YT.Player(
      this.playerTarget,
      Object.assign(
        defaultPlayerOptions,
        this.videoCode ? { videoId: this.videoCode } : {}
      )
    )
  }

  initChart() {
    this.chart.highcharts = new Highcharts.Chart(this.chart, this.chartOptions)
    this.highchart.showLoading()
    this.updatePlotLine()
  }

  get videoCode() {
    return videoCodeFromUrl(this.url)
  }

  get url() {
    return this.urlTarget.value
  }

  get playerPosition() {
    return this.playerTarget.getBoundingClientRect().top + pageYOffset
  }

  get chart() {
    return this.chartTarget
  }

  get chartPosition() {
    return this.chart.getBoundingClientRect().top + pageYOffset
  }

  get highchart() {
    return this.chart.highcharts
  }

  set videoOffset(value) {
    this.videoOffsetTarget.value = value.toFixed(1)
  }

  get trackOffset() {
    return Number(this.trackOffsetTarget.value)
  }

  set trackOffset(value) {
    this.trackOffsetTarget.value = value.toFixed(1)
  }

  get chartOptions() {
    return {
      chart: {
        type: 'spline',
        marginLeft: 0,
        marginRight: 0,
        zoomType: 'x',
        events: {
          click: event => {
            if (event.target.textContent) return
            this.setTrackOffset(event.xAxis[0].value)
          }
        }
      },
      title: {
        floating: true,
        text: I18n.t('tracks.edit.elev_chart'),
        y: 26
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          marker: {
            radius: 1
          },
          point: {
            events: {
              click: event => {
                this.setTrackOffset(event.point.x)
              }
            }
          }
        }
      },
      yAxis: [
        {
          title: {
            text: I18n.t('tracks.edit.elevation') + ', ' + I18n.t('units.m')
          },
          min: 0,
          opposite: true
        },
        {
          min: 0,
          opposite: true
        }
      ],
      tooltip: {
        crosshairs: true,
        shared: true,
        valueDecimals: 0
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: I18n.t('tracks.edit.elevation'),
          yAxis: 0,
          pointInterval: 10,
          tooltip: {
            valueSuffix: ' ' + I18n.t('units.m')
          }
        },
        {
          name: I18n.t('charts.spd.series.ground'),
          yAxis: 1,
          color: '#52A964',
          tooltip: {
            valueSuffix: ' ' + I18n.t('units.kmh')
          }
        },
        {
          name: I18n.t('charts.spd.series.vertical'),
          yAxis: 1,
          color: '#A7414E',
          tooltip: {
            valueSuffix: ' ' + I18n.t('units.kmh')
          }
        }
      ]
    }
  }
}
