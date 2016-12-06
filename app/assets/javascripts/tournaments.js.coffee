$(document).on 'ready turbolinks:load', ->
  if $('.tournament-show').length
    view = new Skyderby.views.TournamentView(el: '.tournament-show')
  else if $('#tournament-form').length
    view = new Skyderby.views.TournamentFormView(el: '#tournament-form')
