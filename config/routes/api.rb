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
