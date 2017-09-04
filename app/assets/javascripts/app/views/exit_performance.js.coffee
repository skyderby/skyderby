class Skyderby.views.ExitPerformance extends Backbone.View

  tracks_cache: {}

  events:
    'change .exit-performance__track input' : 'toggle_track'

  render: ->
    @init_chart()

  toggle_track: (e) ->
    elem = $(e.currentTarget)
    track_id = elem.closest('li').data('track-id')

    if elem.is(':checked')
      @add_to_chart(track_id)
    else
      @remove_from_chart(track_id)

  add_to_chart: (track_id) ->
    chart = @$('.exit-performance__chart-container').highcharts()

    if (cached_data = @tracks_cache[track_id])
      chart.addSeries({ name: track_id, data: cached_data })
    else
      $.get('/tracks/' + track_id + '/exit_performance')
        .done( (data) =>
          @tracks_cache[track_id] = data
          chart.addSeries({ name: track_id, data: data })
        )

  remove_from_chart: (track_id) ->
    chart = @$('.exit-performance__chart-container').highcharts()
    for serie in chart.series
      if serie.name == track_id
        serie.remove()
        break

  init_chart: ->
    @$('.exit-performance__chart-container').highcharts({
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      xAxis: {
        title: {
          text: 'Distance from exit'
        },
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        # tickPixelInterval: 72,
      },
      yAxis: {
        title: {
          text: 'Altitude usage'
        },
        reversed: true,
        tickInterval: 100,
        # tickPixelInterval: 72,
      },
      credits: {
        enabled: false
      }
    })

