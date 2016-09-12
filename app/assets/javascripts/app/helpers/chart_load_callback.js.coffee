Skyderby.helpers.chart_load_callback = (prefix, chart_series) ->
  for series in chart_series
    series_visible = localStorage.getItem(prefix + series.options.code)
    continue if series_visible == null
    if series_visible == 'true'
      series.show()
    else
      series.hide()
