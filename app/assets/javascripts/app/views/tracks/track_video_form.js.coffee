class Skyderby.views.TrackVideoForm extends Backbone.View

  youtube_api_ready: false

  events:
    'change input[name="track_video[url]"]': 'on_change_url'
    'click #set-current-time': 'on_set_current_time_click'

  initialize: ->
    @listenToOnce(Skyderby, 'youtube_api_ready', @on_youtube_api_ready)
    Skyderby.helpers.init_youtube_api()

  on_youtube_api_ready: ->
    @youtube_api_ready = true
    @init_player() if @video_code()

  init_player: ->
    @player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: @video_code(),
      playerVars: {
        fs: 0,
        iv_load_policy: 3,
        rel: 0
      }
    })

  video_code: ->
    @$('.video-code').text()

  on_set_current_time_click: (e) ->
    e.preventDefault()
    return unless @player
    current_time = @player.getCurrentTime()
    @$('input[name="track_video[video_offset]"]').val(current_time.toFixed(1))

  on_change_url: (e) ->
    elem_value = $(e.currentTarget).val()
    code = @get_code_from_url(elem_value)
    @$('.video-code').text(code || '')

    @init_player() if @youtube_api_ready

  get_code_from_url: (url) ->
    regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    regex_matches = regex.exec url
    return unless regex_matches
    regex_matches[2]

