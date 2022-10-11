require 'sidekiq/web'

Skyderby::Application.routes.draw do
  root 'react_app#show'

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

  devise_for :users,
             skip: [:sessions, :registrations, :passwords],
             controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  devise_scope :user do
    post '/api/users/sign_in', to: 'api/users/sessions#create'
    delete '/api/users/sign_out', to: 'api/users/sessions#destroy'

    post '/api/users', to: 'api/users/registrations#create'
    post '/api/users/passwords', to: 'api/users/passwords#create'
    put '/api/users/passwords', to: 'api/users/passwords#update'

    get '/users/new-password', to: 'react_app#show', as: :edit_user_password
  end

  get '/ping', to: proc { [200, {}, ['']] }

  namespace :api, module: :api, defaults: { format: :json } do
    namespace :v1, module: :v1 do
      resource :current_user, only: :show
      resources :contributions, only: :index do
        collection do
          resource :stats, only: :show, module: :contributions
        end
      end
      resources :users, only: %i[index show destroy]
      resources :profiles, only: %i[index show] do
        scope module: :profiles do
          collection do
            resource :current, only: :show
          end
        end
      end
      resources :virtual_competitions

      resources :countries, only: %i[index show]
      resources :places, only: %i[index show create update destroy] do
        scope module: :places do
          collection do
            resources :exit_measurements, only: %i[index show]
          end
          resource :stats, only: :show
        end
      end
      resources :terrain_profiles, only: %i[index show] do
        resource :measurements, only: :show, module: :terrain_profiles
      end

      resources :suits, only: %i[index show] do
        collection do
          resource :popularity, only: :show, module: :suits
          resource :stats, only: :show, module: :suits
        end
      end
      resources :manufacturers, only: %i[index show create update destroy]

      resources :videos, only: :index
      resources :tracks, only: %i[index create show update destroy] do
        scope module: :tracks do
          resource :points, only: :show
          resource :weather_data, only: :show
          resource :results, only: :show
          resource :video, only: %i[create show destroy]

          collection do
            resources :files, only: :create
          end
        end
      end

      resources :events, only: %i[index show] do
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

      resources :performance_competitions, only: %i[show create update] do
        scope module: :performance_competitions do
          resources :rounds, only: %i[index create update destroy]
          resources :competitors, only: %i[index create update destroy]
          resources :categories, only: %i[index create update destroy] do
            resource :position, only: :update, module: :categories
          end
          resources :results, only: %i[index show create update destroy] do
            resource :penalties, only: :update, module: :results
          end
          resources :reference_points, only: %i[index create update destroy]
          resources :reference_point_assignments, only: %i[index create]
          resources :teams, only: %i[index create update destroy]
          resource :standings, only: :show
          resource :team_standings, only: :show
        end
      end

      resources :speed_skydiving_competitions, only: %i[show create update] do
        scope module: :speed_skydiving_competitions do
          resources :rounds, only: %i[index create update destroy]
          resources :competitors, only: %i[index create update destroy]
          resources :categories, only: %i[index create update destroy] do
            resource :position, only: :update, module: :categories
          end
          resources :results, only: %i[index show create update destroy] do
            resource :penalties, only: :update, module: :results
          end
          resources :teams, only: %i[index create update destroy]
          resource :standings, only: :show
          resource :open_standings, only: :show
          resource :team_standings, only: :show
        end
      end

      namespace :stats, module: :stats do
        resources :registrations, only: :index
      end
    end
  end

  namespace :assets, module: :assets do
    resources :track_files, only: :show

    resources :speed_skydiving_competitions, only: [] do
      scope module: :speed_skydiving_competitions do
        resource :scoreboard, only: :show
        resource :open_event_scoreboard, only: :show
        resource :team_standings, only: :show
        resource :gps_recordings, only: :show
      end
    end
  end

  get '/(*path)', to: 'react_app#show'
end
