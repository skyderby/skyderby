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

  # React App
  match '/tracks(/*path)', to: 'react_app#show', via: :get
  match '/flight_profiles(/*)', to: 'react_app#show', via: :get
  match '/suits(/*path)', to: 'react_app#show', via: :get

  draw :api
  match '/(*path)', to: 'react_app#show', via: :get
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
