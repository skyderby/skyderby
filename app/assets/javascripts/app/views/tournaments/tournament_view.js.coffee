class Skyderby.views.TournamentView extends Backbone.View

  events:
    'click .tournament-match-map': 'show_match_map'

  show_match_map: (event) ->
    el = $(event.currentTarget)
    tournament_id = el.data('tournament-id')
    match_id = el.data('match-id')

    model = new Skyderby.models.TournamentMatchMap(
      id: match_id,
      tournament_id: tournament_id)

    view = new Skyderby.views.TournamentMatchMap(model: model)
    view.render().open()
