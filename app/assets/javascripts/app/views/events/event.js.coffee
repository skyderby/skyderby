class Skyderby.views.EventView extends Backbone.View

    fa_fw_template: JST['app/templates/fa_fw']
    edit_commands: JST['app/templates/edit_commands']
    edit_event: JST['app/templates/edit_event']

    can_manage: false

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

    initialize: (opts) ->
      @can_manage = opts.can_manage if _.has(opts, 'can_manage')

      @scoreboard = new Skyderby.views.Scoreboard
        model: @model
        can_manage: @can_manage

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
      new_sponsor = new Skyderby.models.EventSponsor()
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
