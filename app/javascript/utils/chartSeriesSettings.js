export const restoreSeriesVisibility = (chartName, chartSeries) => {
  chartSeries.forEach(series => {
    const seriesVisible = localStorage.getItem(getKey(chartName, series.options.code))

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
  localStorage.setItem(getKey(chartName, seriesCode), visible)
}

const getKey = (chartName, seriesCode) => `${chartName}/${seriesCode}`
