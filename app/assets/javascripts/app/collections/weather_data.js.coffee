class Skyderby.collections.WeatherData extends Backbone.Collection
  model: Skyderby.models.WeatherDatum

  initialize: (opts) ->
    @url = (opts.parent_url + '/weather_data') if _.has(opts, 'parent_url')

  comparator: (item) ->
    keys = ['actual_on', 'altitude']
    (item.get key for key in keys)
