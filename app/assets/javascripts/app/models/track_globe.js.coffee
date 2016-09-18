class Skyderby.models.TrackGlobe extends Backbone.Model
  defaults:
    points: []

  url: ->
    @track_url() + '/globe'

  track_url: ->
    '/tracks/' + this.id
