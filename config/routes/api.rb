namespace :api, module: :api, defaults: { format: :json } do
  namespace :v1, module: :v1 do
    resource :current_user, only: :show

    resources :profiles, only: %i[index show] do
      scope module: :profiles do
        collection do
          resource :current, only: :show
        end
      end
    end
    resources :virtual_competitions

    resources :countries, only: %i[index show]
    resources :places, only: %i[index show] do
      scope module: :places do
        collection do
          resources :exit_measurements, only: %i[index show]
        end
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

    resources :performance_competitions, only: :show do
      resources :rounds, module: :performance_competitions
      resources :competitors, module: :performance_competitions
      resources :categories, module: :performance_competitions
      resources :standings, only: :index, module: :performance_competitions
    end

    namespace :stats, module: :stats do
      resources :registrations, only: :index
    end
  end
end
