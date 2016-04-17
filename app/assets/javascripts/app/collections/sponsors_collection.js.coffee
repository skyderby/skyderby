class Skyderby.collections.Sponsors extends Backbone.Collection

  model: Skyderby.models.Sponsor

  initialize: (opts) ->
    @url = opts.parent_url + '/sponsors' if _.has(opts, 'parent_url')
