class Skyderby.views.ExitPerformance extends Backbone.View

  tracks_cache: {}

  places_cache: {}

  events:
    'change .flight-profiles__track input' : 'toggle_track',
    'change select[name="place"]'          : 'toggle_place'

  render: ->
    @init_place_select()
    @init_chart()

  toggle_track: (e) ->
    elem = $(e.currentTarget)
    track_id = elem.closest('li').data('track-id')

    if elem.is(':checked')
      @add_to_chart(track_id)
    else
      @remove_from_chart(track_id)

  add_to_chart: (track_id) ->
    add_series = (data) ->
      chart = @$('.flight-profiles__chart-container').highcharts()
      chart.addSeries({
        name: track_id,
        data: data,
        tooltip: {
          headerFormat: '<span style="font-size: 14px">#{series.name}</span><br/>',
          pointFormat: '<span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>'
        }
      })

    if (cached_data = @tracks_cache[track_id])
      add_series(cached_data)
    else
      $.get('/tracks/' + track_id + '/flight_profile')
        .done( (data) =>
          @tracks_cache[track_id] = data
          add_series(data)
        )

  remove_from_chart: (track_id) ->
    chart = @$('.flight-profiles__chart-container').highcharts()
    for serie in chart.series
      if serie.name == track_id
        serie.remove()
        break

  toggle_place: (e) ->
    place_id   = $(e.currentTarget).val()
    place_name = $(e.currentTarget).children('option:selected').text()

    if (place_id)
      @remove_place_from_chart()
      @add_place_to_chart(place_name, place_id)
    else
      @remove_place_from_chart()

  add_place_to_chart: (place_name, place_id) ->
    add_series = (data) ->
      chart = @$('.flight-profiles__chart-container').highcharts()
      chart.addSeries({
        name: place_name,
        code: 'place_measurements',
        type: 'arearange'
        color: '#B88E8D'
        data: data,
        tooltip: {
          headerFormat: '<span style="font-size: 14px">#{series.name}</span><br/>',
          pointFormat: '<span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>'
        }
      })

    if (cached_data = @places_cache[place_id])
      add_series(cached_data)
    else
      $.get('/api/v1/places/' + place_id + '/exit_measurements')
        .done( (data) =>
          max_altitude = data[data.length-1].altitude
          chart_data = data.map (el) ->
            [el.distance, el.altitude, max_altitude]

          @places_cache[place_id] = chart_data
          add_series(chart_data)
        )

  remove_place_from_chart: ->
    chart = @$('.flight-profiles__chart-container').highcharts()
    for serie in chart.series
      if serie.options.code == 'place_measurements'
        serie.remove()
        break

  init_place_select: ->
    Skyderby.helpers.PlaceSelect(@$('select[name="place"]'), { with_measurements: true })

  init_chart: ->
    @$('.flight-profiles__chart-container').highcharts({
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        },
        series: {
          marker: {
            radius: 1
          },
        }
      },
      xAxis: {
        title: {
          text: 'Distance from exit'
        },
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        min: 0
      },
      yAxis: {
        title: {
          text: 'Altitude usage'
        },
        reversed: true,
        tickInterval: 100,
        min: 0
      },
      credits: {
        enabled: false
      }
    })

