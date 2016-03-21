class Skyderby.views.WeatherDatumForm extends Backbone.View

  template: JST['app/templates/weather_datum_form']

  tagName: 'tbody'

  events:
    'click .add-weather-datum': 'save'

  render: ->
    @$el.html(@template())
    this

  save: (e) ->
    e.preventDefault()
    model = new Skyderby.models.WeatherDatum()
    model.set(
      actual_on:      @$('input[name="weather_datum[actual_on]"]').val()
      altitude:       @$('input[name="weather_datum[altitude]"]').val()
      wind_speed:     @$('input[name="weather_datum[wind_speed]"]').val()
      wind_direction: @$('input[name="weather_datum[wind_direction]"]').val()
    )
    @collection.create(model, {wait: true, error: fail_ajax_request})
