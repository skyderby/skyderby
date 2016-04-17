require 'sidekiq/web'

Skyderby::Application.routes.draw do
  scope '/(:locale)', locale: /#{I18n.available_locales.join('|')}/ do
    # Static pages and routes
    match '/competitions', to: 'static_pages#competitions', as: :competitions, via: :get
    match '/about', to: 'static_pages#about', as: :about, via: :get
    match '/terms', to: 'static_pages#terms', as: :terms, via: :get

    match '/manage', to: 'static_pages#manage', as: :manage, via: :get
    authenticate :user, lambda { |u| u.has_role? :admin } do
      mount Sidekiq::Web => '/manage/sidekiq'
    end

    resources :tracks, only: [:index, :create, :show, :edit, :update, :destroy] do
      collection do
        post 'choose'
      end

      member do
        get 'google_earth'
        get 'replay'
      end

      resources :weather_data, only: [:index, :create, :update, :destroy]

      scope module: :tracks do
        resources :google_maps, only: :index
      end
    end
    # Backward compatibility
    match '/track/:id', to: 'tracks#show', via: :get

    resources :events do
      scope module: :events do
        resources :rounds do
          scope module: :rounds do
            resources :map, only: :index
          end
        end
      end

      resources :sections, only: [:create, :update, :destroy] do
        collection do
          post 'reorder'
        end
      end

      resources :competitors
      resources :event_tracks
      resources :event_organizers, only: [:create, :destroy]
      resources :sponsors, only: [:new, :create, :destroy]
      resources :weather_data, only: [:index, :create, :update, :destroy]
    end

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

    resources :tournaments do
      scope module: :tournaments do
        resources :rounds
        resources :competitors
        resources :matches do
          scope module: :matches do
            resources :map, only: :index
            resources :competitors
          end
        end
      end
    end

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302),
       as: :redirected_root

  namespace :api, default: { format: :json } do
    namespace :v1 do
      defaults format: :json do
        resources :virtual_competitions
      end
    end
  end
end
