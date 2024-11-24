require 'sidekiq/web'

Skyderby::Application.routes.draw do
  mount ActionCable.server, at: '/cable'

  # Backward compatibility, app used to have locale in path, like
  # /ru/controller/
  # /en/controller/
  get '/:locale/*path',
      to: redirect('/%{path}', status: 302),
      locale: /#{I18n.available_locales.join('|')}/,
      format: false

  get '/:locale',
      to: redirect('/', status: 302),
      locale: /#{I18n.available_locales.join('|')}/,
      format: false

  get '/events/:id/*path', to: redirect('/events/performance_competitions/%{id}/%{path}'), constraints: { id: /\d+/ }
  get '/events/:id', to: redirect('/events/performance_competitions/%{id}'), constraints: { id: /\d+/ }
  get '/tournaments/:id/*path', to: redirect('/events/tournaments/%{id}/%{path}'), constraints: { id: /\d+/ }
  get '/tournaments/:id', to: redirect('/events/tournaments/%{id}'), constraints: { id: /\d+/ }

  get '/track/:id', to: redirect('/tracks/%{id}'), constraints: { id: /\d+/ }
  get '/tracks/:id/google_maps', to: redirect('/tracks/%{id}/map'), constraints: { id: /\d+/ }
  get '/tracks/:id/google_earth', to: redirect('/tracks/%{id}/globe'), constraints: { id: /\d+/ }
  get '/tracks/:id/replay', to: redirect('/tracks/%{id}/video'), constraints: { id: /\d+/ }

  get '/user_profiles/:id', to: 'profiles#show'

  get '/wingsuits/:id', to: 'suits#show'
  get '/wingsuits', to: 'suits#index'

  get '/manage', to: 'manage/dashboards#show'

  get '/about', to: 'static_pages#about', as: :about
  get '/ping' => 'static_pages#ping'

  devise_for :users,
             controllers: { omniauth_callbacks: 'users/omniauth_callbacks',
                            registrations: 'users/registrations' }

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web => '/manage/sidekiq'
  end

  scope module: :manage do
    resources :missing_places, only: :index
    resources :accounts, only: [:index, :show]
  end

  concern :flight_profiles do
    resource :flight_profiles, only: :show do
      scope module: :flight_profiles do
        resources :tracks, only: :index
      end
    end
  end

  concern :sponsorable do
    resources :sponsors, only: [:new, :create, :destroy]
    scope module: :sponsors do
      resource :sponsors_copy, only: [:new, :create]
    end
  end

  concern :organizable do
    resources :organizers, only: %i[new create destroy]
  end

  namespace :api, module: :api, defaults: { format: :json } do
    namespace :v1, module: :v1 do
      resources :profiles, only: :show do
        scope module: :profiles do
          collection do
            resource :current, only: :show
          end
        end
      end
      resources :virtual_competitions
      resources :places do
        scope module: :places do
          collection do
            resources :exit_measurements, only: %i[index show]
          end
        end
      end

      resources :suits, only: :index

      resources :tracks, only: [] do
        scope module: :tracks do
          resource :points, only: :show
        end
      end

      resources :events, only: :show do
        scope module: :events do
          resource :scoreboard, only: :show

          resources :rounds, only: [:index, :show] do
            scope module: :rounds do
              resources :reference_point_assignments, only: :create
            end
          end
          resources :competitors, only: :index
          resources :results, only: %i[index create] do
            resource :penalty, only: :update, module: :results
          end
          resources :reference_points, only: :index
          resources :teams, only: %i[index create update destroy]
        end
      end

      namespace :stats, module: :stats do
        resources :registrations, only: :index
      end
    end
  end

  resources :events, only: :index
  resources :events, path: 'events/performance_competitions', concerns: %i[sponsorable organizable], except: :index do
    scope module: :events do
      resource :scoreboard, only: :show
      resource :team_scoreboard, only: :show
      resource :teams, only: :show

      resources :rounds do
        scope module: :rounds do
          resource :map, only: :show do
            resources :penalties, only: %i[show update], module: :maps
          end
          resource :globe, controller: 'globe', only: :show
          resource :replay, only: :show
          resource :reference_point_assignments, only: %i[create destroy]
        end
      end

      resources :sections do
        member do
          patch 'move_upper'
          patch 'move_lower'
        end
      end

      resources :competitors
      resources :results do
        scope module: :results do
          resource :jump_range, only: %i[show update]
          resource :penalty, only: %i[show update]
          resource :map, only: :show
        end
      end

      resource :reference_points
      resource :deletion, only: [:new, :create]
      collection do
        resources :select_options, only: :index
      end
    end
  end

  resources :speed_skydiving_competitions, path: '/events/speed_skydiving', except: :index

  resources :track_files, only: [:create, :show] do
    scope module: :track_files do
      resource :track, only: :create
    end
  end

  resources :tracks, only: [:index, :show, :edit, :update, :destroy] do
    scope module: :tracks do
      resource :ownership, only: [:show, :update]
      resource :map, only: :show
      resource :globe, controller: 'globe', only: :show
      resource :video, only: [:new, :edit, :show, :create, :update, :destroy] do
        resource :chart_data, only: :show, module: :videos
      end
      resource :results, only: :show
      resource :download, only: :show
      resource :flight_profile, only: :show
      resource :jump_range, only: :show
      resource :altitude_data, only: :show
      resource :weather_data

      collection do
        resource :upload, only: :new, as: :tracks_upload
        resources :select_options, only: :index
      end
    end
  end

  resources :users do
    resource :masquerades, only: [:new, :destroy]
    scope module: :users do
      collection do
        resources :select_options, only: :index
      end
    end
  end

  resources :profiles, concerns: :flight_profiles do
    scope module: :profiles do
      resources :badges, only: [:new, :create]
      resources :tracks, only: :index
      resource :avatar, only: [:new, :create]
      resource :merge, only: [:new, :create]
      collection do
        resources :select_options, only: :index
      end
    end
  end
  resources :badges

  resources :manufacturers
  resources :suits do
    scope module: :suits do
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

  resources :places, concerns: :flight_profiles do
    scope module: :places do
      resources :jump_profiles
      resources :finish_lines
      resources :photos
      resource :preview, only: :show

      collection do
        resources :select_options, only: :index
      end
    end

    resources :weather_data, only: [:index]
  end

  resources :virtual_competitions, concerns: :sponsorable do
    scope module: :virtual_competitions do
      collection do
        resources :groups, as: :virtual_competition_groups
      end

      resource :person_details, only: :show
      resource :overall, only: :show
      resources :year, only: :show, param: :year
      resources :periods, only: :show
    end
  end
  resources :virtual_comp_results

  resources :tournaments, path: 'events/tournaments', concerns: [:sponsorable, :organizable], except: :index do
    scope module: :tournaments do
      resource :qualification, only: :show do
        scope module: :qualifications do
          resources :rounds, only: %i[create destroy]

          resources :results, except: :index do
            scope module: :results do
              resource :jump_range, only: %i[show update]
            end
          end
        end
      end

      resources :rounds, only: %i[create destroy] do
        resources :matches, only: :create
      end
      resources :competitors
      resources :matches do
        scope module: :matches do
          resource :map, only: :show
          resource :globe, controller: 'globe', only: :show
          resources :slots do
            scope module: :slots do
              resource :result, only: %i[new create show update destroy]
              resource :jump_range, only: %i[show update]
            end
          end
        end
      end

      collection do
        resources :select_options, only: :index
      end
    end
  end

  get '/competition_series(*path)', to: redirect('/performance_competition_series%{path}'), defaults: { path: '' }

  resources :performance_competition_series, only: :show
  resources :speed_skydiving_competition_series,  only: :show

  root 'static_pages#index'
end
