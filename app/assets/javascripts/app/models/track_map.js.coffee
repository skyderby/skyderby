class Skyderby.models.TrackMap extends Backbone.Model
  defaults:
    wind_cancellation: false
    points: []
    zerowind_points: []
    weather_data: []

  url: ->
    @track_url() + '/google_maps'

  track_url: ->
    '/tracks/' + this.id

  get_wind_data: ->
    _.map(@get('weather_data'), (elem) ->
      {
        x: Number(elem.wind_direction),
        y: Math.round((elem.altitude / 1000) * 10) / 10,
        wind_speed: elem.wind_speed
      }
    )
