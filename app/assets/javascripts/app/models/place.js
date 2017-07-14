Skyderby.models.Place = Backbone.Model.extend({

  urlRoot: '/places',

  defaults: {
    name: '',
    latitude: '',
    longitude: '',
    msl: null
  }

});
