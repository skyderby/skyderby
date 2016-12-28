require 'sidekiq/web'

Skyderby::Application.routes.draw do
  scope '/(:locale)', locale: /#{I18n.available_locales.join('|')}/ do
    # Static pages and routes
    match '/competitions', to: 'static_pages#competitions', as: :competitions, via: :get
    match '/about', to: 'static_pages#about', as: :about, via: :get
    get '/ping' => 'static_pages#ping'

    match '/manage', to: 'static_pages#manage', as: :manage, via: :get
    authenticate :user, lambda { |u| u.has_role? :admin } do
      mount Sidekiq::Web => '/manage/sidekiq'
    end

    resources :track_files, only: [:create, :show] do
      scope module: :track_files do
        resource :track, only: :create
      end
    end

    resources :tracks, only: [:index, :show, :edit, :update, :destroy] do
      scope module: :tracks do
        resource :map, only: :show
        resource :globe, controller: 'globe', only: :show
        resource :video, only: [:new, :edit, :show, :create, :update, :destroy]
        resource :results, only: :show
        resource :download, only: :show
      end

      resources :weather_data, only: [:index, :create, :update, :destroy]
    end
    # Backward compatibility
    match '/track/:id', to: 'tracks#show', via: :get
    match '/tracks/:track_id/google_maps', to: 'tracks/maps#show', via: :get
    match '/tracks/:track_id/google_earth', to: 'tracks/globe#show', via: :get
    match '/tracks/:track_id/replay', to: 'tracks/videos#show', via: :get

    resources :events do
      scope module: :events do
        resources :rounds do
          scope module: :rounds do
            resources :map, only: :index
          end
        end

        resources :sections do
          member do
            patch 'move_upper'
            patch 'move_lower'
          end
        end

        resources :competitors
        resources :event_tracks
        resources :event_organizers
      end

      resources :sponsors, only: [:new, :create, :destroy]
      resources :weather_data
    end

    devise_for :users
    resources :users
    resources :profiles do
      scope module: :profiles do
        resources :badges
      end
    end
    match '/user_profiles/:id', to: 'profiles#show', via: :get

    resources :manufacturers
    resources :wingsuits

    resources :countries do
      collection do
        scope module: :countries do
          resources :select_options, only: :index
        end
      end
    end
    resources :places

    resources :virtual_competitions do
      resources :sponsors, only: [:new, :create, :destroy]
    end
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

      resources :sponsors, only: [:new, :create, :destroy]
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
