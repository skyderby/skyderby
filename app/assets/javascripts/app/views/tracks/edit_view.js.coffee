class Skyderby.views.TrackEditView extends Backbone.View

  place_mode: 'select',
  pilot_mode: 'select',

  events:
    'click .toggle-place'        : 'on_toggle_place_mode',
    'click .toggle-profile'      : 'on_toggle_pilot_mode',
    'click input[type="submit"]' : 'on_click_submit',
    'change [name="track[jump_range]"]'  : 'on_change_range'
    'ajax:beforeSend .track-edit__refresh-range': 'on_refresh_start'
    'ajax:complete .track-edit__refresh-range': 'on_refresh_complete'

  initialize: (opts) ->
    @on('change:place_mode', @on_place_mode_change)
    @on('change:pilot_mode', @on_pilot_mode_change)

    selects_set = {
      profile_id: 'pilot_mode',
      place_id: 'place_mode'
    }

    for attr_name, mode of selects_set
      selector = "select[name='track[#{attr_name}]'] > option:selected"
      continue if !!$(selector).val()
      this[mode] = 'input'

  render: () ->
    @on_place_mode_change()
    @on_pilot_mode_change()

  on_refresh_start: (e) ->
    $(e.currentTarget).find('i').addClass('fa-spin')

  on_refresh_complete: (e) ->
    $(e.currentTarget).find('i').removeClass('fa-spin')

  on_toggle_place_mode: (e) ->
    e.preventDefault()

    @place_mode = if @place_mode is 'select' then 'input' else 'select'

    @trigger('change:place_mode')

  on_toggle_pilot_mode: (e) ->
    e.preventDefault()

    @pilot_mode = if @pilot_mode is 'select' then 'input' else 'select'

    @trigger('change:pilot_mode')

  on_place_mode_change: () ->
    link = @$('.toggle-place')
    caption = @$('.toggle-place-caption')
    input = @$('input[name="track[location]"]')
    select = @$('select[name="track[place_id]"]')
    select_control = @$('select[name="track[place_id]"] + span')

    if @place_mode == 'select'
      link.text(I18n.t('tracks.form.toggle_place_link'))
      caption.text(I18n.t('tracks.form.toggle_place_caption'))
      input.hide()
      select.show()
      select_control.show()
    else
      link.text(I18n.t('tracks.form.toggle_place_link_select'))
      caption.text(I18n.t('tracks.form.toggle_place_caption_select'))
      input.show()
      select.hide()
      select_control.hide()

  on_pilot_mode_change: () ->
    link = @$('.toggle-profile')
    caption = @$('.toggle-profile-caption')
    input = @$('input[name="track[name]"]')
    select = @$('select[name="track[profile_id]"]')
    select_control = @$('select[name="track[profile_id]"] + span')

    if @pilot_mode == 'select'
      link.text(I18n.t('tracks.form.toggle_profile_link'))
      caption.text(I18n.t('tracks.form.toggle_profile_caption'))
      input.hide()
      select.show()
      select_control.show()
    else
      link.text(I18n.t('tracks.form.toggle_profile_link_select'))
      caption.text(I18n.t('tracks.form.toggle_profile_caption_select'))
      input.show()
      select.hide()
      select_control.hide()

  on_click_submit: () ->
    if @place_mode == 'select'
      @$('input[name="track[location]"]').val('')
    else
      @$('select[name="track[place_id]"]').val('')

    if @pilot_mode == 'select'
      @$('input[name="track[name]"]').val()
    else
      @$('select[name="track[profile_id]"]').val('')
