import type { Options } from 'highcharts'

type ZoomLevel = null | {
  min?: number
  max?: number
}

const useChartOptions = (zoomLevel: ZoomLevel = {}): Options => {
  return {
    chart: {
      type: 'spline',
      height: '150px'
    },
    title: {
      text: undefined
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
        states: {
          inactive: {
            enabled: false
          }
        },
        zones: [
          {
            value: 0
          },
          {
            value: 5,
            color: 'red'
          }
        ]
      }
    },
    yAxis: {
      title: {
        text: 'Terrain clearance'
      },
      gridLineWidth: 1,
      tickInterval: 25,
      min: 0,
      max: 125,
      plotBands: [
        {
          color: '#efcdcb',
          from: 0,
          to: 25
        },
        {
          color: '#e4f1de',
          from: 100,
          to: 125
        }
      ]
    },
    xAxis: {
      title: {
        text: null
      },
      crosshair: true,
      tickInterval: 100,
      tickLength: 0,
      gridLineWidth: 1,
      min: zoomLevel?.min || 0,
      max: zoomLevel?.max,
      labels: {
        enabled: false
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    }
  }
}

export default useChartOptions
