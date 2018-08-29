namespace :api, module: :api do
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

    resources :events, only: [] do
      scope module: :events do
        resources :rounds, only: :index
        resources :competitors, only: :index
        resources :results, only: %i[index create]
        resources :reference_point_assignments, only: :create
      end
    end
  end
end
