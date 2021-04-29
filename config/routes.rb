require 'sidekiq/web'

Skyderby::Application.routes.draw do
  mount ActionCable.server, at: '/cable'

  devise_for :users, skip: [:sessions, :registrations], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }
  devise_scope :user do
    post '/api/users/sign_in', to: 'api/users/sessions#create'
    delete '/api/users/sign_out', to: 'api/users/sessions#destroy'

    post '/api/users', to: 'api/users/registrations#create'
  end

  draw :api
  get '/(*path)', to: 'react_app#show'

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

  get '/competition_series(*path)', to: redirect('/performance_competition_series%{path}'), defaults: { path: '' }

  resources :performance_competition_series, only: :show
  resources :speed_skydiving_competition_series, only: :show
  resources :speed_skydiving_competitions, only: :show

  root 'static_pages#index'
end
