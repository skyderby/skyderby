concern :flight_profiles do
  resource :flight_profiles, only: :show do
    scope module: :flight_profiles do
      resources :tracks, only: :index
    end
  end
end
