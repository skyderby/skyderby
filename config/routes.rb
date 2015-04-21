TrackingDerby::Application.routes.draw do
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
    resources :event_tracks, only: [:create, :update, :destroy]
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
    match '/manage', to: 'static_pages#manage', as: :manage, via: :get

    resources :tracks, only: [:index, :new, :show, :edit, :update, :destroy] do
      collection do
        post 'choose'
        get 'upload_error'
      end
      member do
        get 'google_maps'
        get 'google_earth'
        get 'replay'
      end
    end
    # Backward compatibility
    match '/track/:id', to: 'tracks#show', via: :get

    resources :events
    resources :rounds
    resources :competitors
    resources :sections
    resources :event_tracks

    devise_for :users
    resources :users
    resources :user_profiles
    resources :badges

    resources :manufacturers
    resources :wingsuits

    resources :countries
    resources :places

    resources :virtual_competitions
    resources :virtual_comp_groups
    resources :virtual_comp_results

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302),
       as: :redirected_root
end
