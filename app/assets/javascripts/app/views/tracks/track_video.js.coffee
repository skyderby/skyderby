class Skyderby.views.TrackReplayView extends Backbone.View

  done: false,
    
  yt_timer_id: 0,

  initialize: ->
    @listenToOnce(Skyderby, 'youtube_api_ready', @on_youtube_api_ready)
    Skyderby.helpers.init_youtube_api()

  on_youtube_api_ready: ->
    @init_player()

  init_player: ->
    @player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: @model.get('video_code'),
      playerVars: {
        fs: 0,
        iv_load_policy: 3,
        rel: 0
      },
      events: {
        'onStateChange': @on_player_state_change.bind(this)
      }
    })

  on_player_state_change: (event) ->
    if event.data == YT.PlayerState.PLAYING && !@done
      @yt_timer_id = setInterval( =>
        curTime = @player.getCurrentTime()
        @updateProgress(curTime)
      , 500)
      @done = true;
    else if event.data == YT.PlayerState.ENDED || event.data == YT.PlayerState.PAUSED
      if @yt_timer_id
        clearInterval(@yt_timer_id)
        @done = false

  updateProgress: (cur_time) ->
    el = @model.data_on_time(cur_time);

    if (el) 
      @$('#p_cur_h_speed').text(Math.round(el.h_speed))
      @$('#p_cur_v_speed').text(Math.round(el.v_speed))
      @$('#p_cur_gr').text(el.glide_ratio)
      @$('#p_cur_elev').text(el.altitude)
      @$('#p_elev_diff').text(el.elev_diff)
    else
      @$('#p_cur_h_speed').text('---')
      @$('#p_cur_v_speed').text('---')
      @$('#p_cur_gr').text('-.--')
      @$('#p_cur_elev').text('---')
      @$('#p_elev_diff').text('---')
