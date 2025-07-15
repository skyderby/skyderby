require 'sidekiq/web'
require 'sidekiq/cron/web'

Skyderby::Application.routes.draw do
  mount ActionCable.server, at: '/cable'

  get '/up', to: 'rails/health#show'

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

  get '/events/:id/*path', to: redirect('/events/performance/%{id}/%{path}'), constraints: { id: /\d+/ }
  get '/events/:id', to: redirect('/events/performance/%{id}'), constraints: { id: /\d+/ }
  get '/tournaments/:id/*path', to: redirect('/events/tournaments/%{id}/%{path}'), constraints: { id: /\d+/ }
  get '/tournaments/:id', to: redirect('/events/tournaments/%{id}'), constraints: { id: /\d+/ }

  get '/track/:id', to: redirect('/tracks/%{id}'), constraints: { id: /\d+/ }
  get '/tracks/:id/google_maps', to: redirect('/tracks/%{id}/map'), constraints: { id: /\d+/ }
  get '/tracks/:id/google_earth', to: redirect('/tracks/%{id}/globe'), constraints: { id: /\d+/ }
  get '/tracks/:id/replay', to: redirect('/tracks/%{id}/video'), constraints: { id: /\d+/ }

  get '/user_profiles/:id', to: 'profiles#show'

  get '/wingsuits/:id', to: 'suits#show'
  get '/wingsuits', to: 'suits#index'
  get '/site.webmanifest', to: 'static_pages#site_webmanifest', defaults: { format: :json }

  get '/manage', to: 'manage/dashboards#show'

  get '/about', to: 'static_pages#about', as: :about

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

  resources :events, only: %i[index new]
  resources :performance_competitions, path: 'events/performance', only: :new
  resources :events, path: 'events/performance', concerns: %i[sponsorable organizable], except: %i[index new] do
    scope module: :events do
      resource :scoreboard, only: :show
      resource :designated_lane_start, only: :update

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

      resources :reference_points
      resource :deletion, only: [:new, :create]
      collection do
        resources :select_options, only: :index, as: :events_select_options
      end
    end

    scope module: :performance_competitions do
      resource :open_scoreboard, only: :show
      resources :task_scoreboards, only: %i[index show]
      resources :teams
      resources :team_competitors, only: %i[new create destroy]
      resources :lane_validations, only: %i[index show]

      resource :downloads, only: :show do
        scope module: :downloads do
          resource :team_standings, only: :show
        end
      end
    end
  end

  resources :speed_skydiving_competitions,
            path: '/events/speed_skydiving',
            concerns: %i[sponsorable organizable],
            except: :index do
    scope module: :speed_skydiving_competitions do
      resources :categories, except: %i[index show] do
        member do
          patch 'move_upper'
          patch 'move_lower'
        end
      end
      resources :competitors, except: %i[index show]
      resources :rounds, only: %i[create update destroy]
      resources :results, except: :index do
        scope module: :results do
          resource :penalties, only: %i[show new update]
          resource :jump_range, only: %i[show update]
          resource :iframe, only: :show
        end
      end
      resources :teams
      resources :team_competitors, only: %i[new create destroy]
      resource :status, only: :update
      resource :open_scoreboard, only: :show
      resource :downloads, only: :show do
        scope module: :downloads do
          resource :scoreboard, only: :show
          resource :open_event_scoreboard, only: :show
          resource :team_standings, only: :show
          resource :gps_recordings, only: :show
        end
      end
    end
  end

  resources :track_files, only: %i[new create show] do
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
      resource :jump_range, only: :show
      resource :altitude_data, only: :show
      resource :weather_data
      resource :points, only: :show

      collection do
        resource :upload, only: :new, as: :tracks_upload
        resources :select_options, only: :index, as: :tracks_select_options
      end
    end
  end

  resources :users do
    resource :masquerades, only: [:create, :destroy]
    scope module: :users do
      collection do
        resources :select_options, only: :index, as: :users_select_options
      end
    end
  end

  resources :profiles do
    scope module: :profiles do
      resources :badges, only: [:new, :create]
      resources :tracks, only: :index
      resources :videos, only: :index
      resource :avatar, only: [:new, :create]
      resource :merge, only: [:new, :create]
      collection do
        resources :select_options, only: :index, as: :profiles_select_options
      end
    end
  end
  resources :badges

  resources :exit_measurements, only: :show
  resource :flight_profiles, only: :show

  resources :manufacturers
  resources :suits, except: :index do
    collection do
      get '/', to: 'suits/overviews#show', constraints: ->(req) { req.params[:manufacturer_id].blank? }
      get '/', to: 'suits#index', constraints: ->(req) { req.params[:manufacturer_id].present? }
      resources :select_options, only: :index, as: :suits_select_options, module: :suits
    end
  end

  resources :countries do
    scope module: :countries do
      collection do
        resources :select_options, only: :index, as: :countries_select_options
      end
    end
  end

  resources :places do
    scope module: :places do
      resources :tracks, only: :index
      resources :videos, only: :index
      resources :jump_profiles
      resources :finish_lines
      resources :photos
      resource :stats, only: :show
      resource :weather_data, only: :show

      collection do
        resources :select_options,
                  only: :index, path: 'jump_profiles/select_options',
                  module: :jump_profiles, as: :places_jump_profiles_select_options
        resources :select_options, only: :index, as: :places_select_options
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
        resources :select_options, only: :index, as: :tournaments_select_options
      end
    end
  end

  get '/competition_series(*path)', to: redirect('/performance_competition_series%{path}'), defaults: { path: '' }

  resources :performance_competition_series, only: :show
  resources :speed_skydiving_competition_series, only: :show
  resources :donations
  resources :weather_fetching_logs, only: :index

  root 'static_pages#index'
end
