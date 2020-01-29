export const buildRefreshTooltipHandler = chartRef => evt => {
  const chart = chartRef.current
  if (!chart) return

  const normalizedEvent = chart.pointer.normalize(evt)

  const points = chart.series.reduce((result, series) => {
    if (!series.visible || series.enableMouseTracking === false) return result

    const point = series.searchPoint(event, true)
    if (point) result.push(point)

    return result
  }, [])

  if (points.length > 0) {
    points[0].onMouseOver()
    chart.tooltip.refresh(points)
    chart.xAxis[0].drawCrosshair(normalizedEvent, points[0])
  }
}
