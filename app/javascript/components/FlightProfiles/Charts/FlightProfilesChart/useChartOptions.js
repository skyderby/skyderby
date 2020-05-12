import { useMemo } from 'react'
import I18n from 'i18n-js'

const useChartOptions = onZoomChange => {
  const options = useMemo(
    () => ({
      chart: {
        type: 'spline',
        zoomType: 'x',
        events: {
          selection: function (evt) {
            if (evt.xAxis) {
              const { min, max } = evt.xAxis[0]
              onZoomChange({ min, max })
            } else {
              onZoomChange(undefined)
            }
          }
        }
      },
      title: {
        text: I18n.t('flight_profiles')
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
          }
        }
      },
      xAxis: {
        title: {
          text: 'Distance from exit'
        },
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        min: 0,
        events: {
          setExtremes: function (event) {
            this.chart.yAxis[0].setExtremes(event.min, event.max, true)
          }
        }
      },
      yAxis: {
        title: {
          text: 'Altitude usage'
        },
        reversed: true,
        tickInterval: 100,
        min: 0
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      }
    }),
    [onZoomChange]
  )

  return options
}

export default useChartOptions
