class Skyderby.views.WeatherDataForm extends Backbone.View

  template: JST['app/templates/weather_data_form']

  tagName: 'div'

  className: 'modal-dialog modal-lg'

  can_manage: false

  altitude_units: 'm'
  wind_speed_units: 'ms'

  events: 
    'click .altitude-units-set-m' : 'set_altitude_units_m'
    'click .altitude-units-set-ft': 'set_altitude_units_ft'
    'click .wind-units-set-ms'    : 'set_wind_speed_units_ms' 
    'click .wind-units-set-knots' : 'set_wind_speed_units_knots' 
    'click .wind-units-set-kmh'   : 'set_wind_speed_units_kmh'  
    'click .wind-units-set-mph'   : 'set_wind_speed_units_mph'  

  initialize: (opts) ->
    @modalView = new Skyderby.views.ModalView
    @collection = new Skyderby.collections.WeatherData(parent_url: opts.parent_url)
    @collection.on('reset add', @render_table, this)
    @collection.fetch(reset: true)

    @can_manage = opts.can_manage if _.has(opts, 'can_manage')
    @default_date = opts.default_date if _.has(opts, 'default_date')

  render: ->
    template = @template
      title: I18n.t('weather_datum.modal_title')
      altitude_units: @altitude_units
      wind_speed_units: @wind_speed_units

    @modalView.$el.html(@$el.html(template))

    # @listenTo(@modalView, 'modal:shown', @onModalShown);
    @listenTo(@modalView, 'modal:hidden', @on_modal_hidden);
    this

  open: ->
    @modalView.show()
    this

  on_modal_hidden: ->
    @$el.remove()

  render_table: ->
    table = @$('#weather-table')
    table.find('tbody').remove()
    tbody = @$('#weather-table').append('<tbody>')
    @collection.each (row) =>
      row_view = new Skyderby.views.WeatherDataRow
        model: row
        can_manage: @can_manage
        altitude_units: @altitude_units
        wind_speed_units: @wind_speed_units
        parent_view: this
      row_view.render()
      tbody.append(row_view.el)

    if @can_manage
      weather_datum_form = new Skyderby.views.WeatherDatumForm
        collection: @collection,
        default_date: @default_date,
        parent_view: this

      weather_datum_form.render()
      table.append(weather_datum_form.el)

  set_altitude_units_m: (event) ->
    @set_altitude_units(event, 'm');

  set_altitude_units_ft: (event) ->
    @set_altitude_units(event, 'ft');

  set_altitude_units: (event, unit) ->
    event.preventDefault()
    @altitude_units = unit
    @trigger('set-altitude-units', @altitude_units)
    @$('.altitude-units span').text(
      I18n.t('weather_datum.altitude_units') + ': ' + I18n.t('units.' + @altitude_units)
    )

  set_wind_speed_units_ms: (event) ->
    @set_wind_speed_units(event, 'ms')

  set_wind_speed_units_knots: (event) ->
    @set_wind_speed_units(event, 'knots')

  set_wind_speed_units_kmh: (event) ->
    @set_wind_speed_units(event, 'kmh')

  set_wind_speed_units_mph: (event) ->
    @set_wind_speed_units(event, 'mph')

  set_wind_speed_units: (event, unit) ->
    event.preventDefault()
    @wind_speed_units = unit
    @trigger('set-wind-speed-units', @wind_speed_units)
    @$('.wind-speed-units span').text(I18n.t('weather_datum.wind_speed_units') + ': ' + I18n.t('units.' + @wind_speed_units))
