import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['chart', 'select']

  connect() {
    if (this.highchart) return

    this.data.set('max-value', this.select.getAttribute('data-max-value'))
    const [range_from, range_to] = this.select.value.split(';')

    this.init_chart()
    this.highchart.showLoading()

    const track_id = this.element.getAttribute('data-track-id')
    fetch(`/tracks/${track_id}/altitude_data`, { credentials: 'same-origin' })
      .then(response => response.json())
      .then(data => {
        const chart = this.highchart

        const altitudeData = data.map(point => [point.fl_time, point.altitude])
        const hSpeedData = data.map(point => [point.fl_time, Math.round(point.h_speed)])
        const vSpeedData = data.map(point => [point.fl_time, Math.round(point.v_speed)])
        chart.series[0].setData(altitudeData)
        chart.series[1].setData(hSpeedData)
        chart.series[2].setData(vSpeedData)
        chart.hideLoading()
        this.set_plot_bands(range_from, range_to)
      })
  }

  on_change_range(event) {
    this.set_plot_bands(event.detail.from, event.detail.to)
  }

  set_plot_bands(range_from, range_to) {
    const chart = this.highchart

    chart.xAxis[0].removePlotBand('plotband-start')
    chart.xAxis[0].removePlotBand('plotband-end')

    chart.xAxis[0].addPlotBand({
      from: 0,
      to: range_from,
      color: 'gray',
      id: 'plotband-start'
    })

    chart.xAxis[0].addPlotBand({
      from: range_to,
      to: this.data.get('max-value'),
      color: 'gray',
      id: 'plotband-end'
    })
  }

  init_chart() {
    this.chart.highcharts = new Highcharts.Chart({
      chart: {
        renderTo: this.chart,
        type: 'area',
        zoomType: 'x'
      },
      title: {
        text: I18n.t('tracks.edit.elev_chart')
      },
      plotOptions: {
        series: {
          marker: {
            radius: 1
          }
        }
      },
      yAxis: [
        {
          title: {
            text: null
          },
          min: 0
        },
        {
          title: {
            text: null
          },
          min: 0,
          opposite: true
        }
      ],
      xAxis: {
        plotBands: [
          {
            color: 'gray',
            from: 0,
            to: 0,
            id: 'plotband-start'
          },
          {
            color: 'gray',
            from: 0,
            to: 0,
            id: 'plotband-end'
          }
        ]
      },
      tooltip: {
        shared: true,
        crosshairs: true
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: I18n.t('tracks.edit.elevation'),
          pointInterval: 10,
          tooltip: {
            valueSuffix: ' ' + I18n.t('units.m')
          },
          showInLegend: false
        },
        {
          name: I18n.t('charts.spd.series.ground'),
          type: 'spline',
          code: 'ground_speed',
          color: '#52A964',
          yAxis: 1,
          tooltip: {
            valueSuffix: ` ${I18n.t('units.kmh')}`
          }
        },
        {
          name: I18n.t('charts.spd.series.vertical'),
          type: 'spline',
          code: 'vertical_speed',
          color: '#A7414E',
          yAxis: 1,
          tooltip: {
            valueSuffix: ` ${I18n.t('units.kmh')}`
          }
        }
      ]
    })
  }

  get select() {
    return this.selectTarget
  }

  get chart() {
    return this.chartTarget
  }

  get highchart() {
    return this.chart.highcharts
  }
}
