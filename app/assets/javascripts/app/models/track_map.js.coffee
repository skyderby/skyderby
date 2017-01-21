class Skyderby.models.TrackMap extends Backbone.Model
  defaults:
    wind_cancellation: false
    points: []
    zerowind_points: []
    weather_data: []

  url: ->
    @track_url() + '/map'

  track_url: ->
    '/tracks/' + this.id

  get_wind_data: ->
    _.chain(@get('weather_data')).map((elem) ->
      {
        x: Number(elem.wind_direction),
        y: Math.round(elem.altitude / 100) / 10,       # round 1459   -> 1.5
        altitude: Math.round(elem.altitude / 10) * 10, # round 1459.5 -> 1460
        wind_speed: elem.wind_speed
      }
    ).reject((elem) ->
      elem.altitude > 5000
    ).value()
