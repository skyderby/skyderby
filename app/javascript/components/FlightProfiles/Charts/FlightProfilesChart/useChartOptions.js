import { useMemo } from 'react'
import I18n from 'i18n-js'

const useChartOptions = () => {
  const options = useMemo(() => ({
    chart: {
      type: 'spline',
      zoomType: 'x'
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
        setExtremes: function(event) {
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
    }
  }), [])

  return options
}

export default useChartOptions
