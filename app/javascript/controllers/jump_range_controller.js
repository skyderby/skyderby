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

        chart.series[0].setData(data)
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
        type: 'area'
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
      yAxis: {
        title: {
          text: null
        }
      },
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
