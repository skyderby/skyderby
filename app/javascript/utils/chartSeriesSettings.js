export const refreshTooltipHandler = chart => evt => {
  if (!chart) return

  const normalizedEvent = chart.pointer?.normalize(evt.nativeEvent)

  if (!normalizedEvent) return

  const points = chart.series.reduce((result, series) => {
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

const getKey = (chartName, seriesCode) => `${chartName}/${seriesCode}`

export const restoreSeriesVisibility = (chartName, chartSeries) => {
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

export const saveSeriesVisibility = (chartName, seriesCode, visible) => {
  if (!seriesCode) return

  localStorage.setItem(getKey(chartName, seriesCode), String(visible))
}

window.chartLoadCallback = (prefix, chart_series) => {
  chart_series.forEach(series => {
    const series_visible = localStorage.getItem(`${prefix}${series.options.code}`)

    if (series_visible == null) {
      return
    } else if (series_visible === 'true') {
      series.show()
    } else {
      series.hide()
    }
  })
}
