class Skyderby.models.Track extends Backbone.Model

  urlRoot: '/' + I18n.currentLocale() + '/tracks'

  defaults: {
    points: []
  }
