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
