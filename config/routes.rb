TrackingDerby::Application.routes.draw do

  get '/users/autocomplete'

  scope "/(:locale)", locale: /#{I18n.available_locales.join("|")}/ do

    match '/tracks', :to  => 'tracks#index', :as => :track, :via => :get
    match '/track/:id', :to => 'tracks#show', :as => :show_track, :via => :get
    match '/tracks/new', :to => 'tracks#new', :as => :new_track, :via => [:get, :post]

    match '/select_track', :to => 'track_select#track_select', :as => :track_select, :via => [:post, :get]

    match '/about', :to => 'static_pages#about', :as => :about, :via => :get
    match '/upload_error', :to => 'static_pages#upload_error', :as => :upload_error, :via => :get

    resources :disciplines

    resources :events do
      resources :organizers
      resources :rounds
      resources :competitors
      resources :event_tracks
    end

    get '/:locale' => 'static_pages#index'

    devise_for :users

    resources :users, :only => :show do
      resources :user_wingsuits
    end

    mount RailsAdmin::Engine => '/admin', as: 'rails_admin'

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302), as: :redirected_root

end
