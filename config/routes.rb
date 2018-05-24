require 'sidekiq/web'

Skyderby::Application.routes.draw do
  mount ActionCable.server, at: '/cable'

  draw :api
  draw :backward_compatibility
  draw :administrative
  draw :static
  draw :tracks
  draw :sponsors
  draw :organizers
  draw :flight_profiles
  draw :events
  draw :users_and_profiles
  draw :suits_and_manufacturers
  draw :places_and_countries
  draw :online_competitions
  draw :tournaments

  root 'static_pages#index'
end
