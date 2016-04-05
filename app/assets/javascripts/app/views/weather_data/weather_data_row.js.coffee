class Skyderby.views.WeatherDataRow extends Backbone.View

  template: JST['app/templates/weather_data_row']

  tagName: 'tr'

  events:
    'click .weather-datum-delete': 'on_delete_click'

  can_manage: false

  unit_conversion: Skyderby.helpers.unit_conversion

  initialize: (opts) ->
    @can_manage       = opts.can_manage       if _.has(opts, 'can_manage')
    @parent_view      = opts.parent_view      if _.has(opts, 'parent_view')
    @altitude_units   = opts.altitude_units   if _.has(opts, 'altitude_units')
    @wind_speed_units = opts.wind_speed_units if _.has(opts, 'wind_speed_units')

    @listenTo(@model, 'destroy', @destroy_weather_datum)
    @listenTo(@parent_view, 'set-altitude-units', @set_altitude_units)
    @listenTo(@parent_view, 'set-wind-speed-units', @set_wind_speed_units)

  render: ->
    params = _.extend(@model.toJSON(), can_manage: @can_manage)
    params.altitude   = @get_model_altitude()
    params.wind_speed = @get_model_wind_speed()
    @$el.html(@template(params))
    this

  on_delete_click: (e) ->
    e.preventDefault()
    @model.destroy({wait: true, error: fail_ajax_request})

  destroy_weather_datum: ->
    @remove()

  set_altitude_units: (unit) ->
    @altitude_units = unit
    @$('.weather-datum-altitude').text(@get_model_altitude())

  set_wind_speed_units: (unit) ->
    @wind_speed_units = unit
    @$('.weather-datum-wind-speed').text(@get_model_wind_speed())

  get_model_altitude: ->
    model_altitude = Number(@model.get('altitude'))
    altitude = switch
      when @altitude_units == 'm' then model_altitude
      when @altitude_units == 'ft' then @unit_conversion.m_to_ft(model_altitude)

    altitude.toFixed(0)

  get_model_wind_speed: ->
    model_wind_speed = Number(@model.get('wind_speed'))
    wind_speed = switch 
      when @wind_speed_units == 'ms'    then model_wind_speed
      when @wind_speed_units == 'knots' then @unit_conversion.ms_to_knots(model_wind_speed)
      when @wind_speed_units == 'kmh'   then @unit_conversion.ms_to_kmh(model_wind_speed)
      when @wind_speed_units == 'mph'   then @unit_conversion.ms_to_mph(model_wind_speed)

    wind_speed.toFixed(1)
