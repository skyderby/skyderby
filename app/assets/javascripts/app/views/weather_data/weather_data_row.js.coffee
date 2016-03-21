class Skyderby.views.WeatherDataRow extends Backbone.View

  template: JST['app/templates/weather_data_row']

  tagName: 'tr'

  events:
    'click .weather-datum-delete': 'on_delete_click'

  can_manage: false

  initialize: (opts) ->
    @can_manage = opts.can_manage if _.has(opts, 'can_manage')
    @listenTo(@model, 'destroy', @destroy_weather_datum)

  render: ->
    params = _.extend(@model.toJSON(), can_manage: @can_manage)
    @$el.html(@template(params))
    this

  on_delete_click: (e) ->
    e.preventDefault()
    @model.destroy({wait: true, error: fail_ajax_request})

  destroy_weather_datum: ->
    @remove()
