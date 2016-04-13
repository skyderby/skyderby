$(document).on 'ready page:load', ->
  if $('.tournament-show')
    view = new Skyderby.views.TournamentView(el: '.tournament-show')
