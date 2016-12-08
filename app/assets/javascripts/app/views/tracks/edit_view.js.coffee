class Skyderby.views.TrackEditView extends Backbone.View

  suit_mode: 'select',
  place_mode: 'select',
  pilot_mode: 'select',

  events:
    'click .toggle-suit'         : 'on_toggle_suit_mode',
    'click .toggle-place'        : 'on_toggle_place_mode',
    'click .toggle-profile'      : 'on_toggle_pilot_mode',
    'click input[type="submit"]' : 'on_click_submit'

  initialize: (opts) ->
    @max_rel_time = opts.max_rel_time

    @on('change:suit_mode', @on_suit_mode_change)
    @on('change:place_mode', @on_place_mode_change)
    @on('change:pilot_mode', @on_pilot_mode_change)

    selects_set = {
      profile_id: 'pilot_mode',
      place_id: 'place_mode',
      wingsuit_id: 'suit_mode'
    }

    for attr_name, mode of selects_set
      selector = "select[name='track[#{attr_name}]'] > option:selected"
      return if !!$(selector).val()
      this[mode] = 'input'

  render: () ->

    range_from = @$('#ff_start').val()
    range_to =  @$('#ff_end').val()
    @init_range_selector(range_from, range_to)
    @set_plot_bands(range_from, range_to)

    @on_suit_mode_change()
    @on_place_mode_change()
    @on_pilot_mode_change()

  init_range_selector: (range_from, range_to) ->
    $("#time-selector").ionRangeSlider(
      min: 0,
      max: @max_rel_time,
      type: 'double',
      step: 1,
      prettify: false,
      hasGrid: true,
      from: range_from,
      to: range_to,
      onChange: (obj) =>
        @set_plot_bands(obj.fromNumber, obj.toNumber)
    )

  set_plot_bands: (range_from, range_to) ->
    chart = $('#heights-chart').highcharts()
    chart.xAxis[0].removePlotBand('plotband-start')
    chart.xAxis[0].removePlotBand('plotband-end')

    chart.xAxis[0].addPlotBand({
      from: 0,
      to: range_from,
      color: 'gray',
      id: 'plotband-start'
    })

    chart.xAxis[0].addPlotBand({
      from: range_to,
      to: @max_rel_time,
      color: 'gray',
      id: 'plotband-end'
    })

    @$('#ff_start').val(range_from)
    @$('#ff_end').val(range_to)

  on_toggle_suit_mode: (e) ->
    e.preventDefault()

    @suit_mode = if @suit_mode is 'select' then 'input' else 'select'

    @trigger('change:suit_mode')

  on_toggle_place_mode: (e) ->
    e.preventDefault()

    @place_mode = if @place_mode is 'select' then 'input' else 'select'

    @trigger('change:place_mode')

  on_toggle_pilot_mode: (e) ->
    e.preventDefault()

    @pilot_mode = if @pilot_mode is 'select' then 'input' else 'select'

    @trigger('change:pilot_mode')

  on_suit_mode_change: () ->
    link = @$('.toggle-suit')
    caption = @$('.toggle-suit-caption')
    input = @$('input[name="track[suit]"]')
    select_el = @$('select[name="track[wingsuit_id]"] + span')

    if @suit_mode == 'select'
      link.text(I18n.t('tracks.form.toggle_suit_link'))
      caption.text(I18n.t('tracks.form.toggle_suit_caption'))
      input.hide()
      select_el.show()
    else
      link.text(I18n.t('tracks.form.toggle_suit_link_select'))
      caption.text(I18n.t('tracks.form.toggle_suit_caption_select'))
      input.show()
      select_el.hide()

  on_place_mode_change: () ->
    link = @$('.toggle-place')
    caption = @$('.toggle-place-caption')
    input = @$('input[name="track[location]"]')
    select_el = @$('select[name="track[place_id]"] + span')

    if @place_mode == 'select'
      link.text(I18n.t('tracks.form.toggle_place_link'))
      caption.text(I18n.t('tracks.form.toggle_place_caption'))
      input.hide()
      select_el.show()
    else
      link.text(I18n.t('tracks.form.toggle_place_link_select'))
      caption.text(I18n.t('tracks.form.toggle_place_caption_select'))
      input.show()
      select_el.hide()

  on_pilot_mode_change: () ->
    link = @$('.toggle-profile')
    caption = @$('.toggle-profile-caption')
    input = @$('input[name="track[name]"]')
    select_el = @$('select[name="track[profile_id]"] + span')

    if @pilot_mode == 'select'
      link.text(I18n.t('tracks.form.toggle_profile_link'))
      caption.text(I18n.t('tracks.form.toggle_profile_caption'))
      input.hide()
      select_el.show()
    else
      link.text(I18n.t('tracks.form.toggle_profile_link_select'))
      caption.text(I18n.t('tracks.form.toggle_profile_caption_select'))
      input.show()
      select_el.hide()

  on_click_submit: () ->
    if @suit_mode == 'select'
      @$('input[name="track[suit]"]').val('')
    else
      @$('select[name="track[wingsuit_id]"]').val('')

    if @place_mode == 'select'
      @$('input[name="track[location]"]').val('')
    else
      @$('select[name="track[place_id]"]').val('')

    if @pilot_mode == 'select'
      @$('input[name="track[name]"]').val()
    else
      @$('select[name="track[profile_id]"]').val('')
