class Skyderby.views.EventView extends Backbone.View

    fa_fw_template:            JST['app/templates/fa_fw']
    edit_commands:             JST['app/templates/edit_commands']
    edit_event:                JST['app/templates/edit_event']
    wind_cancellation_caption: JST['app/templates/events/wind_cancellation_caption']

    can_manage: false
    results_adjusted_for_wind: false

    events:
      'click .button-add-class'          : 'add_class_click'
      'click .button-add-competitor'     : 'add_competitor_click'
      'click .add-distance-round'        : 'add_distance_round_click'
      'click .add-speed-round'           : 'add_speed_round_click'
      'click .add-time-round'            : 'add_time_round_click'
      'click .edit-event'                : 'edit_event_click'
      'click .add-sponsor'               : 'add_sponsor_click'
      'click .add-organizer'             : 'add_organizer_click'
      'click #wind-cancellation-settings': 'setup_wind_cancellation'
      'click .event-set-status-draft'    : 'set_status_draft'
      'click .event-set-status-published': 'set_status_published'
      'click .event-set-status-finished' : 'set_status_finished'
      'click #switch-results-mode'       : 'switch_results_mode'

    initialize: (opts) ->
      @can_manage = opts.can_manage if _.has(opts, 'can_manage')

      @results_adjusted_for_wind = @model.get('wind_cancellation')

      @scoreboard = new Skyderby.views.Scoreboard
        parent_view: this
        model: @model
        can_manage: @can_manage
        results_adjusted_for_wind: @results_adjusted_for_wind

      @listenTo(@model.sponsors, 'add', @add_sponsor)
      @listenTo(@model.organizers, 'add', @add_organizer)
      @listenTo(@model, 'change', @update_fields)

      @render()

    render: ->
      @update_fields()
        
      @render_controls()

      @scoreboard.render()

      @organizers = $('#judges-list')
      @sponsors = $('#sponsors')

      @add_all_organizers()
      @add_all_sponsors()

    render_controls: ->
      $('#edit-event-commands').append(@edit_event()) if @can_manage

      $('#edit-table-commands').append(@edit_commands(
          rules: window.Competition.rules,
          status: window.Competition.get('status'),
          can_manage: @can_manage
      )).addClass('top-buffer')

    update_fields: ->
      $('#title-competition-name').text(@model.get('name'))
      $('#title-competition-range').text(
        I18n.t('events.show.comp_window') +
        ': ' + @model.get('range_from') +
        ' - ' + @model.get('range_to') +
        ' ' + I18n.t('units.m')
      )

      if (@model.has('place'))
        place = @model.get('place')
        place_text = 
          I18n.t('activerecord.attributes.event.place') + ': ' + place.name

        if (place.msl)
          place_text += ' (MSL: ' + place.msl + ' ' + I18n.t('units.m') + ')'

        $('#title-competition-place').show().text(place_text)
      else
        $('#title-competition-place').hide()

      @$('.event-status-button').text(
        I18n.t('activerecord.attributes.event.status') + ': ' + I18n.t('event_status.' + @model.get('status'))
      ) if @can_manage

      @set_wind_cancellation_caption()

    add_organizer: (organizer) ->
      view = new Skyderby.views.EventOrganizer
        model: organizer,
        can_manage: @can_manage
      @organizers.append(view.render().el)   

    add_all_organizers: ->
      @model.organizers.each(@add_organizer, this)

    add_sponsor: (sponsor) ->
      view = new Skyderby.views.EventSponsor
        model: sponsor,
        can_manage: @can_manage
      @sponsors.append(view.render().el)

    add_all_sponsors: ->
      @model.sponsors.each(@add_sponsor, this)

    add_class_click: (e) ->
      e.preventDefault()
      new_section = new Skyderby.models.Section()
      section_form = new Skyderby.views.SectionForm(model: new_section)
      section_form.render().open()

    add_competitor_click: (e) ->
      e.preventDefault()
      new_competitor = new Skyderby.models.Competitor()
      competitor_form = new Skyderby.views.CompetitorForm(model: new_competitor)
      competitor_form.render().open()

    add_distance_round_click: (e) ->
      e.preventDefault()
      window.Competition.rounds.create({discipline: 'distance'}, {wait: true})
    
    add_speed_round_click: (e) ->
      e.preventDefault()
      window.Competition.rounds.create({discipline: 'speed'}, {wait: true})

    add_time_round_click: (e) ->
      e.preventDefault()
      window.Competition.rounds.create({discipline: 'time'}, {wait: true})

    edit_event_click: (e) ->
      e.preventDefault()
      eventForm = new Skyderby.views.EventForm(model: @model)
      eventForm.render().open()

    add_sponsor_click: (e) ->
      e.preventDefault()
      new_sponsor = new Skyderby.models.Sponsor()
      sponsor_form = new Skyderby.views.SponsorForm(model: new_sponsor)
      sponsor_form.render().open()

    add_organizer_click: (e) ->
      e.preventDefault()
      new_organizer = new Skyderby.models.EventOrganizer()
      organizer_form = new Skyderby.views.EventOrganizerForm(model: new_organizer)
      organizer_form.render().open()

    setup_wind_cancellation: (e) ->
      e.preventDefault()
      view = new Skyderby.views.WeatherDataForm(
        parent_url: @model.url,
        can_manage: @can_manage
      )
      view.render().open()

    set_status_draft: (e) ->
      @set_status('draft', e)

    set_status_published: (e) ->
      @set_status('published', e)

    set_status_finished: (e) ->
      @set_status('finished', e)

    set_status: (status, event) ->
      event.preventDefault()
      @model.save({ status: status }, wait: true, error: fail_ajax_request)

    set_wind_cancellation_caption: ->
      template = @wind_cancellation_caption(
        wind_cancellation: @model.get('wind_cancellation')
        results_adjusted_for_wind: @results_adjusted_for_wind)

      @$('#event-wind-cancellation-caption').html(template)

    switch_results_mode: ->
      @results_adjusted_for_wind = !@results_adjusted_for_wind
      @trigger('change-results-mode', @results_adjusted_for_wind)
      @set_wind_cancellation_caption()
