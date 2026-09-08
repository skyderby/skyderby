const activeSeries = chart =>
  chart.series.filter(
    series =>
      series.visible && series.enableMouseTracking !== false && series.points?.length
  )

const highlight = (chart, points) => {
  if (points.length === 0) return

  points[0].onMouseOver()
  chart.tooltip.refresh(points)
  chart.xAxis[0].drawCrosshair(null, points[0])
}

const hide = chart => {
  chart.tooltip?.hide()
  chart.xAxis[0]?.hideCrosshair()
}

const nearestIndex = (points, targetX) => {
  let nearest = 0
  let minDiff = Infinity

  points.forEach((point, index) => {
    const diff = Math.abs(point.x - targetX)
    if (diff < minDiff) {
      minDiff = diff
      nearest = index
    }
  })

  return nearest
}

export const syncCrosshairByIndex = (charts, index) => {
  charts.filter(Boolean).forEach(chart => {
    const points = activeSeries(chart)
      .map(series => series.points[index])
      .filter(Boolean)
    highlight(chart, points)
  })
}

export const syncCrosshairByX = (charts, targetX) => {
  charts.filter(Boolean).forEach(chart => {
    const series = activeSeries(chart)
    const base = series[0]
    if (!base) return

    const basePoints = base.points
    if (targetX < basePoints[0].x || targetX > basePoints.at(-1).x) {
      hide(chart)
      return
    }

    const index = nearestIndex(basePoints, targetX)
    const points = series.map(s => s.points[index]).filter(Boolean)
    highlight(chart, points)
  })
}
