class Skyderby.views.WeatherDatumForm extends Backbone.View

  template: JST['app/templates/weather_datum_form']

  tagName: 'tbody'

  events:
    'click .add-weather-datum': 'save'

  altitude_units: 'm'
  wind_speed_units: 'ms'

  unit_conversion: Skyderby.helpers.unit_conversion

  initialize: (opts) ->
    @default_date = opts.default_date if _.has(opts, 'default_date')
    @altitude_units = opts.altitude_units if _.has(opts, 'altitude_units')
    @wind_speed_units = opts.wind_speed_units if _.has(opts, 'wind_speed_units')
    @parent_view = opts.parent_view if _.has(opts, 'parent_view')

    if @parent_view
      @listenTo(@parent_view, 'set-altitude-units', @set_altitude_units)
      @listenTo(@parent_view, 'set-wind-speed-units', @set_wind_speed_units)

  render: ->
    template = @template
      default_date: @default_date
      altitude_units: @altitude_units
      wind_speed_units: @wind_speed_units

    @$el.html(template)
    this

  save: (e) ->
    e.preventDefault()
    model = new Skyderby.models.WeatherDatum()
    model.set(
      actual_on:      @$('input[name="weather_datum[actual_on]"]').val()
      altitude:       @convert_altitude(@$('input[name="weather_datum[altitude]"]').val())
      wind_speed:     @convert_wind_speed(@$('input[name="weather_datum[wind_speed]"]').val())
      wind_direction: @$('input[name="weather_datum[wind_direction]"]').val()
    )
    @collection.create(model, {wait: true, error: fail_ajax_request})

  set_altitude_units: (unit) ->
    @altitude_units = unit
    @$('.altitude-units-addon').text(I18n.t('units.' + @altitude_units))

  set_wind_speed_units: (unit) ->
    @wind_speed_units = unit
    @$('.wind-speed-units-addon').text(I18n.t('units.' + @wind_speed_units))

  convert_altitude: (model_altitude) ->
    altitude = switch
      when @altitude_units == 'm' then model_altitude
      when @altitude_units == 'ft' then @unit_conversion.ft_to_m(model_altitude)

  convert_wind_speed: (model_wind_speed) ->
    wind_speed = switch 
      when @wind_speed_units == 'ms'    then model_wind_speed
      when @wind_speed_units == 'knots' then @unit_conversion.knots_to_ms(model_wind_speed)
      when @wind_speed_units == 'kmh'   then @unit_conversion.kmh_to_ms(model_wind_speed)
      when @wind_speed_units == 'mph'   then @unit_conversion.mph_to_ms(model_wind_speed)
