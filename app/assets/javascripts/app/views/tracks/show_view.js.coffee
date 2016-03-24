class Skyderby.views.TrackShowView extends Backbone.View

  can_manage: false

  events:
    'click #set-weather-data': 'set_weather_data'

  initialize: (opts) ->
    @can_manage = opts.can_manage if _.has(opts, 'can_manage')

  set_weather_data: (e) ->
    e.preventDefault()
    view = new Skyderby.views.WeatherDataForm(
      parent_url: @model.url(),
      can_manage: @can_manage,
      default_date: @model.get('default_weather_date')
    )
    view.render().open()
