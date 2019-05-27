import { Controller } from 'stimulus'
import { initYoutubeApi, videoCodeFromUrl, defaultPlayerOptions } from 'utils/youtube'
import smooth_scroll from 'utils/smooth_scroll'

const HEADER_HEIGHT = 71

export default class extends Controller {
  static targets = ['player', 'chart', 'url', 'video_offset', 'track_offset']

  connect() {
    initYoutubeApi()
    this.init_chart()
    this.fetch_chart_data()
  }

  fetch_chart_data() {
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

  on_youtube_api_ready() {
    this.init_player()
  }

  on_change_url() {
    this.init_player()
    this.scroll_to(this.player_position)
  }

  set_video_offset(event) {
    event.preventDefault()
    if (!this.player) return

    this.video_offset = this.player.getCurrentTime()

    this.scroll_to(this.chart_position)
  }

  decrease_track_offset(event) {
    event.preventDefault()
    this.change_track_offset(-0.5)
  }

  increase_track_offset(event) {
    event.preventDefault()
    this.change_track_offset(0.5)
  }

  change_track_offset(value) {
    this.track_offset = this.track_offset + value
    this.update_plot_line()
  }

  set_track_offset(value) {
    this.track_offset = value
    this.update_plot_line()
  }

  scroll_to(position) {
    smooth_scroll(document.documentElement, position - HEADER_HEIGHT, 700)
  }

  update_plot_line() {
    this.highchart.xAxis[0].removePlotLine('plot-line-track-offset')

    if (!this.track_offset) return

    this.highchart.xAxis[0].addPlotLine({
      value: this.track_offset,
      color: '#FF0000',
      width: 2,
      id: 'plot-line-track-offset'
    })
  }

  init_player() {
    if (this.player) {
      this.player.loadVideoById({ videoId: this.video_code })
      return
    }

    this.player = new YT.Player(
      this.playerTarget,
      Object.assign(defaultPlayerOptions, { videoId: this.video_code })
    )
  }

  init_chart() {
    this.chart.highcharts = new Highcharts.Chart(this.chart, this.chart_options)
    this.highchart.showLoading()
    this.update_plot_line()
  }

  get video_code() {
    return videoCodeFromUrl(this.url)
  }

  get url() {
    return this.urlTarget.value
  }

  get player_position() {
    return this.playerTarget.getBoundingClientRect().top + pageYOffset
  }

  get chart() {
    return this.chartTarget
  }

  get chart_position() {
    return this.chart.getBoundingClientRect().top + pageYOffset
  }

  get highchart() {
    return this.chart.highcharts
  }

  set video_offset(value) {
    this.video_offsetTarget.value = value.toFixed(1)
  }

  get track_offset() {
    return Number(this.track_offsetTarget.value)
  }

  set track_offset(value) {
    this.track_offsetTarget.value = value.toFixed(1)
  }

  get chart_options() {
    return {
      chart: {
        type: 'spline',
        marginLeft: 0,
        marginRight: 0,
        zoomType: 'x',
        events: {
          click: event => {
            if (event.target.textContent) return
            this.set_track_offset(event.xAxis[0].value)
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
                this.set_track_offset(event.point.x)
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
