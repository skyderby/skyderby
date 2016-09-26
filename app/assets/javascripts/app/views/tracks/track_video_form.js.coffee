class Skyderby.views.TrackVideoForm extends Backbone.View

  youtube_api_ready: false

  events:
    'change input[name="track_video[url]"]': 'on_change_url'
    'click #set-current-time': 'on_set_current_time_click'
    'click #dec-track-offset': 'on_decrease_track_offset'
    'click #inc-track-offset': 'on_increase_track_offset'

  initialize: ->
    @listenToOnce(Skyderby, 'youtube_api_ready', @on_youtube_api_ready)
    Skyderby.helpers.init_youtube_api()

    @init_chart()

    @points = @$el.data('points')
    @set_chart_data()

    if @current_track_offset()
      @on_change_track_offset(@current_track_offset())

  on_youtube_api_ready: ->
    @youtube_api_ready = true
    @init_player()

  init_player: ->
    @player ||= new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: @video_code()
      playerVars: {
        fs: 0,
        iv_load_policy: 3,
        rel: 0
      }
    })

    @player.loadVideoById(videoId: @video_code())

  init_chart: ->
    @$('#chart').highcharts(
      chart:
        type: 'area'
        marginLeft: 0
        marginRight: 0
        events:
          click: (event) =>
            @on_change_track_offset(event.xAxis[0].value)
      title:
        floating: true
        text: I18n.t('tracks.edit.elev_chart')
        y: 26
      legend:
        enabled: false
      plotOptions:
        series:
          marker:
            radius: 1
          point:
            events:
              click: (event) =>
                @on_change_track_offset(event.point.x)
      yAxis:
        title:
          text: I18n.t('tracks.edit.elevation') + ', ' + I18n.t('units.m')
        min: 0
        opposite: true
      tooltip:
        crosshairs: true
      credits:
        enabled: false
      series: [
        name: I18n.t('tracks.edit.elevation')
        pointInterval: 10
        tooltip:
          valueSuffix: I18n.t('units.m')
        ]
      )

  on_increase_track_offset: (e) ->
    e.preventDefault()
    @on_change_track_offset(@current_track_offset() + 0.5)

  on_decrease_track_offset: (e) ->
    e.preventDefault()
    @on_change_track_offset(@current_track_offset() - 0.5)

  current_track_offset: ->
    Number(@$('input[name="track_video[track_offset]"]').val())

  on_change_track_offset: (value) ->
    value = value.toFixed(1)
    @$('input[name="track_video[track_offset]"]').val(value)
    chart = @$('#chart').highcharts()
    chart.xAxis[0].removePlotLine('plot-line-track-offset')
    chart.xAxis[0].addPlotLine(
      value: value,
      color: '#FF0000',
      width: 2,
      id: 'plot-line-track-offset'
    )
			 
  set_chart_data: ->
    chart_points = _.map @points, (el) ->
      [el.fl_time, el.altitude]

    @$('#chart').highcharts().series[0].setData(chart_points)

  video_code: ->
    @$('input[name="track_video[video_code]"]').val()

  on_set_current_time_click: (e) ->
    e.preventDefault()
    return unless @player
    current_time = @player.getCurrentTime()
    @$('input[name="track_video[video_offset]"]').val(current_time.toFixed(1))

  on_change_url: (e) ->
    elem_value = $(e.currentTarget).val()
    code = @get_code_from_url(elem_value)
    @$('input[name="track_video[video_code]"]').val(code || '')

    @init_player() if @youtube_api_ready

  get_code_from_url: (url) ->
    regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    regex_matches = regex.exec url
    return unless regex_matches
    regex_matches[2]

