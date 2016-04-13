class Skyderby.models.TournamentMatchMap extends Backbone.Model

  initialize: (opts) ->
    @tournament_id = opts.tournament_id if _.has(opts, 'tournament_id')

  url: ->
    '/tournaments/' + @tournament_id + '/matches/' + @id + '/map'
