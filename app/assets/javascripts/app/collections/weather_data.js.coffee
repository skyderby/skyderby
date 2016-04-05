class Skyderby.collections.WeatherData extends Backbone.Collection
  model: Skyderby.models.WeatherDatum

  initialize: (opts) ->
    @url = (opts.parent_url + '/weather_data') if _.has(opts, 'parent_url')

  comparator: (first, second) ->
    switch
      when first.get('actual_on') > second.get('actual_on') then return 1
      when first.get('actual_on') < second.get('actual_on') then return -1
      when Number(first.get('altitude')) > Number(second.get('altitude')) then return 1
      when Number(first.get('altitude')) < Number(second.get('altitude')) then return -1
      else return 0
