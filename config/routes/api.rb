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
