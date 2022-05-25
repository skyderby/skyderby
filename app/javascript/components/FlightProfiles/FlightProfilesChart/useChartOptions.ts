import { useMemo } from 'react'
import type {
  Axis,
  AxisSetExtremesEventObject,
  Chart,
  ChartSelectionContextObject,
  Options
} from 'highcharts'

import { useI18n } from 'components/TranslationsProvider'

type zoomChangeCallback = (zoom: { min: number; max: number } | null) => unknown

const useChartOptions = (onZoomChange: zoomChangeCallback): Options => {
  const { t } = useI18n()

  return useMemo<Options>(
    () => ({
      chart: {
        type: 'spline',
        zoomType: 'x',
        events: {
          selection: function (this: Chart, event: ChartSelectionContextObject) {
            if (event.xAxis?.[0]) {
              const { min, max } = event.xAxis[0]
              onZoomChange({ min, max })
            } else {
              onZoomChange(null)
            }

            return undefined
          }
        }
      },
      title: {
        text: t('flight_profiles.title'),
        margin: 10,
        style: {
          fontFamily: 'Proxima Nova',
          fontWeight: '500'
        }
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
          fillOpacity: 0.7,
          states: {
            inactive: {
              enabled: false
            }
          }
        }
      },
      xAxis: {
        title: {
          text: 'Distance from exit'
        },
        crosshair: true,
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        min: 0,
        events: {
          setExtremes: function (this: Axis, event: AxisSetExtremesEventObject) {
            this.chart?.yAxis?.[0]?.setExtremes(event.min, event.max, true)
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
    [onZoomChange, t]
  )
}

export default useChartOptions
