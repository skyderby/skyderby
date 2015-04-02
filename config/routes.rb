TrackingDerby::Application.routes.draw do
  get 'virtual_competitions/index'

  get 'virtual_competitions/show'

  get 'places/index'

  get 'places/show'

  # AJAX locale independent actions
  namespace :api, default: { format: :json } do
    resources :events, only: [:update]
    resources :sections, only: [:create, :update, :destroy] do
      collection do
        post 'reorder'
      end
    end

    resources :competitors, only: [:create, :update, :destroy]
    resources :rounds, only: [:create, :update, :destroy]
    resources :round_tracks, only: [:create, :update, :destroy]
    resources :user_profiles, only: [:index, :update]
    resources :wingsuits, only: [:index]
    resources :tracks, only: [:index]

    get '/users/autocomplete'
    get '/wingsuits/autocomplete'
  end

  scope '/(:locale)', locale: /#{I18n.available_locales.join('|')}/ do
    # Static pages and routes
    match '/about', to: 'static_pages#about', as: :about, via: :get
    match '/terms', to: 'static_pages#terms', as: :terms, via: :get

    resources :tracks, only: [:index, :new, :show, :update, :destroy] do
      collection do
        post 'choose'
        get 'upload_error'
      end
      member do
        get 'edit'
        get 'google_maps'
        get 'google_earth'
      end
    end
    # Backward compatibility
    match '/track/:id', to: 'tracks#show', via: :get

    resources :events do
      resources :rounds
      resources :competitors
      resources :event_tracks

      member do
        get 'results'
      end
    end

    devise_for :users

    resources :users do
      resources :user_profile
    end

    resources :user_profile
    resources :places, only: [:index, :show]

    resources :virtual_competitions, only: [:index, :show]

    mount RailsAdmin::Engine => '/admin', as: 'rails_admin'

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302),
       as: :redirected_root
end
