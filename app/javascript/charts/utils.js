import I18n from 'i18n'

export const tooltipFormatter = function () {
  const point = this.points[0].point

  return `
    <div>Altitude: ${point.options.custom.altitude} ${I18n.t('units.m')}</div>
    <div>Time: ${point.options.custom.gpsTime.toISOString().split('T').at(-1)}</div>
    ${this.points
      .map(
        p =>
          `<span style="color:${p.series.color}">\u25CF</span> ${p.series.name}: <b>${p.point.options.custom.tooltipValue}</b><br/>`
      )
      .join('')}
  `
}

export const findPositionForAltitude = (points, altitude) => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  if (idx === -1) return null

  const firstPoint = points[idx]
  const secondPoint = points[idx + 1]

  const flTime =
    firstPoint.flTime +
    ((secondPoint.flTime - firstPoint.flTime) /
      (firstPoint.altitude - secondPoint.altitude)) *
      (firstPoint.altitude - altitude)

  return flTime - points[0].flTime
}

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
