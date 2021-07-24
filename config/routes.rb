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
  namespace :assets do
    namespace :link_previews do
      resources :tracks, only: :show
    end
  end
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

  resources :competition_series, only: :show

  root 'static_pages#index'
end
