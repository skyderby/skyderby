class Skyderby.views.TournamentTrackForm extends Backbone.View
  events:
    'ajax:before'  : 'on_upload_start'
    'ajax:success' : 'on_upload_success'
    'ajax:error'   : 'on_upload_error'
    'ajax:progress.remotipart' : 'on_upload_progress'

  initialize: ->
    @init_form_validation()

  init_form_validation: ->

  on_upload_start: (e) ->
    @$('.upload-progress').css('display', '')

  on_upload_progress: (e) ->
    percents = Math.round(e.loaded / e.total * 100)
    @$('.upload-progress .progress-count').text("(#{percents} %)")
    if percents == 100
      @$('.upload-progress .upload-comment').text('Processing track...')

  on_upload_success: (e) ->
    @$('.upload-progress .spinner').css('display', 'none')
    @$('.upload-progress .done-indicator').css('display', '')
    @$('.upload-progress .upload-comment').text('Done! Rendering scoreboard...')

  on_upload_error: ->
    @hide_upload_progress()

  on_modal_hidden: ->
    @hide_upload_progress()

  hide_upload_progress: ->
    @$('.upload-progress').css('display', 'none')
    @$('.upload-progress .upload-comment').html(
      '<span>Uploading...</span><span class="progress-count"></span>'
    )

