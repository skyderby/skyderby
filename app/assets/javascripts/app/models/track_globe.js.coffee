class Skyderby.models.TrackGlobe extends Backbone.Model
  defaults:
    points: [],
    nearby_places: []

  url: ->
    @track_url() + '/globe'

  track_url: ->
    '/tracks/' + this.id
