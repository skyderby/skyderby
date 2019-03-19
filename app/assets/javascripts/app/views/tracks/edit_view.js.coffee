class Skyderby.views.TrackEditView extends Backbone.View

  place_mode: 'select',

  events:
    'click input[type="submit"]' : 'on_click_submit',
    'change [name="track[jump_range]"]'  : 'on_change_range'
    'ajax:beforeSend .track-edit__refresh-range': 'on_refresh_start'
    'ajax:complete .track-edit__refresh-range': 'on_refresh_complete'

  on_refresh_start: (e) ->
    $(e.currentTarget).find('i').addClass('fa-spin')

  on_refresh_complete: (e) ->
    $(e.currentTarget).find('i').removeClass('fa-spin')

  on_click_submit: () ->
    if @place_mode == 'select'
      @$('input[name="track[location]"]').val('')
    else
      @$('select[name="track[place_id]"]').val('')

    if @pilot_mode == 'select'
      @$('input[name="track[name]"]').val()
    else
      @$('select[name="track[profile_id]"]').val('')
