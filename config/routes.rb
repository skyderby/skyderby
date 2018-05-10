require 'sidekiq/web'

Skyderby::Application.routes.draw do
  mount ActionCable.server, at: '/cable'

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
    resources :accounts, only: [:index, :show]
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
      resource :flight_profile, only: :show
      resource :jump_range, only: :show
      resource :altitude_data, only: :show

      collection do
        resources :select_options, only: :index
      end
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

  concern :organizable do
    resources :organizers, only: %i[new create destroy]
  end

  resources :events, concerns: %i[sponsorable organizable] do
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
      resources :event_tracks do
        scope module: :event_tracks do
          resource :jump_range, only: %i[show update]
          resource :penalty, only: %i[show update]
        end
      end

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
    scope module: :users do
      collection do
        resources :select_options, only: :index
      end
    end
  end

  resources :profiles do
    scope module: :profiles do
      resources :badges, only: [:new, :create]
      resources :tracks, only: :index
      resource :avatar, only: [:new, :create]
      resource :merge, only: [:new, :create]
      collection do
        resources :select_options, only: :index
      end
    end

    resource :flight_profiles, only: :show
  end
  resources :badges
  match '/user_profiles/:id', to: 'profiles#show', via: :get

  resources :manufacturers
  resources :suits do
    scope module: :suits do
      collection do
        resources :select_options, only: :index
      end
    end
  end
  match '/wingsuits/:id', to: 'suits#show',  via: :get
  match '/wingsuits',     to: 'suits#index', via: :get

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
    resource :flight_profiles, only: :show
  end

  resources :virtual_competitions, concerns: :sponsorable do
    scope module: :virtual_competitions do
      resource :person_details, only: :show
      resource :overall, only: :show
      resources :year, only: :show, param: :year
    end
  end
  resources :virtual_comp_groups
  resources :virtual_comp_results

  resources :tournaments, concerns: :sponsorable do
    scope module: :tournaments do
      resource :qualification, only: :show
      resources :qualification_rounds, only: %i[create destroy]
      resources :qualification_jumps, only: %i[new create show edit update destroy]

      resources :rounds, only: %i[create destroy] do
        resources :matches, only: :create
      end
      resources :tournament_competitors, path: :competitors
      resources :matches do
        scope module: :matches do
          resource :map, only: :show
          resource :globe, controller: 'globe', only: :show
          resources :slots
        end
      end
    end
  end

  root 'static_pages#index'

  namespace :api, module: :api do
    namespace :v1, module: :v1 do
      resources :profiles, only: :show
      resources :virtual_competitions
      resources :places do
        scope module: :places do
          collection do
            resources :exit_measurements, only: %i[index show]
          end
        end
      end
    end
  end
end
