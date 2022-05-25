import React from 'react'
import type { Chart, Point, Series } from 'highcharts'

export const refreshTooltipHandler = (chart: Chart | undefined) => (
  evt: React.MouseEvent | React.TouchEvent
) => {
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
}

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
