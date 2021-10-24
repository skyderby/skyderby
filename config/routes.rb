require 'sidekiq/web'

Skyderby::Application.routes.draw do
  mount ActionCable.server, at: '/cable'

  # Backward compatibility routes
  # App used to have locale scoped routes
  locales = /en|ru|es|de|fr|it/
  get '/:locale/*path', to: redirect('/%{path}'), locale: locales, format: false
  get '/:locale', to: redirect('/'), locale: locales, format: false
  get '/track/*path', to: redirect('/tracks/%{path}'), defaults: { path: '' }
  get '/tracks/:id/google_maps', to: redirect('/tracks/%{id}/map')
  get '/tracks/:id/google_earth', to: redirect('/tracks/%{id}/globe')
  get '/tracks/:id/replay', to: redirect('/tracks/%{id}/video')
  get '/user_profiles/:id', to: redirect('/profiles/%{id}')
  get '/virtual_competitions(*path)', to: redirect('/online_rankings%{path}'), defaults: { path: '' }
  get '/wingsuits(*path)', to: redirect('/suits%{path}'), defaults: { path: '' }

  devise_for :users, skip: [:sessions, :registrations], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }
  devise_scope :user do
    post '/api/users/sign_in', to: 'api/users/sessions#create'
    delete '/api/users/sign_out', to: 'api/users/sessions#destroy'

    post '/api/users', to: 'api/users/registrations#create'
  end

  get '/ping', to: proc { [200, {}, ['']] }

  draw :api
  get '/(*path)', to: 'react_app#show'

  draw :administrative
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
