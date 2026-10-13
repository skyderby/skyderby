import LabeledController from 'controllers/labeled_controller'
import { get } from '@rails/request.js'
import { initYoutubeApi, videoCodeFromUrl, defaultPlayerOptions } from 'utils/youtube'
import smoothScroll from 'utils/smooth_scroll'
import TimeSeriesChart from 'charts/TimeSeriesChart'

const HEADER_HEIGHT = 71
const ALTITUDE_COLOR = '#7cb5ec'
const GROUND_SPEED_COLOR = '#52A964'
const VERTICAL_SPEED_COLOR = '#A7414E'
const TRACK_OFFSET_COLOR = '#FF0000'

export default class extends LabeledController {
  static targets = ['player', 'chart', 'url', 'videoOffset', 'trackOffset']

  connect() {
    initYoutubeApi()
    this.fetchChartData()
  }

  disconnect() {
    this.trackChart?.destroy()
  }

  fetchChartData() {
    get(this.element.getAttribute('data-url'), { responseKind: 'json' })
      .then(response => response.json)
      .then(data => this.initChart(data))
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
    this.trackChart?.setPlotLines(this.trackOffsetPlotLines)
  }

  get trackOffsetPlotLines() {
    return this.trackOffset
      ? [{ value: this.trackOffset, color: TRACK_OFFSET_COLOR }]
      : []
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

  initChart(data) {
    this.trackChart = new TimeSeriesChart(this.chart, {
      title: this.labels.t('tracks.edit.elev_chart'),
      series: [
        this.series(data.altitude, {
          code: 'altitude',
          name: this.labels.t('tracks.edit.elevation'),
          color: ALTITUDE_COLOR,
          axis: 'altitude',
          unit: this.labels.t('units.m')
        }),
        this.series(data.h_speed, {
          code: 'ground_speed',
          name: this.labels.t('charts.spd.series.ground'),
          color: GROUND_SPEED_COLOR,
          axis: 'speed',
          unit: this.labels.t('units.kmh')
        }),
        this.series(data.v_speed, {
          code: 'vertical_speed',
          name: this.labels.t('charts.spd.series.vertical'),
          color: VERTICAL_SPEED_COLOR,
          axis: 'speed',
          unit: this.labels.t('units.kmh')
        })
      ],
      yAxes: [
        { id: 'altitude', min: 0 },
        { id: 'speed', min: 0, position: 'right', grid: false }
      ],
      plotLines: this.trackOffsetPlotLines,
      onClick: time => this.setTrackOffset(time)
    })
  }

  series(pairs, { unit, ...options }) {
    return {
      ...options,
      xs: pairs.map(([x]) => x),
      ys: pairs.map(([, y]) => y),
      value: i => `${Math.round(pairs[i][1])} ${unit}`
    }
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

  set videoOffset(value) {
    this.videoOffsetTarget.value = value.toFixed(1)
  }

  get trackOffset() {
    return Number(this.trackOffsetTarget.value)
  }

  set trackOffset(value) {
    this.trackOffsetTarget.value = value.toFixed(1)
  }
}
