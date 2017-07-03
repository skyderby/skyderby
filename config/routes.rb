require 'sidekiq/web'

Skyderby::Application.routes.draw do
  # Backward compatibility, app used to have locale in path, like
  # /ru/controller/
  # /en/controller/
  get '/:locale/*path', to: redirect('/%{path}', status: 302),
                        locale: /#{I18n.available_locales.join('|')}/,
                        format: false

  get '/:locale', to: redirect('/', status: 302),
                  locale: /#{I18n.available_locales.join('|')}/,
                  format: false

  # Static pages and routes
  match '/competitions', to: 'static_pages#competitions', as: :competitions, via: :get
  match '/about', to: 'static_pages#about', as: :about, via: :get
  get '/ping' => 'static_pages#ping'

  get '/manage', to: 'manage/dashboards#show'
  authenticate :user, lambda { |u| u.has_role? :admin } do
    mount Sidekiq::Web => '/manage/sidekiq'
  end
  scope module: :manage do
    resources :missing_places, only: :index
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

    resources :weather_data
  end
  # Backward compatibility
  match '/track/:id', to: 'tracks#show', via: :get
  match '/tracks/:track_id/google_maps', to: 'tracks/maps#show', via: :get
  match '/tracks/:track_id/google_earth', to: 'tracks/globe#show', via: :get
  match '/tracks/:track_id/replay', to: 'tracks/videos#show', via: :get

  concern :sponsorable do
    resources :sponsors, only: [:new, :create, :destroy]
    scope module: :sponsors do
      resource :sponsors_copy, only: [:new, :create]
    end
  end

  resources :events, concerns: :sponsorable do
    scope module: :events do
      resources :rounds do
        scope module: :rounds do
          resource :map, only: :show
          resource :globe, controller: 'globe', only: :show
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

      resource :deletion, only: [:new, :create]
      collection do
        resources :select_options, only: :index
      end
    end

    resources :weather_data
  end

  devise_for :users
  resources :users do
    resource :masquerades, only: [:new, :destroy]
  end
  resources :profiles do
    scope module: :profiles do
      resources :badges
      resource :avatar, only: [:new, :create]
      resource :merge, only: [:new, :create]
      collection do
        resources :select_options, only: :index
      end
    end
  end
  match '/user_profiles/:id', to: 'profiles#show', via: :get

  resources :manufacturers
  resources :wingsuits do
    scope module: :wingsuits do
      collection do
        resources :select_options, only: :index
      end
    end
  end

  resources :countries do
    scope module: :countries do
      collection do
        resources :select_options, only: :index
      end
    end
  end
  resources :places do
    scope module: :places do
      collection do
        resources :select_options, only: :index
      end
    end
    resources :weather_data, only: [:index]
  end

  resources :virtual_competitions, concerns: :sponsorable do
    scope module: :virtual_competitions do
      resource :person_details, only: :show
    end
  end
  resources :virtual_comp_groups
  resources :virtual_comp_results

  resources :tournaments, concerns: :sponsorable do
    scope module: :tournaments do
      resource :qualification, only: :show
      resources :qualification_rounds, only: :create
      resources :qualification_jumps, only: %i[new create edit update]
      resources :rounds, only: [:create, :destroy] do
        resources :matches, only: :create
      end
      resources :tournament_competitors, path: :competitors
      resources :matches do
        scope module: :matches do
          resource :map, only: :show
          resource :globe, controller: 'globe', only: :show
          resources :competitors
        end
      end
    end
  end

  root 'static_pages#index'

  namespace :api, default: { format: :json } do
    namespace :v1 do
      defaults format: :json do
        resources :virtual_competitions
      end
    end
  end
end
