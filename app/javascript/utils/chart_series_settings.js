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
