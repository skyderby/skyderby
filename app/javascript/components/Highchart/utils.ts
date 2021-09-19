import React from 'react'
import { PointerEventObject, Series } from 'highcharts'
import throttle from 'lodash.throttle'
import { Chart, Point } from 'highcharts'

// See: https://github.com/highcharts/highcharts/issues/12532
// searchPoint method missing in Series' typescript definition
declare module 'highcharts' {
  interface Series {
    searchPoint: (event: PointerEventObject, compareX: boolean) => Point | undefined
  }
}

export const refreshTooltipHandler = throttle(
  (chart: Chart | undefined) => (evt: React.MouseEvent | React.TouchEvent) => {
    if (!chart) return

    const normalizedEvent = chart.pointer?.normalize(evt.nativeEvent)

    if (!normalizedEvent) return

    const points = chart.series.reduce((result: Point[], series) => {
      if (!series.visible || series.options.enableMouseTracking === false) return result

      const point = series.searchPoint(normalizedEvent, true)
      if (point) result.push(point)

      return result
    }, [])

    if (points.length > 0) {
      chart.tooltip.refresh(points)
      chart.xAxis[0].drawCrosshair(normalizedEvent, points[0])
    }
  },
  20
)

const getKey = (chartName: string, seriesCode: string) => `${chartName}/${seriesCode}`

export const restoreSeriesVisibility = (
  chartName: string,
  chartSeries: Series[]
): void => {
  chartSeries.forEach(series => {
    const seriesCode = series.options.custom?.code
    if (!seriesCode) return

    const seriesVisible = localStorage.getItem(getKey(chartName, seriesCode))

    if (seriesVisible == null) {
      return
    } else if (seriesVisible === 'true') {
      series.show()
    } else {
      series.hide()
    }
  })
}

export const saveSeriesVisibility = (
  chartName: string,
  seriesCode: string | undefined,
  visible: boolean
): void => {
  if (!seriesCode) return

  localStorage.setItem(getKey(chartName, seriesCode), String(visible))
}
